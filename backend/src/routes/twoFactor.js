/**
 * Two-Factor Authentication Routes (TOTP)
 * Setup, verify, and manage TOTP-based 2FA
 */

const express = require('express');
const crypto = require('crypto');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');

const db = require('../../config/database');
const { authenticate } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ============================================================================
// CONSTANTS
// ============================================================================

const RECOVERY_CODE_COUNT = 8;
const APP_NAME = 'Hood Family Farms';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Generate a set of single-use recovery codes
 */
function generateRecoveryCodes() {
  const codes = [];
  for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
    // 8-character alphanumeric codes, grouped as xxxx-xxxx
    const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
  }
  return codes;
}

/**
 * Hash recovery codes for storage
 */
async function hashRecoveryCodes(codes) {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
  const hashed = await Promise.all(
    codes.map(code => bcrypt.hash(code, rounds))
  );
  return hashed;
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /2fa/status
 * Check if 2FA is enabled for the current user
 */
router.get('/status', asyncHandler(async (req, res) => {
  const result = await db.query(
    'SELECT totp_enabled, totp_verified_at FROM accounts WHERE id = $1',
    [req.user.id]
  );

  const account = result.rows[0];

  res.json({
    status: 'success',
    data: {
      enabled: account.totp_enabled,
      verifiedAt: account.totp_verified_at,
    },
  });
}));

/**
 * POST /2fa/setup
 * Generate a new TOTP secret and QR code for setup
 * Does NOT enable 2FA — user must verify with /2fa/verify-setup first
 */
router.post('/setup', asyncHandler(async (req, res) => {
  // Check if already enabled
  const existing = await db.query(
    'SELECT totp_enabled FROM accounts WHERE id = $1',
    [req.user.id]
  );

  if (existing.rows[0].totp_enabled) {
    throw new ApiError(400, 'Two-factor authentication is already enabled. Disable it first to reconfigure.');
  }

  // Generate secret
  const secret = authenticator.generateSecret();

  // Store secret (not yet enabled)
  await db.query(
    'UPDATE accounts SET totp_secret = $1, totp_enabled = false WHERE id = $2',
    [secret, req.user.id]
  );

  // Build otpauth URI
  const otpauthUrl = authenticator.keyuri(req.user.email, APP_NAME, secret);

  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  logger.info('2FA setup initiated', { userId: req.user.id });

  res.json({
    status: 'success',
    data: {
      secret,
      qrCode: qrCodeDataUrl,
      otpauthUrl,
    },
  });
}));

/**
 * POST /2fa/verify-setup
 * Verify a TOTP code to confirm setup and enable 2FA
 * Body: { code: "123456" }
 */
router.post('/verify-setup', asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    throw new ApiError(400, 'Verification code is required');
  }

  // Get the pending secret
  const result = await db.query(
    'SELECT totp_secret, totp_enabled FROM accounts WHERE id = $1',
    [req.user.id]
  );

  const account = result.rows[0];

  if (!account.totp_secret) {
    throw new ApiError(400, 'No 2FA setup in progress. Call /2fa/setup first.');
  }

  if (account.totp_enabled) {
    throw new ApiError(400, 'Two-factor authentication is already enabled.');
  }

  // Verify the code
  const isValid = authenticator.verify({ token: code, secret: account.totp_secret });

  if (!isValid) {
    throw new ApiError(400, 'Invalid verification code. Please try again.');
  }

  // Generate recovery codes
  const recoveryCodes = generateRecoveryCodes();
  const hashedCodes = await hashRecoveryCodes(recoveryCodes);

  // Enable 2FA
  await db.query(
    `UPDATE accounts 
     SET totp_enabled = true, totp_verified_at = CURRENT_TIMESTAMP, totp_recovery_codes = $1
     WHERE id = $2`,
    [JSON.stringify(hashedCodes), req.user.id]
  );

  logger.info('2FA enabled', { userId: req.user.id });

  res.json({
    status: 'success',
    message: 'Two-factor authentication has been enabled.',
    data: {
      recoveryCodes,
    },
  });
}));

/**
 * POST /2fa/disable
 * Disable 2FA (requires password confirmation)
 * Body: { password: "current_password" }
 */
router.post('/disable', asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, 'Current password is required to disable 2FA');
  }

  // Verify password
  const result = await db.query(
    'SELECT password_hash, totp_enabled FROM accounts WHERE id = $1',
    [req.user.id]
  );

  const account = result.rows[0];

  if (!account.totp_enabled) {
    throw new ApiError(400, 'Two-factor authentication is not enabled.');
  }

  const isValidPassword = await bcrypt.compare(password, account.password_hash);
  if (!isValidPassword) {
    throw new ApiError(401, 'Incorrect password');
  }

  // Disable 2FA and clear secret
  await db.query(
    `UPDATE accounts 
     SET totp_enabled = false, totp_secret = NULL, totp_verified_at = NULL, totp_recovery_codes = NULL
     WHERE id = $1`,
    [req.user.id]
  );

  logger.info('2FA disabled', { userId: req.user.id });

  res.json({
    status: 'success',
    message: 'Two-factor authentication has been disabled.',
  });
}));

/**
 * POST /2fa/regenerate-recovery
 * Generate new recovery codes (invalidates old ones)
 * Body: { password: "current_password" }
 */
router.post('/regenerate-recovery', asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, 'Current password is required');
  }

  const result = await db.query(
    'SELECT password_hash, totp_enabled FROM accounts WHERE id = $1',
    [req.user.id]
  );

  const account = result.rows[0];

  if (!account.totp_enabled) {
    throw new ApiError(400, 'Two-factor authentication is not enabled.');
  }

  const isValidPassword = await bcrypt.compare(password, account.password_hash);
  if (!isValidPassword) {
    throw new ApiError(401, 'Incorrect password');
  }

  // Generate new codes
  const recoveryCodes = generateRecoveryCodes();
  const hashedCodes = await hashRecoveryCodes(recoveryCodes);

  await db.query(
    'UPDATE accounts SET totp_recovery_codes = $1 WHERE id = $2',
    [JSON.stringify(hashedCodes), req.user.id]
  );

  logger.info('Recovery codes regenerated', { userId: req.user.id });

  res.json({
    status: 'success',
    data: {
      recoveryCodes,
    },
  });
}));

module.exports = router;
