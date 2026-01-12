/**
 * Menu Routes
 * CRUD operations for food trailer menus
 */

const express = require('express');
const { body, validationResult } = require('express-validator');

const db = require('../../config/database');
const { authenticate, optionalAuth, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Valid statuses
const VALID_STATUSES = ['draft', 'active', 'archived'];

// Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
};

// Validation
const menuValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(VALID_STATUSES).withMessage('Invalid status'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }
  next();
};

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * GET /menus
 * List all active menus (public)
 */
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { status, menu_type, season, featured } = req.query;
  const isStaff = ['admin', 'staff'].includes(req.user?.role);

  let queryText = `
    SELECT 
      m.*,
      (SELECT COUNT(*) FROM menu_sections WHERE menu_id = m.id) as section_count,
      a.name as created_by_name
    FROM menus m
    LEFT JOIN accounts a ON m.created_by = a.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  // Non-staff only see active menus
  if (!isStaff) {
    queryText += ` AND m.status = 'active'`;
  } else if (status) {
    params.push(status);
    queryText += ` AND m.status = $${++paramCount}`;
  }

  if (menu_type) {
    params.push(menu_type);
    queryText += ` AND m.menu_type = $${++paramCount}`;
  }

  if (season) {
    params.push(season);
    queryText += ` AND (m.season = $${++paramCount} OR m.season = 'all')`;
  }

  if (featured === 'true') {
    queryText += ` AND m.is_featured = true`;
  }

  queryText += ` ORDER BY m.is_featured DESC, m.updated_at DESC`;

  const result = await db.query(queryText, params);

  res.json({
    status: 'success',
    data: result.rows,
  });
}));

/**
 * GET /menus/featured
 * Get the current featured menu with full details
 */
router.get('/featured', asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT m.* FROM menus m
    WHERE m.status = 'active' AND m.is_featured = true
    ORDER BY m.updated_at DESC
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    // Fall back to most recent active menu
    const fallback = await db.query(`
      SELECT m.* FROM menus m
      WHERE m.status = 'active'
      ORDER BY m.updated_at DESC
      LIMIT 1
    `);
    
    if (fallback.rows.length === 0) {
      throw new ApiError(404, 'No active menu found');
    }
    
    return res.json({
      status: 'success',
      data: await getFullMenu(fallback.rows[0].id),
    });
  }

  res.json({
    status: 'success',
    data: await getFullMenu(result.rows[0].id),
  });
}));

/**
 * GET /menus/items/public
 * Get all available menu items (public - for event planning)
 */
router.get('/items/public', asyncHandler(async (req, res) => {
  const { search } = req.query;

  let queryText = `
    SELECT id, name, description, price, price_label,
      is_vegetarian, is_vegan, is_gluten_free, is_dairy_free, is_spicy,
      allergens, image_url
    FROM menu_items 
    WHERE is_available = true
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    queryText += ` AND (name ILIKE $1 OR description ILIKE $1)`;
  }

  queryText += ' ORDER BY name';

  const result = await db.query(queryText, params);

  res.json({
    status: 'success',
    data: result.rows,
  });
}));

/**
 * GET /menus/:idOrSlug
 * Get a single menu with all sections and items
 */
router.get('/:idOrSlug', optionalAuth, asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isStaff = ['admin', 'staff'].includes(req.user?.role);

  // Find menu by ID or slug
  const menuResult = await db.query(`
    SELECT m.*, a.name as created_by_name
    FROM menus m
    LEFT JOIN accounts a ON m.created_by = a.id
    WHERE m.id::text = $1 OR m.slug = $1
  `, [idOrSlug]);

  if (menuResult.rows.length === 0) {
    throw new ApiError(404, 'Menu not found');
  }

  const menu = menuResult.rows[0];

  // Non-staff can only see active menus
  if (!isStaff && menu.status !== 'active') {
    throw new ApiError(404, 'Menu not found');
  }

  const fullMenu = await getFullMenu(menu.id);

  res.json({
    status: 'success',
    data: fullMenu,
  });
}));

// Helper function to get full menu with sections and items
async function getFullMenu(menuId) {
  const menuResult = await db.query(`
    SELECT m.*, a.name as created_by_name
    FROM menus m
    LEFT JOIN accounts a ON m.created_by = a.id
    WHERE m.id = $1
  `, [menuId]);

  if (menuResult.rows.length === 0) {
    return null;
  }

  const menu = menuResult.rows[0];

  // Get sections with items
  const sectionsResult = await db.query(`
    SELECT 
      ms.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', mi.id,
            'name', mi.name,
            'description', COALESCE(msi.override_description, mi.description),
            'price', COALESCE(msi.override_price, mi.price),
            'price_label', mi.price_label,
            'image_url', mi.image_url,
            'is_vegetarian', mi.is_vegetarian,
            'is_vegan', mi.is_vegan,
            'is_gluten_free', mi.is_gluten_free,
            'is_dairy_free', mi.is_dairy_free,
            'is_spicy', mi.is_spicy,
            'allergens', mi.allergens,
            'is_featured', mi.is_featured,
            'is_available', msi.is_available,
            'sort_order', msi.sort_order
          ) ORDER BY msi.sort_order
        ) FILTER (WHERE mi.id IS NOT NULL),
        '[]'
      ) as items
    FROM menu_sections ms
    LEFT JOIN menu_section_items msi ON ms.id = msi.section_id
    LEFT JOIN menu_items mi ON msi.menu_item_id = mi.id
    WHERE ms.menu_id = $1
    GROUP BY ms.id
    ORDER BY ms.sort_order
  `, [menuId]);

  menu.sections = sectionsResult.rows;

  return menu;
}

// ============================================================================
// ADMIN ROUTES - MENUS
// ============================================================================

/**
 * POST /menus
 * Create a new menu
 */
router.post('/', authenticate, requireStaff, menuValidation, validate, asyncHandler(async (req, res) => {
  const {
    name,
    slug: customSlug,
    description,
    season,
    menu_type = 'food_trailer',
    header_image,
    footer_text,
    status = 'draft',
    is_featured = false
  } = req.body;

  // Generate or use custom slug
  let slug = customSlug || generateSlug(name);
  
  // Ensure slug is unique
  const slugCheck = await db.query('SELECT id FROM menus WHERE slug = $1', [slug]);
  if (slugCheck.rows.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }

  // If setting as featured, unfeature others
  if (is_featured) {
    await db.query(`UPDATE menus SET is_featured = false WHERE is_featured = true`);
  }

  const result = await db.query(`
    INSERT INTO menus (
      name, slug, description, season, menu_type, header_image, footer_text,
      status, is_featured, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `, [
    name, slug, description, season, menu_type, header_image, footer_text,
    status, is_featured, req.user.id
  ]);

  logger.info('Menu created', { menuId: result.rows[0].id, slug, createdBy: req.user.id });

  res.status(201).json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * PUT /menus/:id
 * Update a menu
 */
router.put('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    slug,
    description,
    season,
    menu_type,
    header_image,
    footer_text,
    status,
    is_featured
  } = req.body;

  // Check menu exists
  const existing = await db.query('SELECT * FROM menus WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Menu not found');
  }

  // Check slug uniqueness if changing
  if (slug && slug !== existing.rows[0].slug) {
    const slugCheck = await db.query('SELECT id FROM menus WHERE slug = $1 AND id != $2', [slug, id]);
    if (slugCheck.rows.length > 0) {
      throw new ApiError(400, 'Slug already in use');
    }
  }

  // If setting as featured, unfeature others
  if (is_featured) {
    await db.query(`UPDATE menus SET is_featured = false WHERE is_featured = true AND id != $1`, [id]);
  }

  const result = await db.query(`
    UPDATE menus SET
      name = COALESCE($1, name),
      slug = COALESCE($2, slug),
      description = $3,
      season = COALESCE($4, season),
      menu_type = COALESCE($5, menu_type),
      header_image = $6,
      footer_text = $7,
      status = COALESCE($8, status),
      is_featured = COALESCE($9, is_featured),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $10
    RETURNING *
  `, [
    name, slug,
    description !== undefined ? description : existing.rows[0].description,
    season, menu_type,
    header_image !== undefined ? header_image : existing.rows[0].header_image,
    footer_text !== undefined ? footer_text : existing.rows[0].footer_text,
    status, is_featured, id
  ]);

  logger.info('Menu updated', { menuId: id, updatedBy: req.user.id });

  res.json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * DELETE /menus/:id
 * Delete a menu
 */
router.delete('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { hard = false } = req.query;

  if (hard === 'true') {
    const result = await db.query('DELETE FROM menus WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Menu not found');
    }
    logger.info('Menu deleted', { menuId: id, deletedBy: req.user.id });
    
    res.json({ status: 'success', message: 'Menu deleted permanently' });
  } else {
    const result = await db.query(
      `UPDATE menus SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Menu not found');
    }
    logger.info('Menu archived', { menuId: id, archivedBy: req.user.id });
    
    res.json({ status: 'success', message: 'Menu archived' });
  }
}));

/**
 * POST /menus/:id/duplicate
 * Duplicate a menu
 */
router.post('/:id/duplicate', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Get original menu
  const original = await db.query('SELECT * FROM menus WHERE id = $1', [id]);
  if (original.rows.length === 0) {
    throw new ApiError(404, 'Menu not found');
  }

  const menu = original.rows[0];
  const newName = name || `${menu.name} (Copy)`;
  const newSlug = generateSlug(newName) + `-${Date.now()}`;

  // Create new menu
  const newMenu = await db.query(`
    INSERT INTO menus (
      name, slug, description, season, menu_type, header_image, footer_text,
      status, created_by, parent_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', $8, $9)
    RETURNING *
  `, [
    newName, newSlug, menu.description, menu.season, menu.menu_type,
    menu.header_image, menu.footer_text, req.user.id, id
  ]);

  // Copy sections
  const sections = await db.query('SELECT * FROM menu_sections WHERE menu_id = $1 ORDER BY sort_order', [id]);
  
  for (const section of sections.rows) {
    const newSection = await db.query(`
      INSERT INTO menu_sections (menu_id, name, description, sort_order, show_prices, columns)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [newMenu.rows[0].id, section.name, section.description, section.sort_order, section.show_prices, section.columns]);

    // Copy section items
    const items = await db.query('SELECT * FROM menu_section_items WHERE section_id = $1 ORDER BY sort_order', [section.id]);
    
    for (const item of items.rows) {
      await db.query(`
        INSERT INTO menu_section_items (section_id, menu_item_id, override_price, override_description, sort_order, is_available)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [newSection.rows[0].id, item.menu_item_id, item.override_price, item.override_description, item.sort_order, item.is_available]);
    }
  }

  logger.info('Menu duplicated', { originalId: id, newId: newMenu.rows[0].id, createdBy: req.user.id });

  res.status(201).json({
    status: 'success',
    data: await getFullMenu(newMenu.rows[0].id),
  });
}));

// ============================================================================
// ADMIN ROUTES - SECTIONS
// ============================================================================

/**
 * POST /menus/:menuId/sections
 * Add a section to a menu
 */
router.post('/:menuId/sections', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { menuId } = req.params;
  const { name, description, sort_order, show_prices = true, columns = 1 } = req.body;

  // Verify menu exists
  const menu = await db.query('SELECT id FROM menus WHERE id = $1', [menuId]);
  if (menu.rows.length === 0) {
    throw new ApiError(404, 'Menu not found');
  }

  // Get next sort order if not provided
  let order = sort_order;
  if (order === undefined) {
    const maxOrder = await db.query('SELECT MAX(sort_order) as max FROM menu_sections WHERE menu_id = $1', [menuId]);
    order = (maxOrder.rows[0].max || 0) + 1;
  }

  const result = await db.query(`
    INSERT INTO menu_sections (menu_id, name, description, sort_order, show_prices, columns)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [menuId, name, description, order, show_prices, columns]);

  res.status(201).json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * PUT /menus/:menuId/sections/:sectionId
 * Update a section
 */
router.put('/:menuId/sections/:sectionId', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { sectionId } = req.params;
  const { name, description, sort_order, show_prices, columns } = req.body;

  const result = await db.query(`
    UPDATE menu_sections SET
      name = COALESCE($1, name),
      description = $2,
      sort_order = COALESCE($3, sort_order),
      show_prices = COALESCE($4, show_prices),
      columns = COALESCE($5, columns),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *
  `, [name, description, sort_order, show_prices, columns, sectionId]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Section not found');
  }

  res.json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * DELETE /menus/:menuId/sections/:sectionId
 * Delete a section
 */
router.delete('/:menuId/sections/:sectionId', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { sectionId } = req.params;

  const result = await db.query('DELETE FROM menu_sections WHERE id = $1 RETURNING id', [sectionId]);
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Section not found');
  }

  res.json({ status: 'success', message: 'Section deleted' });
}));

/**
 * PUT /menus/:menuId/sections/reorder
 * Reorder sections
 */
router.put('/:menuId/sections/reorder', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { menuId } = req.params;
  const { sections } = req.body; // Array of { id, sort_order }

  for (const section of sections) {
    await db.query(
      'UPDATE menu_sections SET sort_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND menu_id = $3',
      [section.sort_order, section.id, menuId]
    );
  }

  res.json({ status: 'success', message: 'Sections reordered' });
}));

// ============================================================================
// ADMIN ROUTES - MENU ITEMS
// ============================================================================

/**
 * GET /menus/items/all
 * Get all menu items (for picker/search)
 */
router.get('/items/all', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { search } = req.query;

  let queryText = 'SELECT * FROM menu_items WHERE 1=1';
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    queryText += ` AND (name ILIKE $1 OR description ILIKE $1)`;
  }

  queryText += ' ORDER BY name';

  const result = await db.query(queryText, params);

  res.json({
    status: 'success',
    data: result.rows,
  });
}));

/**
 * POST /menus/items
 * Create a new menu item
 */
router.post('/items', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    price_label,
    image_url,
    is_vegetarian = false,
    is_vegan = false,
    is_gluten_free = false,
    is_dairy_free = false,
    is_spicy = false,
    allergens = [],
    is_featured = false,
    item_id
  } = req.body;

  const result = await db.query(`
    INSERT INTO menu_items (
      name, description, price, price_label, image_url,
      is_vegetarian, is_vegan, is_gluten_free, is_dairy_free, is_spicy,
      allergens, is_featured, item_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `, [
    name, description, price, price_label, image_url,
    is_vegetarian, is_vegan, is_gluten_free, is_dairy_free, is_spicy,
    allergens, is_featured, item_id
  ]);

  res.status(201).json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * PUT /menus/items/:itemId
 * Update a menu item
 */
router.put('/items/:itemId', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const updates = req.body;

  const existing = await db.query('SELECT * FROM menu_items WHERE id = $1', [itemId]);
  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Menu item not found');
  }

  const result = await db.query(`
    UPDATE menu_items SET
      name = COALESCE($1, name),
      description = $2,
      price = $3,
      price_label = $4,
      image_url = $5,
      is_vegetarian = COALESCE($6, is_vegetarian),
      is_vegan = COALESCE($7, is_vegan),
      is_gluten_free = COALESCE($8, is_gluten_free),
      is_dairy_free = COALESCE($9, is_dairy_free),
      is_spicy = COALESCE($10, is_spicy),
      allergens = COALESCE($11, allergens),
      is_featured = COALESCE($12, is_featured),
      is_available = COALESCE($13, is_available),
      item_id = $14,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $15
    RETURNING *
  `, [
    updates.name,
    updates.description !== undefined ? updates.description : existing.rows[0].description,
    updates.price !== undefined ? updates.price : existing.rows[0].price,
    updates.price_label !== undefined ? updates.price_label : existing.rows[0].price_label,
    updates.image_url !== undefined ? updates.image_url : existing.rows[0].image_url,
    updates.is_vegetarian,
    updates.is_vegan,
    updates.is_gluten_free,
    updates.is_dairy_free,
    updates.is_spicy,
    updates.allergens,
    updates.is_featured,
    updates.is_available,
    updates.item_id !== undefined ? updates.item_id : existing.rows[0].item_id,
    itemId
  ]);

  res.json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * DELETE /menus/items/:itemId
 * Delete a menu item
 */
router.delete('/items/:itemId', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const result = await db.query('DELETE FROM menu_items WHERE id = $1 RETURNING id', [itemId]);
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Menu item not found');
  }

  res.json({ status: 'success', message: 'Menu item deleted' });
}));

// ============================================================================
// ADMIN ROUTES - SECTION ITEMS (linking items to sections)
// ============================================================================

/**
 * POST /menus/:menuId/sections/:sectionId/items
 * Add an item to a section
 */
router.post('/:menuId/sections/:sectionId/items', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { sectionId } = req.params;
  const { menu_item_id, override_price, override_description, sort_order } = req.body;

  // Verify section exists
  const section = await db.query('SELECT id FROM menu_sections WHERE id = $1', [sectionId]);
  if (section.rows.length === 0) {
    throw new ApiError(404, 'Section not found');
  }

  // Get next sort order if not provided
  let order = sort_order;
  if (order === undefined) {
    const maxOrder = await db.query('SELECT MAX(sort_order) as max FROM menu_section_items WHERE section_id = $1', [sectionId]);
    order = (maxOrder.rows[0].max || 0) + 1;
  }

  const result = await db.query(`
    INSERT INTO menu_section_items (section_id, menu_item_id, override_price, override_description, sort_order)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (section_id, menu_item_id) DO UPDATE SET
      override_price = EXCLUDED.override_price,
      override_description = EXCLUDED.override_description,
      sort_order = EXCLUDED.sort_order
    RETURNING *
  `, [sectionId, menu_item_id, override_price, override_description, order]);

  res.status(201).json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * DELETE /menus/:menuId/sections/:sectionId/items/:itemId
 * Remove an item from a section
 */
router.delete('/:menuId/sections/:sectionId/items/:itemId', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { sectionId, itemId } = req.params;

  const result = await db.query(
    'DELETE FROM menu_section_items WHERE section_id = $1 AND menu_item_id = $2 RETURNING id',
    [sectionId, itemId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Item not in section');
  }

  res.json({ status: 'success', message: 'Item removed from section' });
}));

/**
 * PUT /menus/:menuId/sections/:sectionId/items/reorder
 * Reorder items in a section
 */
router.put('/:menuId/sections/:sectionId/items/reorder', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { sectionId } = req.params;
  const { items } = req.body; // Array of { menu_item_id, sort_order }

  for (const item of items) {
    await db.query(
      'UPDATE menu_section_items SET sort_order = $1 WHERE section_id = $2 AND menu_item_id = $3',
      [item.sort_order, sectionId, item.menu_item_id]
    );
  }

  res.json({ status: 'success', message: 'Items reordered' });
}));

module.exports = router;
