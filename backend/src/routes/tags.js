/**
 * Tags Routes
 * Product tag management
 */

const express = require('express');
const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * GET /tags
 * List all tags (public)
 */
router.get('/', asyncHandler(async (req, res) => {
  const result = await db.query('SELECT * FROM tags ORDER BY name');

  res.json({
    status: 'success',
    data: result.rows,
  });
}));

/**
 * POST /tags
 * Create new tag (staff+)
 */
router.post('/', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, 'Name is required');
  }

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const result = await db.query(
    'INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING *',
    [name, slug]
  );

  res.status(201).json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * DELETE /tags/:id
 * Delete tag (staff+)
 */
router.delete('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query('DELETE FROM tags WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Tag not found');
  }

  res.json({
    status: 'success',
    message: 'Tag deleted',
  });
}));

module.exports = router;
