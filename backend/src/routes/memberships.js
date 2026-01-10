/**
 * Memberships Routes
 * Farm membership subscription management
 */

const express = require('express');
const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * GET /memberships
 * List all memberships (staff+)
 */
router.get('/', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;

  let queryText = `
    SELECT 
      m.*,
      a.name as account_name,
      a.email as account_email,
      i.name as item_name
    FROM memberships m
    JOIN accounts a ON m.account_id = a.id
    LEFT JOIN items i ON m.item_id = i.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  if (status) {
    params.push(status);
    queryText += ` AND m.status = $${++paramCount}`;
  }

  // Count
  const countResult = await db.query(
    `SELECT COUNT(*) FROM (${queryText}) as filtered`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Pagination
  queryText += ' ORDER BY m.created_at DESC';
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  params.push(parseInt(limit, 10), offset);
  queryText += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;

  const result = await db.query(queryText, params);

  res.json({
    status: 'success',
    data: result.rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10)),
    },
  });
}));

/**
 * GET /memberships/:id
 * Get single membership
 */
router.get('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(`
    SELECT 
      m.*,
      a.name as account_name,
      a.email as account_email,
      a.phone as account_phone,
      i.name as item_name,
      i.price as item_price
    FROM memberships m
    JOIN accounts a ON m.account_id = a.id
    LEFT JOIN items i ON m.item_id = i.id
    WHERE m.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Membership not found');
  }

  res.json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * POST /memberships
 * Create new membership (staff+)
 */
router.post('/', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const {
    account_id,
    item_id,
    start_date,
    end_date,
    auto_renew = true,
    discount_percent = 10,
    notes,
  } = req.body;

  if (!account_id || !start_date || !end_date) {
    throw new ApiError(400, 'account_id, start_date, and end_date are required');
  }

  const membership = await db.transaction(async (client) => {
    // Create membership
    const result = await client.query(`
      INSERT INTO memberships (
        account_id, item_id, start_date, end_date, auto_renew, discount_percent, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [account_id, item_id || null, start_date, end_date, auto_renew, discount_percent, notes || null]);

    // Update account farm member status
    await client.query(`
      UPDATE accounts SET
        is_farm_member = true,
        member_since = COALESCE(member_since, $1),
        member_discount_percent = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [start_date, discount_percent, account_id]);

    return result.rows[0];
  });

  logger.info('Membership created', { membershipId: membership.id, accountId: account_id, createdBy: req.user.id });

  res.status(201).json({
    status: 'success',
    data: membership,
  });
}));

/**
 * PUT /memberships/:id
 * Update membership
 */
router.put('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, end_date, auto_renew, discount_percent, notes } = req.body;

  const membership = await db.transaction(async (client) => {
    const result = await client.query(`
      UPDATE memberships SET
        status = COALESCE($1, status),
        end_date = COALESCE($2, end_date),
        auto_renew = COALESCE($3, auto_renew),
        discount_percent = COALESCE($4, discount_percent),
        notes = COALESCE($5, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [status, end_date, auto_renew, discount_percent, notes, id]);

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Membership not found');
    }

    const membership = result.rows[0];

    // Update account if membership cancelled or expired
    if (status === 'cancelled' || status === 'expired') {
      // Check if account has any other active memberships
      const otherActive = await client.query(`
        SELECT id FROM memberships 
        WHERE account_id = $1 AND status = 'active' AND id != $2
      `, [membership.account_id, id]);

      if (otherActive.rows.length === 0) {
        await client.query(`
          UPDATE accounts SET is_farm_member = false, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [membership.account_id]);
      }
    }

    return membership;
  });

  logger.info('Membership updated', { membershipId: id, updatedBy: req.user.id });

  res.json({
    status: 'success',
    data: membership,
  });
}));

/**
 * POST /memberships/:id/renew
 * Renew membership
 */
router.post('/:id/renew', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { new_end_date } = req.body;

  if (!new_end_date) {
    throw new ApiError(400, 'new_end_date is required');
  }

  const result = await db.query(`
    UPDATE memberships SET
      status = 'active',
      end_date = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `, [new_end_date, id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Membership not found');
  }

  // Ensure account is marked as member
  await db.query(`
    UPDATE accounts SET is_farm_member = true, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `, [result.rows[0].account_id]);

  logger.info('Membership renewed', { membershipId: id, newEndDate: new_end_date, renewedBy: req.user.id });

  res.json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * GET /memberships/expiring
 * Get memberships expiring soon
 */
router.get('/reports/expiring', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const result = await db.query(`
    SELECT 
      m.*,
      a.name as account_name,
      a.email as account_email
    FROM memberships m
    JOIN accounts a ON m.account_id = a.id
    WHERE m.status = 'active'
      AND m.end_date <= CURRENT_DATE + INTERVAL '1 day' * $1
      AND m.end_date >= CURRENT_DATE
    ORDER BY m.end_date ASC
  `, [parseInt(days, 10)]);

  res.json({
    status: 'success',
    data: result.rows,
  });
}));

module.exports = router;
