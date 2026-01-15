const express = require('express');
const router = express.Router();
const pool = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Default tenant ID (should come from user context in production)
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

// Helper to get tenant ID from request
const getTenantId = (req) => {
  return req.user?.tenant_id || DEFAULT_TENANT_ID;
};

// ============================================================================
// GLOBAL MODIFICATIONS (Admin)
// ============================================================================

// GET /api/v1/modifications - List all modifications
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { category, active_only } = req.query;
  
  let query = `
    SELECT id, name, display_name, price_adjustment, category, sort_order, is_active,
           created_at, updated_at
    FROM modifications
    WHERE tenant_id = $1
  `;
  const params = [tenantId];
  
  if (category) {
    params.push(category);
    query += ` AND category = $${params.length}`;
  }
  
  if (active_only === 'true') {
    query += ` AND is_active = true`;
  }
  
  query += ` ORDER BY category, sort_order, display_name`;
  
  const result = await pool.query(query, params);
  
  res.json({
    success: true,
    data: result.rows
  });
}));

// GET /api/v1/modifications/categories - List all categories
router.get('/categories', authenticate, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  
  const result = await pool.query(`
    SELECT DISTINCT category, COUNT(*) as count
    FROM modifications
    WHERE tenant_id = $1 AND is_active = true
    GROUP BY category
    ORDER BY category
  `, [tenantId]);
  
  res.json({
    success: true,
    data: result.rows
  });
}));

// POST /api/v1/modifications - Create a modification
router.post('/', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { name, display_name, price_adjustment, category, sort_order } = req.body;
  
  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  
  const result = await pool.query(`
    INSERT INTO modifications (tenant_id, name, display_name, price_adjustment, category, sort_order)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [
    tenantId,
    name,
    display_name || name,
    price_adjustment || 0,
    category || 'general',
    sort_order || 0
  ]);
  
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
}));

// PUT /api/v1/modifications/:id - Update a modification
router.put('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { name, display_name, price_adjustment, category, sort_order, is_active } = req.body;
  
  const result = await pool.query(`
    UPDATE modifications
    SET name = COALESCE($1, name),
        display_name = COALESCE($2, display_name),
        price_adjustment = COALESCE($3, price_adjustment),
        category = COALESCE($4, category),
        sort_order = COALESCE($5, sort_order),
        is_active = COALESCE($6, is_active)
    WHERE id = $7 AND tenant_id = $8
    RETURNING *
  `, [name, display_name, price_adjustment, category, sort_order, is_active, id, tenantId]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Modification not found' });
  }
  
  res.json({
    success: true,
    data: result.rows[0]
  });
}));

// DELETE /api/v1/modifications/:id - Delete a modification
router.delete('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  // Check if modification is in use
  const usageCheck = await pool.query(`
    SELECT COUNT(*) FROM menu_item_modifications 
    WHERE modification_id = $1 AND tenant_id = $2
  `, [id, tenantId]);
  
  if (parseInt(usageCheck.rows[0].count) > 0) {
    // Soft delete - just deactivate
    await pool.query(`
      UPDATE modifications SET is_active = false 
      WHERE id = $1 AND tenant_id = $2
    `, [id, tenantId]);
    return res.json({
      success: true,
      message: 'Modification deactivated (in use by menu items)'
    });
  }
  
  // Hard delete if not in use
  const result = await pool.query(`
    DELETE FROM modifications WHERE id = $1 AND tenant_id = $2 RETURNING id
  `, [id, tenantId]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Modification not found' });
  }
  
  res.json({
    success: true,
    message: 'Modification deleted'
  });
}));

// ============================================================================
// MENU ITEM MODIFICATIONS
// ============================================================================

// GET /api/v1/modifications/menu-item/:menuItemId - Get modifications for a menu item
router.get('/menu-item/:menuItemId', authenticate, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { menuItemId } = req.params;
  
  // Get modifications assigned to this item
  const assigned = await pool.query(`
    SELECT 
      mim.id as assignment_id,
      mim.menu_item_id,
      mim.modification_id,
      mim.price_override,
      mim.is_default,
      mim.group_name,
      mim.is_required,
      mim.sort_order as assignment_sort,
      m.id,
      m.name,
      m.display_name,
      m.price_adjustment,
      m.category,
      m.sort_order
    FROM menu_item_modifications mim
    JOIN modifications m ON m.id = mim.modification_id AND m.tenant_id = mim.tenant_id
    WHERE mim.menu_item_id = $1
      AND mim.tenant_id = $2
      AND mim.is_active = true
      AND m.is_active = true
    ORDER BY mim.group_name NULLS LAST, mim.sort_order, m.sort_order, m.display_name
  `, [menuItemId, tenantId]);
  
  // Group by group_name for required selections
  const grouped = {};
  const ungrouped = [];
  
  for (const row of assigned.rows) {
    const mod = {
      id: row.modification_id,
      name: row.name,
      display_name: row.display_name,
      price: row.price_override !== null ? parseFloat(row.price_override) : parseFloat(row.price_adjustment),
      category: row.category,
      is_default: row.is_default,
      is_required: row.is_required,
      group_name: row.group_name
    };
    
    if (row.group_name) {
      if (!grouped[row.group_name]) {
        grouped[row.group_name] = {
          name: row.group_name,
          is_required: row.is_required,
          options: []
        };
      }
      grouped[row.group_name].options.push(mod);
    } else {
      ungrouped.push(mod);
    }
  }
  
  res.json({
    success: true,
    data: {
      menu_item_id: menuItemId,
      groups: Object.values(grouped),
      modifications: ungrouped
    }
  });
}));

// POST /api/v1/modifications/menu-item/:menuItemId - Assign modification to menu item
router.post('/menu-item/:menuItemId', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { menuItemId } = req.params;
  const { modification_id, price_override, is_default, group_name, is_required, sort_order } = req.body;
  
  if (!modification_id) {
    return res.status(400).json({ success: false, message: 'modification_id is required' });
  }
  
  const result = await pool.query(`
    INSERT INTO menu_item_modifications 
      (tenant_id, menu_item_id, modification_id, price_override, is_default, group_name, is_required, sort_order)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (tenant_id, menu_item_id, modification_id) 
    DO UPDATE SET
      price_override = EXCLUDED.price_override,
      is_default = EXCLUDED.is_default,
      group_name = EXCLUDED.group_name,
      is_required = EXCLUDED.is_required,
      sort_order = EXCLUDED.sort_order,
      is_active = true
    RETURNING *
  `, [tenantId, menuItemId, modification_id, price_override, is_default || false, group_name, is_required || false, sort_order || 0]);
  
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
}));

// POST /api/v1/modifications/menu-item/:menuItemId/bulk - Bulk assign modifications
router.post('/menu-item/:menuItemId/bulk', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { menuItemId } = req.params;
  const { modification_ids, group_name, is_required } = req.body;
  
  if (!modification_ids || !Array.isArray(modification_ids)) {
    return res.status(400).json({ success: false, message: 'modification_ids array is required' });
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const modId of modification_ids) {
      const result = await client.query(`
        INSERT INTO menu_item_modifications 
          (tenant_id, menu_item_id, modification_id, group_name, is_required)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (tenant_id, menu_item_id, modification_id) 
        DO UPDATE SET
          group_name = COALESCE(EXCLUDED.group_name, menu_item_modifications.group_name),
          is_required = COALESCE(EXCLUDED.is_required, menu_item_modifications.is_required),
          is_active = true
        RETURNING *
      `, [tenantId, menuItemId, modId, group_name, is_required || false]);
      results.push(result.rows[0]);
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      data: results,
      message: `${results.length} modifications assigned`
    });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

// DELETE /api/v1/modifications/menu-item/:menuItemId/:modificationId - Remove modification from menu item
router.delete('/menu-item/:menuItemId/:modificationId', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { menuItemId, modificationId } = req.params;
  
  const result = await pool.query(`
    DELETE FROM menu_item_modifications
    WHERE menu_item_id = $1 AND modification_id = $2 AND tenant_id = $3
    RETURNING id
  `, [menuItemId, modificationId, tenantId]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Assignment not found' });
  }
  
  res.json({
    success: true,
    message: 'Modification removed from menu item'
  });
}));

// DELETE /api/v1/modifications/menu-item/:menuItemId - Remove all modifications from menu item
router.delete('/menu-item/:menuItemId', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { menuItemId } = req.params;
  
  const result = await pool.query(`
    DELETE FROM menu_item_modifications
    WHERE menu_item_id = $1 AND tenant_id = $2
    RETURNING id
  `, [menuItemId, tenantId]);
  
  res.json({
    success: true,
    message: `${result.rowCount} modifications removed`
  });
}));

// ============================================================================
// COPY MODIFICATIONS BETWEEN ITEMS
// ============================================================================

// POST /api/v1/modifications/copy - Copy modifications from one item to others
router.post('/copy', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { source_item_id, target_item_ids } = req.body;
  
  if (!source_item_id || !target_item_ids || !Array.isArray(target_item_ids)) {
    return res.status(400).json({ 
      success: false, 
      message: 'source_item_id and target_item_ids array required' 
    });
  }
  
  // Get source modifications
  const sourceMods = await pool.query(`
    SELECT modification_id, price_override, is_default, group_name, is_required, sort_order
    FROM menu_item_modifications
    WHERE menu_item_id = $1 AND tenant_id = $2 AND is_active = true
  `, [source_item_id, tenantId]);
  
  if (sourceMods.rows.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Source item has no modifications' 
    });
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    let totalCopied = 0;
    for (const targetId of target_item_ids) {
      for (const mod of sourceMods.rows) {
        await client.query(`
          INSERT INTO menu_item_modifications 
            (tenant_id, menu_item_id, modification_id, price_override, is_default, group_name, is_required, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (tenant_id, menu_item_id, modification_id) DO NOTHING
        `, [tenantId, targetId, mod.modification_id, mod.price_override, mod.is_default, mod.group_name, mod.is_required, mod.sort_order]);
        totalCopied++;
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: `Copied ${sourceMods.rows.length} modifications to ${target_item_ids.length} items`
    });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

module.exports = router;
