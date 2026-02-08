/**
 * Accounts Routes
 * CRUD operations for user accounts
 */

const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const db = require('../../config/database');
const { authenticate, requireStaff, requireAdmin } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// ============================================================================
// VALIDATION RULES
// ============================================================================

const accountValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('zip_code').optional().trim(),
  body('role').optional().isIn(['super_admin', 'tenant_admin', 'admin', 'staff', 'accountant', 'customer']).withMessage('Invalid role'),
  body('delivery_zone_id').optional(),
  body('is_farm_member').optional().isBoolean(),
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
 * GET /accounts
 * List all accounts (staff+ only)
 */
router.get('/', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { 
    role, 
    is_farm_member, 
    delivery_zone_id,
    search,
    page = 1, 
    limit = 50,
    sort = 'name',
    order = 'asc'
  } = req.query;

  let queryText = `
    SELECT 
      a.*,
      dz.name as delivery_zone_name
    FROM accounts a
    LEFT JOIN delivery_zones dz ON a.delivery_zone_id = dz.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  // Apply filters
  if (role) {
    params.push(role);
    queryText += ` AND a.role = $${++paramCount}`;
  }

  if (is_farm_member !== undefined) {
    params.push(is_farm_member === 'true');
    queryText += ` AND a.is_farm_member = $${++paramCount}`;
  }

  if (delivery_zone_id) {
    params.push(delivery_zone_id);
    queryText += ` AND a.delivery_zone_id = $${++paramCount}`;
  }

  if (search) {
    params.push(`%${search}%`);
    paramCount++;
    queryText += ` AND (a.name ILIKE $${paramCount} OR a.email ILIKE $${paramCount})`;
  }

  // Count total
  const countResult = await db.query(
    `SELECT COUNT(*) FROM (${queryText}) as filtered`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Apply sorting and pagination
  const validSortColumns = ['name', 'email', 'created_at', 'role'];
  const sortColumn = validSortColumns.includes(sort) ? sort : 'name';
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  
  queryText += ` ORDER BY a.${sortColumn} ${sortOrder}`;
  
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  params.push(parseInt(limit, 10), offset);
  queryText += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;

  const result = await db.query(queryText, params);

  // Remove password hashes from response
  const accounts = result.rows.map(({ password_hash, ...account }) => account);

  res.json({
    status: 'success',
    data: accounts,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10)),
    },
  });
}));

/**
 * GET /accounts/:id
 * Get single account
 */
router.get('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(`
    SELECT 
      a.*,
      dz.name as delivery_zone_name,
      dz.schedule as delivery_schedule
    FROM accounts a
    LEFT JOIN delivery_zones dz ON a.delivery_zone_id = dz.id
    WHERE a.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Account not found');
  }

  const { password_hash, ...account } = result.rows[0];
  
  res.json({
    status: 'success',
    data: account,
  });
}));

/**
 * POST /accounts
 * Create new account (staff+ only)
 */
router.post('/', authenticate, requireStaff, accountValidation, validate, asyncHandler(async (req, res) => {
  const {
    email,
    password,
    name,
    phone,
    address,
    city,
    state,
    zip_code,
    role = 'customer',
    delivery_zone_id,
    is_farm_member = false,
    is_active = true,
    email_verified = false,
    notes,
  } = req.body;

  // Resolve tenant_id from authenticated user
  const tenant_id = req.user?.tenant_id || req.tenantId || null;

  // Role assignment guards:
  //   super_admin  – cannot be assigned via API (DB only)
  //   tenant_admin – requires tenant_admin or super_admin
  //   admin/staff/accountant – requires admin, tenant_admin, or super_admin
  if (role === 'super_admin') {
    throw new ApiError(403, 'super_admin can only be assigned directly in the database');
  }
  if (role === 'tenant_admin' && !['tenant_admin', 'super_admin'].includes(req.user.role)) {
    throw new ApiError(403, 'Only tenant admins can create tenant admin accounts');
  }
  if (['admin', 'staff', 'accountant'].includes(role) && !['admin', 'tenant_admin', 'super_admin'].includes(req.user.role)) {
    throw new ApiError(403, 'Only admins can create admin, staff, or accountant accounts');
  }

  // Hash password if provided
  let passwordHash = null;
  if (password) {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
    passwordHash = await bcrypt.hash(password, rounds);
  }

  const result = await db.query(`
    INSERT INTO accounts (
      email, password_hash, name, phone, address, city, state, zip_code,
      role, delivery_zone_id, is_farm_member, member_since, is_active,
      email_verified, tenant_id, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *
  `, [
    email,
    passwordHash,
    name,
    phone,
    address,
    city,
    state,
    zip_code,
    role,
    delivery_zone_id || null,
    is_farm_member,
    is_farm_member ? new Date() : null,
    is_active,
    email_verified,
    tenant_id,
    notes,
  ]);

  const { password_hash: _, ...account } = result.rows[0];
  
  logger.info('Account created', { accountId: account.id, tenantId: tenant_id, createdBy: req.user.id });

  res.status(201).json({
    status: 'success',
    data: account,
  });
}));

/**
 * PUT /accounts/:id
 * Update account
 */
router.put('/:id', authenticate, requireStaff, accountValidation, validate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    email,
    name,
    phone,
    address,
    city,
    state,
    zip_code,
    role,
    delivery_zone_id,
    is_farm_member,
    is_active,
    notes,
  } = req.body;

  // Check if account exists
  const existing = await db.query('SELECT * FROM accounts WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Account not found');
  }

  const currentAccount = existing.rows[0];

  // Role change guards
  const callerRole = req.user.role;
  const isCallerAdmin = ['admin', 'tenant_admin', 'super_admin'].includes(callerRole);
  const isCallerTenantAdmin = ['tenant_admin', 'super_admin'].includes(callerRole);

  if (role === 'super_admin') {
    throw new ApiError(403, 'super_admin can only be assigned directly in the database');
  }
  if (role && role !== currentAccount.role && !isCallerAdmin) {
    throw new ApiError(403, 'Only admins can change account roles');
  }
  if (role === 'tenant_admin' && !isCallerTenantAdmin) {
    throw new ApiError(403, 'Only tenant admins can assign the tenant_admin role');
  }
  if (['tenant_admin', 'super_admin'].includes(currentAccount.role) && !isCallerTenantAdmin) {
    throw new ApiError(403, 'Only tenant admins can modify tenant admin accounts');
  }

  // Handle farm membership changes
  let memberSince = currentAccount.member_since;
  if (is_farm_member !== undefined && is_farm_member !== currentAccount.is_farm_member) {
    memberSince = is_farm_member ? new Date() : null;
  }

  const result = await db.query(`
    UPDATE accounts SET
      email = COALESCE($1, email),
      name = COALESCE($2, name),
      phone = COALESCE($3, phone),
      address = COALESCE($4, address),
      city = COALESCE($5, city),
      state = COALESCE($6, state),
      zip_code = COALESCE($7, zip_code),
      role = COALESCE($8, role),
      delivery_zone_id = $9,
      is_farm_member = COALESCE($10, is_farm_member),
      member_since = $11,
      is_active = COALESCE($12, is_active),
      notes = COALESCE($13, notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $14
    RETURNING *
  `, [
    email,
    name,
    phone,
    address,
    city,
    state,
    zip_code,
    role,
    delivery_zone_id !== undefined ? delivery_zone_id : currentAccount.delivery_zone_id,
    is_farm_member,
    memberSince,
    is_active,
    notes,
    id,
  ]);

  const { password_hash: _, ...account } = result.rows[0];
  
  logger.info('Account updated', { accountId: id, updatedBy: req.user.id });

  res.json({
    status: 'success',
    data: account,
  });
}));

/**
 * PUT /accounts/:id/reset-password
 * Admin resets a user's password (admin+ only)
 */
router.put('/:id/reset-password', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters');
  }

  // Prevent non-tenant-admins from resetting admin+ passwords
  const target = await db.query('SELECT id, role, name FROM accounts WHERE id = $1', [id]);
  if (target.rows.length === 0) {
    throw new ApiError(404, 'Account not found');
  }

  const targetRole = target.rows[0].role;
  const callerRole = req.user.role;
  if (['tenant_admin', 'super_admin'].includes(targetRole) && !['tenant_admin', 'super_admin'].includes(callerRole)) {
    throw new ApiError(403, 'Only tenant admins can reset passwords for admin-level accounts');
  }

  const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
  const passwordHash = await bcrypt.hash(newPassword, rounds);

  await db.query(
    'UPDATE accounts SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [passwordHash, id]
  );

  logger.info('Password reset by admin', { targetAccountId: id, resetBy: req.user.id });

  res.json({
    status: 'success',
    message: `Password reset successfully for ${target.rows[0].name}`,
  });
}));

/**
 * PATCH /accounts/:id/membership
 * Toggle farm membership
 */
router.patch('/:id/membership', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { is_farm_member } = req.body;

  const result = await db.query(`
    UPDATE accounts SET
      is_farm_member = $1,
      member_since = CASE WHEN $1 = true THEN COALESCE(member_since, CURRENT_DATE) ELSE NULL END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND role = 'customer'
    RETURNING *
  `, [is_farm_member, id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Customer account not found');
  }

  const { password_hash: _, ...account } = result.rows[0];
  
  logger.info('Membership toggled', { accountId: id, isMember: is_farm_member, updatedBy: req.user.id });

  res.json({
    status: 'success',
    data: account,
  });
}));

/**
 * DELETE /accounts/:id
 * Delete account (admin only)
 */
router.delete('/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (id === req.user.id) {
    throw new ApiError(400, 'Cannot delete your own account');
  }

  const result = await db.query('DELETE FROM accounts WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Account not found');
  }

  logger.info('Account deleted', { accountId: id, deletedBy: req.user.id });

  res.json({
    status: 'success',
    message: 'Account deleted successfully',
  });
}));

/**
 * GET /accounts/me
 * Get current user's account
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT 
      a.*,
      dz.name as delivery_zone_name,
      dz.schedule as delivery_schedule
    FROM accounts a
    LEFT JOIN delivery_zones dz ON a.delivery_zone_id = dz.id
    WHERE a.id = $1
  `, [req.user.id]);

  const { password_hash, ...account } = result.rows[0];

  res.json({
    status: 'success',
    data: account,
  });
}));

module.exports = router;
