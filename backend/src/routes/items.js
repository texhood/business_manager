/**
 * Items (Products) Routes
 * CRUD operations for inventory and product management
 */

const express = require('express');
const { body, query, validationResult } = require('express-validator');

const db = require('../../config/database');
const { authenticate, optionalAuth, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// ============================================================================
// VALIDATION RULES
// ============================================================================

const itemValidation = [
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('item_type').isIn(['inventory', 'non-inventory', 'digital']).withMessage('Invalid item type'),
  body('shipping_zone').optional().isIn(['not-shippable', 'in-state', 'in-country', 'no-restrictions']),
  body('is_taxable').optional().isBoolean(),
  body('inventory_quantity').optional().isInt({ min: 0 }),
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
 * GET /items
 * List all items (public, but members see member prices)
 */
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const {
    category,
    item_type,
    shipping_zone,
    in_stock,
    is_active = 'true',
    search,
    tag,
    page = 1,
    limit = 50,
    sort = 'name',
    order = 'asc',
  } = req.query;

  let queryText = `
    SELECT 
      i.*,
      c.name as category_name,
      c.slug as category_slug,
      CASE 
        WHEN i.item_type != 'inventory' THEN 'digital'
        WHEN i.inventory_quantity = 0 THEN 'out'
        WHEN i.inventory_quantity <= i.low_stock_threshold THEN 'low'
        ELSE 'in'
      END as stock_status,
      COALESCE(i.member_price, i.price * 0.9) as calculated_member_price,
      array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN item_tags it ON i.id = it.item_id
    LEFT JOIN tags t ON it.tag_id = t.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  // Apply filters
  if (is_active !== undefined) {
    params.push(is_active === 'true');
    queryText += ` AND i.is_active = $${++paramCount}`;
  }

  if (category) {
    params.push(category);
    queryText += ` AND (c.slug = $${paramCount} OR c.id::text = $${paramCount})`;
    paramCount++;
  }

  if (item_type) {
    params.push(item_type);
    queryText += ` AND i.item_type = $${++paramCount}`;
  }

  if (shipping_zone) {
    params.push(shipping_zone);
    queryText += ` AND i.shipping_zone = $${++paramCount}`;
  }

  if (in_stock === 'true') {
    queryText += ` AND (i.item_type != 'inventory' OR i.inventory_quantity > 0)`;
  }

  if (search) {
    params.push(`%${search}%`);
    paramCount++;
    queryText += ` AND (i.name ILIKE $${paramCount} OR i.sku ILIKE $${paramCount} OR i.description ILIKE $${paramCount})`;
  }

  if (tag) {
    params.push(tag);
    queryText += ` AND EXISTS (
      SELECT 1 FROM item_tags it2 
      JOIN tags t2 ON it2.tag_id = t2.id 
      WHERE it2.item_id = i.id AND (t2.slug = $${++paramCount} OR t2.name = $${paramCount})
    )`;
  }

  // Group by for aggregation
  queryText += ` GROUP BY i.id, c.name, c.slug`;

  // Count total (need to wrap the grouped query)
  const countQuery = `SELECT COUNT(*) FROM (${queryText}) as grouped`;
  const countResult = await db.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count, 10);

  // Apply sorting
  const validSortColumns = ['name', 'price', 'created_at', 'inventory_quantity', 'sku'];
  const sortColumn = validSortColumns.includes(sort) ? sort : 'name';
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  
  queryText += ` ORDER BY i.${sortColumn} ${sortOrder}`;

  // Pagination
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  params.push(parseInt(limit, 10), offset);
  queryText += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;

  const result = await db.query(queryText, params);

  // Determine if user should see member prices
  const showMemberPrices = req.user?.is_farm_member || ['admin', 'staff'].includes(req.user?.role);

  const items = result.rows.map(item => ({
    ...item,
    display_price: showMemberPrices && item.calculated_member_price < item.price 
      ? item.calculated_member_price 
      : item.price,
    member_price: showMemberPrices ? item.calculated_member_price : null,
  }));

  res.json({
    status: 'success',
    data: items,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10)),
    },
  });
}));

/**
 * GET /items/:id
 * Get single item
 */
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(`
    SELECT 
      i.*,
      c.name as category_name,
      c.slug as category_slug,
      CASE 
        WHEN i.item_type != 'inventory' THEN 'digital'
        WHEN i.inventory_quantity = 0 THEN 'out'
        WHEN i.inventory_quantity <= i.low_stock_threshold THEN 'low'
        ELSE 'in'
      END as stock_status,
      COALESCE(i.member_price, i.price * 0.9) as calculated_member_price,
      array_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)) 
        FILTER (WHERE t.id IS NOT NULL) as tags
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN item_tags it ON i.id = it.item_id
    LEFT JOIN tags t ON it.tag_id = t.id
    WHERE i.id = $1 OR i.sku = $1
    GROUP BY i.id, c.name, c.slug
  `, [id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Item not found');
  }

  const item = result.rows[0];
  const showMemberPrices = req.user?.is_farm_member || ['admin', 'staff'].includes(req.user?.role);

  res.json({
    status: 'success',
    data: {
      ...item,
      display_price: showMemberPrices && item.calculated_member_price < item.price 
        ? item.calculated_member_price 
        : item.price,
      member_price: showMemberPrices ? item.calculated_member_price : null,
    },
  });
}));

/**
 * POST /items
 * Create new item (staff+ only)
 */
router.post('/', authenticate, requireStaff, itemValidation, validate, asyncHandler(async (req, res) => {
  const {
    sku,
    name,
    description,
    item_type,
    category_id,
    price,
    member_price,
    cost,
    inventory_quantity = 0,
    low_stock_threshold = 5,
    is_taxable = true,
    tax_rate = 0.0825,
    shipping_zone = 'in-state',
    weight_oz,
    is_active = true,
    is_featured = false,
    image_url,
    digital_file_url,
    tags = [],
  } = req.body;

  // Use transaction for item + tags
  const item = await db.transaction(async (client) => {
    // Insert item
    const itemResult = await client.query(`
      INSERT INTO items (
        sku, name, description, item_type, category_id, price, member_price, cost,
        inventory_quantity, low_stock_threshold, is_taxable, tax_rate, shipping_zone,
        weight_oz, is_active, is_featured, image_url, digital_file_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `, [
      sku, name, description, item_type, category_id || null, price,
      member_price || null, cost || null,
      item_type === 'inventory' ? inventory_quantity : null,
      low_stock_threshold, is_taxable, tax_rate, shipping_zone,
      weight_oz || null, is_active, is_featured, image_url || null, digital_file_url || null,
    ]);

    const newItem = itemResult.rows[0];

    // Add tags if provided
    if (tags.length > 0) {
      for (const tagId of tags) {
        await client.query(
          'INSERT INTO item_tags (item_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [newItem.id, tagId]
        );
      }
    }

    return newItem;
  });

  logger.info('Item created', { itemId: item.id, sku: item.sku, createdBy: req.user.id });

  res.status(201).json({
    status: 'success',
    data: item,
  });
}));

/**
 * PUT /items/:id
 * Update item (staff+ only)
 */
router.put('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    sku,
    name,
    description,
    item_type,
    category_id,
    price,
    member_price,
    cost,
    inventory_quantity,
    low_stock_threshold,
    is_taxable,
    tax_rate,
    shipping_zone,
    weight_oz,
    is_active,
    is_featured,
    image_url,
    digital_file_url,
    tags,
  } = req.body;

  const item = await db.transaction(async (client) => {
    // Update item
    const result = await client.query(`
      UPDATE items SET
        sku = COALESCE($1, sku),
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        item_type = COALESCE($4, item_type),
        category_id = $5,
        price = COALESCE($6, price),
        member_price = $7,
        cost = $8,
        inventory_quantity = CASE WHEN COALESCE($4, item_type) = 'inventory' THEN COALESCE($9, inventory_quantity) ELSE NULL END,
        low_stock_threshold = COALESCE($10, low_stock_threshold),
        is_taxable = COALESCE($11, is_taxable),
        tax_rate = COALESCE($12, tax_rate),
        shipping_zone = COALESCE($13, shipping_zone),
        weight_oz = $14,
        is_active = COALESCE($15, is_active),
        is_featured = COALESCE($16, is_featured),
        image_url = $17,
        digital_file_url = $18,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $19
      RETURNING *
    `, [
      sku, name, description, item_type,
      category_id !== undefined ? category_id : null,
      price,
      member_price !== undefined ? member_price : null,
      cost !== undefined ? cost : null,
      inventory_quantity, low_stock_threshold, is_taxable, tax_rate, shipping_zone,
      weight_oz !== undefined ? weight_oz : null,
      is_active, is_featured,
      image_url !== undefined ? image_url : null,
      digital_file_url !== undefined ? digital_file_url : null,
      id,
    ]);

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Item not found');
    }

    // Update tags if provided
    if (tags !== undefined) {
      await client.query('DELETE FROM item_tags WHERE item_id = $1', [id]);
      for (const tagId of tags) {
        await client.query(
          'INSERT INTO item_tags (item_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, tagId]
        );
      }
    }

    return result.rows[0];
  });

  logger.info('Item updated', { itemId: id, updatedBy: req.user.id });

  res.json({
    status: 'success',
    data: item,
  });
}));

/**
 * PATCH /items/:id/inventory
 * Update inventory quantity (staff+ only)
 */
router.patch('/:id/inventory', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity, adjustment, reason = 'manual' } = req.body;

  const item = await db.transaction(async (client) => {
    // Get current inventory
    const current = await client.query(
      'SELECT id, inventory_quantity, item_type FROM items WHERE id = $1',
      [id]
    );

    if (current.rows.length === 0) {
      throw new ApiError(404, 'Item not found');
    }

    const currentItem = current.rows[0];

    if (currentItem.item_type !== 'inventory') {
      throw new ApiError(400, 'Cannot adjust inventory for non-inventory items');
    }

    // Calculate new quantity
    let newQuantity;
    let quantityChange;

    if (quantity !== undefined) {
      // Absolute set
      newQuantity = Math.max(0, parseInt(quantity, 10));
      quantityChange = newQuantity - (currentItem.inventory_quantity || 0);
    } else if (adjustment !== undefined) {
      // Relative adjustment
      quantityChange = parseInt(adjustment, 10);
      newQuantity = Math.max(0, (currentItem.inventory_quantity || 0) + quantityChange);
    } else {
      throw new ApiError(400, 'Either quantity or adjustment is required');
    }

    // Update inventory
    const result = await client.query(`
      UPDATE items SET inventory_quantity = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [newQuantity, id]);

    // Log the change
    await client.query(`
      INSERT INTO inventory_logs (
        item_id, quantity_change, quantity_before, quantity_after, reason, reference_type, created_by
      ) VALUES ($1, $2, $3, $4, $5, 'manual', $6)
    `, [
      id,
      quantityChange,
      currentItem.inventory_quantity || 0,
      newQuantity,
      reason,
      req.user.id,
    ]);

    return result.rows[0];
  });

  logger.info('Inventory updated', { itemId: id, newQuantity: item.inventory_quantity, updatedBy: req.user.id });

  res.json({
    status: 'success',
    data: item,
  });
}));

/**
 * DELETE /items/:id
 * Delete item (admin only)
 */
router.delete('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Soft delete by setting is_active to false, or hard delete
  const { hard = false } = req.query;

  if (hard === 'true') {
    const result = await db.query('DELETE FROM items WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Item not found');
    }
    logger.info('Item deleted (hard)', { itemId: id, deletedBy: req.user.id });
  } else {
    const result = await db.query(
      'UPDATE items SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Item not found');
    }
    logger.info('Item deactivated', { itemId: id, deletedBy: req.user.id });
  }

  res.json({
    status: 'success',
    message: hard === 'true' ? 'Item deleted permanently' : 'Item deactivated',
  });
}));

/**
 * GET /items/:id/inventory-history
 * Get inventory change history
 */
router.get('/:id/inventory-history', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 50 } = req.query;

  const result = await db.query(`
    SELECT 
      il.*,
      a.name as changed_by_name
    FROM inventory_logs il
    LEFT JOIN accounts a ON il.created_by = a.id
    WHERE il.item_id = $1
    ORDER BY il.created_at DESC
    LIMIT $2
  `, [id, parseInt(limit, 10)]);

  res.json({
    status: 'success',
    data: result.rows,
  });
}));

module.exports = router;
