/**
 * Authentication Routes
 * Login, registration, password management
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const db = require('../../config/database');
const { authenticate, generateToken, generateRefreshToken } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// ============================================================================
// VALIDATION
// ============================================================================

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }
  next();
};

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /auth/login
 * Login with email and password
 */
router.post('/login', loginValidation, validate, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const result = await db.query(
    'SELECT * FROM accounts WHERE email = $1 AND is_active = true',
    [email]
  );

  if (result.rows.length === 0) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const user = result.rows[0];

  // Check password
  if (!user.password_hash) {
    throw new ApiError(401, 'Account does not have a password set. Please contact support.');
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Update last login
  await db.query(
    'UPDATE accounts SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  // Generate tokens
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  logger.info('User logged in', { userId: user.id, email: user.email });

  const { password_hash: _, ...userData } = user;

  res.json({
    status: 'success',
    data: {
      user: userData,
      token,
      refreshToken,
    },
  });
}));

/**
 * POST /auth/register
 * Register new customer account
 */
router.post('/register', registerValidation, validate, asyncHandler(async (req, res) => {
  const { email, password, name, phone } = req.body;

  // Check if email exists
  const existing = await db.query('SELECT id FROM accounts WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  // Hash password
  const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
  const passwordHash = await bcrypt.hash(password, rounds);

  // Create account
  const result = await db.query(`
    INSERT INTO accounts (email, password_hash, name, phone, role, email_verified)
    VALUES ($1, $2, $3, $4, 'customer', false)
    RETURNING *
  `, [email, passwordHash, name, phone || null]);

  const user = result.rows[0];

  // Generate tokens
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  logger.info('User registered', { userId: user.id, email: user.email });

  const { password_hash: _, ...userData } = user;

  res.status(201).json({
    status: 'success',
    data: {
      user: userData,
      token,
      refreshToken,
    },
  });
}));

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token is required');
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (decoded.type !== 'refresh') {
      throw new ApiError(401, 'Invalid refresh token');
    }

    // Get user
    const result = await db.query(
      'SELECT * FROM accounts WHERE id = $1 AND is_active = true',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(401, 'User not found');
    }

    const user = result.rows[0];

    // Generate new tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      status: 'success',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
}));

/**
 * GET /auth/me or /auth/profile
 * Get current user info
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT 
      a.*,
      dz.name as delivery_zone_name
    FROM accounts a
    LEFT JOIN delivery_zones dz ON a.delivery_zone_id = dz.id
    WHERE a.id = $1
  `, [req.user.id]);

  const { password_hash: _, ...user } = result.rows[0];

  res.json({
    status: 'success',
    data: user,
  });
});

// Register both /me and /profile endpoints
router.get('/me', authenticate, getCurrentUser);
router.get('/profile', authenticate, getCurrentUser);

/**
 * PUT /auth/me
 * Update current user info
 */
router.put('/me', authenticate, asyncHandler(async (req, res) => {
  const { name, phone, address, city, state, zip_code, delivery_zone_id } = req.body;

  const result = await db.query(`
    UPDATE accounts SET
      name = COALESCE($1, name),
      phone = COALESCE($2, phone),
      address = COALESCE($3, address),
      city = COALESCE($4, city),
      state = COALESCE($5, state),
      zip_code = COALESCE($6, zip_code),
      delivery_zone_id = $7,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *
  `, [name, phone, address, city, state, zip_code, delivery_zone_id || null, req.user.id]);

  const { password_hash: _, ...user } = result.rows[0];

  res.json({
    status: 'success',
    data: user,
  });
}));

/**
 * PUT /auth/password
 * Change password
 */
router.put('/password', authenticate, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters');
  }

  // Get current user with password
  const result = await db.query('SELECT * FROM accounts WHERE id = $1', [req.user.id]);
  const user = result.rows[0];

  // Verify current password if one exists
  if (user.password_hash) {
    if (!currentPassword) {
      throw new ApiError(400, 'Current password is required');
    }
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }
  }

  // Hash new password
  const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
  const passwordHash = await bcrypt.hash(newPassword, rounds);

  await db.query(
    'UPDATE accounts SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [passwordHash, req.user.id]
  );

  logger.info('Password changed', { userId: req.user.id });

  res.json({
    status: 'success',
    message: 'Password updated successfully',
  });
}));

/**
 * POST /auth/logout
 * Logout (client-side token deletion, but we log it)
 */
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  logger.info('User logged out', { userId: req.user.id });

  res.json({
    status: 'success',
    message: 'Logged out successfully',
  });
}));

module.exports = router;
