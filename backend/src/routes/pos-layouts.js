/**
 * POS Layouts Routes
 * Manage customizable item layouts for POS terminals
 */

const express = require('express');
const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// ============================================================================
// LAYOUTS CRUD
// ============================================================================

/**
 * GET /pos-layouts
 * List all layouts for the tenant
 */
router.get('/', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  
  const result = await db.query(`
    SELECT 
      l.*,
      a.name as created_by_name,
      COUNT(li.id) as item_count
    FROM pos_layouts l
    LEFT JOIN accounts a ON l.created_by = a.id
    LEFT JOIN pos_layout_items li ON l.id = li.layout_id
    WHERE l.tenant_id = $1
    GROUP BY l.id, a.name
    ORDER BY l.is_default DESC, l.name
  `, [tenantId]);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

/**
 * GET /pos-layouts/:id
 * Get a single layout with its items
 */
router.get('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenant_id;

  // Get the layout
  const layoutResult = await db.query(`
    SELECT l.*, a.name as created_by_name
    FROM pos_layouts l
    LEFT JOIN accounts a ON l.created_by = a.id
    WHERE l.id = $1 AND l.tenant_id = $2
  `, [id, tenantId]);

  if (layoutResult.rows.length === 0) {
    throw new ApiError(404, 'Layout not found');
  }

  // Get the layout items with full item details
  const itemsResult = await db.query(`
    SELECT 
      li.id as layout_item_id,
      li.display_order,
      li.grid_row,
      li.grid_column,
      li.display_name as override_name,
      li.display_color,
      i.id as item_id,
      i.name,
      i.sku,
      i.price,
      i.image_url,
      i.status,
      c.name as category_name
    FROM pos_layout_items li
    JOIN items i ON li.item_id = i.id
    LEFT JOIN categories c ON i.category_id = c.id
    WHERE li.layout_id = $1
    ORDER BY li.display_order, i.name
  `, [id]);

  const layout = layoutResult.rows[0];
  layout.items = itemsResult.rows;

  res.json({
    status: 'success',
    data: layout
  });
}));

/**
 * POST /pos-layouts
 * Create a new layout
 */
router.post('/', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { name, description, is_default, grid_columns } = req.body;
  const tenantId = req.user.tenant_id;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Layout name is required');
  }

  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');

    // If setting as default, unset other defaults
    if (is_default) {
      await client.query(`
        UPDATE pos_layouts SET is_default = false 
        WHERE tenant_id = $1 AND is_default = true
      `, [tenantId]);
    }

    const result = await client.query(`
      INSERT INTO pos_layouts (tenant_id, name, description, is_default, grid_columns, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [tenantId, name.trim(), description, is_default || false, grid_columns || 4, req.user.id]);

    await client.query('COMMIT');

    logger.info('POS layout created', { 
      layoutId: result.rows[0].id, 
      name, 
      tenantId,
      createdBy: req.user.id 
    });

    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') { // Unique violation
      throw new ApiError(400, 'A layout with this name already exists');
    }
    throw error;
  } finally {
    client.release();
  }
}));

/**
 * PUT /pos-layouts/:id
 * Update a layout's settings
 */
router.put('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, is_default, is_active, grid_columns } = req.body;
  const tenantId = req.user.tenant_id;

  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');

    // Verify ownership
    const existing = await client.query(
      'SELECT id FROM pos_layouts WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (existing.rows.length === 0) {
      throw new ApiError(404, 'Layout not found');
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await client.query(`
        UPDATE pos_layouts SET is_default = false 
        WHERE tenant_id = $1 AND is_default = true AND id != $2
      `, [tenantId, id]);
    }

    const result = await client.query(`
      UPDATE pos_layouts 
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        is_default = COALESCE($3, is_default),
        is_active = COALESCE($4, is_active),
        grid_columns = COALESCE($5, grid_columns),
        updated_by = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND tenant_id = $8
      RETURNING *
    `, [name, description, is_default, is_active, grid_columns, req.user.id, id, tenantId]);

    await client.query('COMMIT');

    logger.info('POS layout updated', { layoutId: id, tenantId });

    res.json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      throw new ApiError(400, 'A layout with this name already exists');
    }
    throw error;
  } finally {
    client.release();
  }
}));

/**
 * DELETE /pos-layouts/:id
 * Delete a layout
 */
router.delete('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenant_id;

  // Check if it's the default - don't allow deletion
  const existing = await db.query(
    'SELECT is_default FROM pos_layouts WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Layout not found');
  }

  if (existing.rows[0].is_default) {
    throw new ApiError(400, 'Cannot delete the default layout. Set another layout as default first.');
  }

  await db.query('DELETE FROM pos_layouts WHERE id = $1 AND tenant_id = $2', [id, tenantId]);

  logger.info('POS layout deleted', { layoutId: id, tenantId });

  res.json({
    status: 'success',
    message: 'Layout deleted'
  });
}));

// ============================================================================
// LAYOUT ITEMS MANAGEMENT
// ============================================================================

/**
 * PUT /pos-layouts/:id/items
 * Bulk update items in a layout (add/remove/reorder)
 * Expects: { items: [{ item_id, display_order, grid_row?, grid_column?, display_name?, display_color? }] }
 */
router.put('/:id/items', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { items } = req.body;
  const tenantId = req.user.tenant_id;

  if (!Array.isArray(items)) {
    throw new ApiError(400, 'Items must be an array');
  }

  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');

    // Verify layout ownership
    const existing = await client.query(
      'SELECT id FROM pos_layouts WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (existing.rows.length === 0) {
      throw new ApiError(404, 'Layout not found');
    }

    // Verify all items belong to this tenant
    if (items.length > 0) {
      const itemIds = items.map(i => i.item_id);
      const validItems = await client.query(
        'SELECT id FROM items WHERE id = ANY($1) AND tenant_id = $2',
        [itemIds, tenantId]
      );
      
      if (validItems.rows.length !== itemIds.length) {
        throw new ApiError(400, 'One or more items not found or not accessible');
      }
    }

    // Clear existing items
    await client.query('DELETE FROM pos_layout_items WHERE layout_id = $1', [id]);

    // Insert new items
    for (const item of items) {
      await client.query(`
        INSERT INTO pos_layout_items (layout_id, item_id, display_order, grid_row, grid_column, display_name, display_color)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        id,
        item.item_id,
        item.display_order || 0,
        item.grid_row || null,
        item.grid_column || null,
        item.display_name || null,
        item.display_color || null
      ]);
    }

    // Update layout timestamp
    await client.query(`
      UPDATE pos_layouts SET updated_by = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
    `, [req.user.id, id]);

    await client.query('COMMIT');

    logger.info('POS layout items updated', { layoutId: id, itemCount: items.length, tenantId });

    // Return the updated layout with items
    const layoutResult = await db.query(`
      SELECT l.*, a.name as created_by_name
      FROM pos_layouts l
      LEFT JOIN accounts a ON l.created_by = a.id
      WHERE l.id = $1
    `, [id]);

    const itemsResult = await db.query(`
      SELECT 
        li.id as layout_item_id,
        li.display_order,
        li.grid_row,
        li.grid_column,
        li.display_name as override_name,
        li.display_color,
        i.id as item_id,
        i.name,
        i.sku,
        i.price,
        i.image_url,
        i.status,
        c.name as category_name
      FROM pos_layout_items li
      JOIN items i ON li.item_id = i.id
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE li.layout_id = $1
      ORDER BY li.display_order, i.name
    `, [id]);

    const layout = layoutResult.rows[0];
    layout.items = itemsResult.rows;

    res.json({
      status: 'success',
      data: layout
    });

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));

/**
 * POST /pos-layouts/:id/items
 * Add a single item to a layout
 */
router.post('/:id/items', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { item_id, display_order, grid_row, grid_column, display_name, display_color } = req.body;
  const tenantId = req.user.tenant_id;

  if (!item_id) {
    throw new ApiError(400, 'item_id is required');
  }

  // Verify layout and item ownership
  const [layoutCheck, itemCheck] = await Promise.all([
    db.query('SELECT id FROM pos_layouts WHERE id = $1 AND tenant_id = $2', [id, tenantId]),
    db.query('SELECT id FROM items WHERE id = $1 AND tenant_id = $2', [item_id, tenantId])
  ]);

  if (layoutCheck.rows.length === 0) {
    throw new ApiError(404, 'Layout not found');
  }

  if (itemCheck.rows.length === 0) {
    throw new ApiError(404, 'Item not found');
  }

  // Get max display_order if not provided
  let order = display_order;
  if (order === undefined || order === null) {
    const maxOrder = await db.query(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM pos_layout_items WHERE layout_id = $1',
      [id]
    );
    order = maxOrder.rows[0].next_order;
  }

  try {
    const result = await db.query(`
      INSERT INTO pos_layout_items (layout_id, item_id, display_order, grid_row, grid_column, display_name, display_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [id, item_id, order, grid_row, grid_column, display_name, display_color]);

    logger.info('Item added to POS layout', { layoutId: id, itemId: item_id, tenantId });

    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (error) {
    if (error.code === '23505') {
      throw new ApiError(400, 'Item already exists in this layout');
    }
    throw error;
  }
}));

/**
 * DELETE /pos-layouts/:id/items/:itemId
 * Remove an item from a layout
 */
router.delete('/:id/items/:itemId', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id, itemId } = req.params;
  const tenantId = req.user.tenant_id;

  // Verify layout ownership
  const layoutCheck = await db.query(
    'SELECT id FROM pos_layouts WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );

  if (layoutCheck.rows.length === 0) {
    throw new ApiError(404, 'Layout not found');
  }

  const result = await db.query(
    'DELETE FROM pos_layout_items WHERE layout_id = $1 AND item_id = $2 RETURNING id',
    [id, itemId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Item not found in layout');
  }

  logger.info('Item removed from POS layout', { layoutId: id, itemId, tenantId });

  res.json({
    status: 'success',
    message: 'Item removed from layout'
  });
}));

// ============================================================================
// AVAILABLE ITEMS (for layout configuration UI)
// ============================================================================

/**
 * GET /pos-layouts/:id/available-items
 * Get all active items NOT in this layout (for adding to layout)
 */
router.get('/:id/available-items', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { search, category_id } = req.query;
  const tenantId = req.user.tenant_id;

  // Verify layout ownership
  const layoutCheck = await db.query(
    'SELECT id FROM pos_layouts WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );

  if (layoutCheck.rows.length === 0) {
    throw new ApiError(404, 'Layout not found');
  }

  let queryText = `
    SELECT 
      i.id, i.name, i.sku, i.price, i.image_url, i.status,
      c.name as category_name
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.id
    WHERE i.tenant_id = $1 
      AND i.status = 'active'
      AND i.id NOT IN (SELECT item_id FROM pos_layout_items WHERE layout_id = $2)
  `;
  const params = [tenantId, id];
  let paramCount = 2;

  if (category_id) {
    paramCount++;
    params.push(category_id);
    queryText += ` AND i.category_id = $${paramCount}`;
  }

  if (search) {
    paramCount++;
    params.push(`%${search}%`);
    queryText += ` AND (i.name ILIKE $${paramCount} OR i.sku ILIKE $${paramCount})`;
  }

  queryText += ' ORDER BY c.name NULLS LAST, i.name';

  const result = await db.query(queryText, params);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

/**
 * POST /pos-layouts/:id/duplicate
 * Duplicate a layout with all its items
 */
router.post('/:id/duplicate', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const tenantId = req.user.tenant_id;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'New layout name is required');
  }

  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');

    // Get original layout
    const original = await client.query(
      'SELECT * FROM pos_layouts WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (original.rows.length === 0) {
      throw new ApiError(404, 'Layout not found');
    }

    // Create new layout
    const newLayout = await client.query(`
      INSERT INTO pos_layouts (tenant_id, name, description, grid_columns, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [tenantId, name.trim(), original.rows[0].description, original.rows[0].grid_columns, req.user.id]);

    // Copy items
    await client.query(`
      INSERT INTO pos_layout_items (layout_id, item_id, display_order, grid_row, grid_column, display_name, display_color)
      SELECT $1, item_id, display_order, grid_row, grid_column, display_name, display_color
      FROM pos_layout_items
      WHERE layout_id = $2
    `, [newLayout.rows[0].id, id]);

    await client.query('COMMIT');

    logger.info('POS layout duplicated', { 
      originalId: id, 
      newId: newLayout.rows[0].id, 
      tenantId 
    });

    res.status(201).json({
      status: 'success',
      data: newLayout.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      throw new ApiError(400, 'A layout with this name already exists');
    }
    throw error;
  } finally {
    client.release();
  }
}));

module.exports = router;
