/**
 * Delivery Zones Routes
 * Delivery area and schedule management
 * Tenant-aware: all operations scoped to req.user.tenant_id
 */

const express = require('express');
const db = require('../../config/database');
const { authenticate, requireStaff, requireAdmin } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * GET /delivery-zones
 * List all delivery zones (requires auth for tenant scoping)
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { include_inactive } = req.query;
  
  let queryText = 'SELECT * FROM delivery_zones WHERE tenant_id = $1';
  const params = [tenantId];
  
  if (include_inactive !== 'true') {
    queryText += ' AND is_active = true';
  }
  queryText += ' ORDER BY name';

  const result = await db.query(queryText, params);

  res.json({
    status: 'success',
    data: result.rows,
  });
}));

/**
 * GET /delivery-zones/:id
 * Get single zone with customer count
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;

  const result = await db.query(`
    SELECT 
      dz.*,
      COUNT(a.id) as customer_count
    FROM delivery_zones dz
    LEFT JOIN accounts a ON a.delivery_zone_id = dz.id AND a.role = 'customer'
    WHERE dz.id = $1 AND dz.tenant_id = $2
    GROUP BY dz.id
  `, [id, tenantId]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Delivery zone not found');
  }

  res.json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * POST /delivery-zones
 * Create new zone (admin only)
 */
router.post('/', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id, name, schedule, radius = 20, base_city } = req.body;

  if (!id || !name || !schedule || !base_city) {
    throw new ApiError(400, 'id, name, schedule, and base_city are required');
  }

  const result = await db.query(`
    INSERT INTO delivery_zones (id, tenant_id, name, schedule, radius, base_city)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [id, tenantId, name, schedule, radius, base_city]);

  res.status(201).json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * PUT /delivery-zones/:id
 * Update zone (admin only)
 */
router.put('/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;
  const { name, schedule, radius, base_city, is_active } = req.body;

  const result = await db.query(`
    UPDATE delivery_zones SET
      name = COALESCE($1, name),
      schedule = COALESCE($2, schedule),
      radius = COALESCE($3, radius),
      base_city = COALESCE($4, base_city),
      is_active = COALESCE($5, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6 AND tenant_id = $7
    RETURNING *
  `, [name, schedule, radius, base_city, is_active, id, tenantId]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Delivery zone not found');
  }

  res.json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * DELETE /delivery-zones/:id
 * Delete zone (admin only)
 */
router.delete('/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;

  // Check if zone has customers (tenant-scoped)
  const customerCount = await db.query(
    'SELECT COUNT(*) FROM accounts WHERE delivery_zone_id = $1 AND tenant_id = $2',
    [id, tenantId]
  );

  if (parseInt(customerCount.rows[0].count, 10) > 0) {
    throw new ApiError(400, 'Cannot delete zone with assigned customers. Deactivate instead.');
  }

  const result = await db.query(
    'DELETE FROM delivery_zones WHERE id = $1 AND tenant_id = $2 RETURNING id',
    [id, tenantId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Delivery zone not found');
  }

  res.json({
    status: 'success',
    message: 'Delivery zone deleted',
  });
}));

/**
 * GET /delivery-zones/:id/customers
 * Get customers in zone (staff+)
 */
router.get('/:id/customers', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;

  // Verify zone belongs to tenant first
  const zoneCheck = await db.query(
    'SELECT id FROM delivery_zones WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  if (zoneCheck.rows.length === 0) {
    throw new ApiError(404, 'Delivery zone not found');
  }

  const result = await db.query(`
    SELECT id, name, email, phone, address, is_farm_member
    FROM accounts
    WHERE delivery_zone_id = $1 AND tenant_id = $2 AND role = 'customer' AND is_active = true
    ORDER BY name
  `, [id, tenantId]);

  res.json({
    status: 'success',
    data: result.rows,
  });
}));

module.exports = router;
