/**
 * Item Categories Routes
 * Handles product/item categories (Beef, Chicken, Eggs, etc.)
 */

const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticate, requireStaff, requireAdmin } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// ============================================================================
// GET /item-categories - List all item categories
// ============================================================================
router.get('/', asyncHandler(async (req, res) => {
  const { include_inactive } = req.query;
  
  let query = `
    SELECT c.*,
           (SELECT COUNT(*) FROM items i WHERE i.category_id = c.id) as item_count
    FROM categories c
    WHERE 1=1
  `;
  
  if (include_inactive !== 'true') {
    query += ` AND c.is_active = true`;
  }
  
  query += ` ORDER BY c.sort_order, c.name`;
  
  const result = await db.query(query);
  
  res.json({
    status: 'success',
    data: result.rows
  });
}));

// ============================================================================
// GET /item-categories/:id - Get single category with items
// ============================================================================
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await db.query(`
    SELECT c.*,
           (SELECT COUNT(*) FROM items i WHERE i.category_id = c.id) as item_count
    FROM categories c
    WHERE c.id = $1 OR c.slug = $1
  `, [id]);
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Category not found');
  }
  
  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

// ============================================================================
// POST /item-categories - Create new category
// ============================================================================
router.post('/', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { name, slug, description, sort_order = 0 } = req.body;
  
  if (!name) {
    throw new ApiError(400, 'Name is required');
  }
  
  // Auto-generate slug if not provided
  const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Check for duplicate name or slug
  const existing = await db.query(
    'SELECT id FROM categories WHERE name = $1 OR slug = $2',
    [name, categorySlug]
  );
  
  if (existing.rows.length > 0) {
    throw new ApiError(400, 'A category with this name or slug already exists');
  }
  
  const result = await db.query(`
    INSERT INTO categories (name, slug, description, sort_order)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [name, categorySlug, description || null, sort_order]);
  
  logger.info(`Item category created: ${name}`);
  
  res.status(201).json({
    status: 'success',
    data: result.rows[0]
  });
}));

// ============================================================================
// PUT /item-categories/:id - Update category
// ============================================================================
router.put('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, sort_order, is_active } = req.body;
  
  // If updating name or slug, check for duplicates
  if (name || slug) {
    const existing = await db.query(
      'SELECT id FROM categories WHERE (name = $1 OR slug = $2) AND id != $3',
      [name, slug, id]
    );
    
    if (existing.rows.length > 0) {
      throw new ApiError(400, 'A category with this name or slug already exists');
    }
  }
  
  const result = await db.query(`
    UPDATE categories 
    SET name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        sort_order = COALESCE($4, sort_order),
        is_active = COALESCE($5, is_active),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *
  `, [name, slug, description, sort_order, is_active, id]);
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Category not found');
  }
  
  logger.info(`Item category updated: ${result.rows[0].name}`);
  
  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

// ============================================================================
// DELETE /item-categories/:id - Delete category
// ============================================================================
router.delete('/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if category has items
  const itemCheck = await db.query(
    'SELECT COUNT(*) as count FROM items WHERE category_id = $1',
    [id]
  );
  
  if (parseInt(itemCheck.rows[0].count) > 0) {
    // Soft delete - just deactivate
    await db.query(
      'UPDATE categories SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    
    return res.json({
      status: 'success',
      message: 'Category deactivated (has associated items)'
    });
  }
  
  // Hard delete if no items
  const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Category not found');
  }
  
  res.json({
    status: 'success',
    message: 'Category deleted'
  });
}));

// ============================================================================
// PATCH /item-categories/:id/reorder - Update sort order
// ============================================================================
router.patch('/:id/reorder', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sort_order } = req.body;
  
  if (sort_order === undefined) {
    throw new ApiError(400, 'sort_order is required');
  }
  
  const result = await db.query(`
    UPDATE categories 
    SET sort_order = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `, [sort_order, id]);
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Category not found');
  }
  
  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

module.exports = router;
