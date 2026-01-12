/**
 * Blog Posts Routes
 * CRUD operations for blog posts
 */

const express = require('express');
const { body, validationResult } = require('express-validator');

const db = require('../../config/database');
const { authenticate, optionalAuth, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Valid statuses
const VALID_STATUSES = ['draft', 'published', 'archived'];

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
};

// Validation rules
const postValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
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
 * GET /blog/tags/all
 * Get all unique tags
 */
router.get('/tags/all', asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT DISTINCT unnest(tags) as tag
    FROM blog_posts
    WHERE status = 'published'
    ORDER BY tag
  `);

  res.json({
    status: 'success',
    data: result.rows.map(r => r.tag),
  });
}));

/**
 * GET /blog
 * List published blog posts (public)
 */
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    tag,
    search
  } = req.query;

  const isStaff = ['admin', 'staff'].includes(req.user?.role);
  
  let queryText = `
    SELECT 
      id, slug, title, excerpt, featured_image, author_name,
      status, published_at, tags, view_count, created_at
    FROM blog_posts
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  // Only show published posts to public
  if (!isStaff) {
    queryText += ` AND status = 'published'`;
  }

  if (tag) {
    params.push(tag);
    queryText += ` AND $${++paramCount} = ANY(tags)`;
  }

  if (search) {
    params.push(`%${search}%`);
    paramCount++;
    queryText += ` AND (title ILIKE $${paramCount} OR excerpt ILIKE $${paramCount} OR content ILIKE $${paramCount})`;
  }

  // Count total
  const countQuery = `SELECT COUNT(*) FROM (${queryText}) as filtered`;
  const countResult = await db.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count, 10);

  // Sort and paginate
  queryText += ` ORDER BY published_at DESC NULLS LAST, created_at DESC`;
  
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
 * GET /blog/:slug
 * Get single blog post by slug (public)
 */
router.get('/:slug', optionalAuth, asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const isStaff = ['admin', 'staff'].includes(req.user?.role);

  const result = await db.query(`
    SELECT 
      bp.*,
      a.name as author_display_name
    FROM blog_posts bp
    LEFT JOIN accounts a ON bp.author_id = a.id
    WHERE bp.slug = $1 OR bp.id::text = $1
  `, [slug]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Blog post not found');
  }

  const post = result.rows[0];

  // Non-staff can only see published posts
  if (!isStaff && post.status !== 'published') {
    throw new ApiError(404, 'Blog post not found');
  }

  // Increment view count (don't wait for it)
  db.query('UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1', [post.id])
    .catch(err => logger.error('Failed to update view count', { postId: post.id, error: err.message }));

  res.json({
    status: 'success',
    data: post,
  });
}));

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * POST /blog
 * Create new blog post (staff+ only)
 */
router.post('/', authenticate, requireStaff, postValidation, validate, asyncHandler(async (req, res) => {
  const {
    title,
    slug: customSlug,
    excerpt,
    content,
    featured_image,
    status = 'draft',
    tags = [],
    meta_title,
    meta_description
  } = req.body;

  // Generate or use custom slug
  let slug = customSlug || generateSlug(title);
  
  // Ensure slug is unique
  const slugCheck = await db.query('SELECT id FROM blog_posts WHERE slug = $1', [slug]);
  if (slugCheck.rows.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }

  // Set published_at if publishing
  const publishedAt = status === 'published' ? new Date() : null;

  const result = await db.query(`
    INSERT INTO blog_posts (
      slug, title, excerpt, content, featured_image, author_id, author_name,
      status, published_at, tags, meta_title, meta_description
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `, [
    slug,
    title,
    excerpt || null,
    content,
    featured_image || null,
    req.user.id,
    req.user.name,
    status,
    publishedAt,
    tags,
    meta_title || title,
    meta_description || excerpt
  ]);

  logger.info('Blog post created', { postId: result.rows[0].id, slug, createdBy: req.user.id });

  res.status(201).json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * PUT /blog/:id
 * Update blog post (staff+ only)
 */
router.put('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    slug: customSlug,
    excerpt,
    content,
    featured_image,
    status,
    tags,
    meta_title,
    meta_description
  } = req.body;

  // Get current post
  const current = await db.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
  if (current.rows.length === 0) {
    throw new ApiError(404, 'Blog post not found');
  }
  const currentPost = current.rows[0];

  // Handle slug change
  let slug = customSlug;
  if (slug && slug !== currentPost.slug) {
    const slugCheck = await db.query('SELECT id FROM blog_posts WHERE slug = $1 AND id != $2', [slug, id]);
    if (slugCheck.rows.length > 0) {
      throw new ApiError(400, 'Slug already in use');
    }
  }

  // Handle publishing
  let publishedAt = currentPost.published_at;
  if (status === 'published' && currentPost.status !== 'published') {
    publishedAt = new Date();
  }

  const result = await db.query(`
    UPDATE blog_posts SET
      title = COALESCE($1, title),
      slug = COALESCE($2, slug),
      excerpt = $3,
      content = COALESCE($4, content),
      featured_image = $5,
      status = COALESCE($6, status),
      published_at = $7,
      tags = COALESCE($8, tags),
      meta_title = $9,
      meta_description = $10,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $11
    RETURNING *
  `, [
    title,
    slug,
    excerpt !== undefined ? excerpt : currentPost.excerpt,
    content,
    featured_image !== undefined ? featured_image : currentPost.featured_image,
    status,
    publishedAt,
    tags,
    meta_title !== undefined ? meta_title : currentPost.meta_title,
    meta_description !== undefined ? meta_description : currentPost.meta_description,
    id
  ]);

  logger.info('Blog post updated', { postId: id, updatedBy: req.user.id });

  res.json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * DELETE /blog/:id
 * Delete blog post (staff+ only)
 */
router.delete('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { hard = false } = req.query;

  if (hard === 'true') {
    const result = await db.query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Blog post not found');
    }
    logger.info('Blog post deleted', { postId: id, deletedBy: req.user.id });
    
    res.json({
      status: 'success',
      message: 'Blog post deleted permanently',
    });
  } else {
    // Soft delete: archive
    const result = await db.query(
      `UPDATE blog_posts SET status = 'archived', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Blog post not found');
    }
    logger.info('Blog post archived', { postId: id, deletedBy: req.user.id });
    
    res.json({
      status: 'success',
      message: 'Blog post archived',
    });
  }
}));

module.exports = router;
