/**
 * Authentication Middleware
 * JWT-based authentication and authorization
 */

const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');
const db = require('../../config/database');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Collect all possible token sources in priority order
    const tokenSources = [];
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      tokenSources.push(authHeader.split(' ')[1]);
    }
    if (req.query.token) {
      tokenSources.push(req.query.token);
    }
    if (req.cookies && req.cookies.busmgr_sso) {
      tokenSources.push(req.cookies.busmgr_sso);
    }
    
    if (tokenSources.length === 0) {
      throw new ApiError(401, 'No token provided');
    }

    // Try each token source — if one fails (expired), fall through to the next
    let lastError = null;
    for (const token of tokenSources) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const result = await db.query(
          'SELECT id, email, name, role, tenant_id, is_farm_member, is_active FROM accounts WHERE id = $1',
          [decoded.id]
        );

        if (result.rows.length === 0) {
          lastError = new ApiError(401, 'User not found');
          continue;
        }

        const user = result.rows[0];

        if (!user.is_active) {
          lastError = new ApiError(401, 'Account is deactivated');
          continue;
        }

        // Success — attach user and proceed
        req.user = user;
        return next();
      } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
          lastError = new ApiError(401, 'Invalid or expired token');
          continue; // Try next token source
        }
        throw err; // Non-JWT error, bail out
      }
    }

    // All token sources failed
    next(lastError || new ApiError(401, 'Authentication failed'));
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Invalid or expired token'));
    } else {
      next(error);
    }
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await db.query(
      'SELECT id, email, name, role, tenant_id, is_farm_member, is_active FROM accounts WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length > 0 && result.rows[0].is_active) {
      req.user = result.rows[0];
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

/**
 * Require specific roles
 *
 * Role hierarchy (highest → lowest):
 *   super_admin   – Platform-level admin (assigned via DB only)
 *   tenant_admin  – Full control of their own tenant
 *   admin         – Day-to-day admin within a tenant
 *   staff         – Front-line staff (POS, herds, etc.)
 *   accountant    – External accountant; back-office financial views only
 *   customer      – End-user / shopper
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }

    next();
  };
};

/**
 * Require admin role (tenant admin or super admin)
 */
const requireAdmin = requireRole('admin', 'tenant_admin', 'super_admin');

/**
 * Require super admin role (platform-level admin)
 */
const requireSuperAdmin = requireRole('super_admin');

/**
 * Require tenant admin role (can manage their own tenant)
 */
const requireTenantAdmin = requireRole('tenant_admin', 'super_admin');

/**
 * Require admin or staff role (includes accountant for financial endpoints)
 */
const requireStaff = requireRole('super_admin', 'tenant_admin', 'admin', 'staff', 'accountant');

/**
 * Require farm membership
 */
const requireMember = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }

  if (!req.user.is_farm_member && req.user.role === 'customer') {
    return next(new ApiError(403, 'Farm membership required'));
  }

  next();
};

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Generate refresh token (longer expiry)
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  requireTenantAdmin,
  requireStaff,
  requireMember,
  generateToken,
  generateRefreshToken,
};
