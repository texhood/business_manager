/**
 * Social Media Routes
 * Manage social posts, platforms, and connections
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication and staff role
router.use(authenticate, requireStaff);

// Valid statuses
const VALID_POST_STATUSES = ['draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled'];

// ============================================================================
// PLATFORMS
// ============================================================================

/**
 * GET /social/platforms
 * Get all available social platforms
 */
router.get('/platforms', asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT * FROM social_platforms
    WHERE is_enabled = true
    ORDER BY display_name
  `);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

// ============================================================================
// CONNECTIONS
// ============================================================================

/**
 * GET /social/connections
 * Get all social media connections for the tenant
 */
router.get('/connections', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';

  const result = await db.query(`
    SELECT 
      sc.*,
      sp.name as platform_name,
      sp.display_name as platform_display_name,
      sp.icon as platform_icon,
      sp.max_characters
    FROM social_connections sc
    JOIN social_platforms sp ON sc.platform_id = sp.id
    WHERE sc.tenant_id = $1
    ORDER BY sp.display_name, sc.account_name
  `, [tenantId]);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

/**
 * POST /social/connections
 * Create a new social connection (mock for now - will be OAuth callback in production)
 */
router.post('/connections', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { platform_id, account_name, account_id } = req.body;

  // For MVP, create a mock "connected" connection
  const result = await db.query(`
    INSERT INTO social_connections (
      tenant_id, platform_id, account_name, account_id, status, connected_by
    ) VALUES ($1, $2, $3, $4, 'connected', $5)
    RETURNING *
  `, [tenantId, platform_id, account_name, account_id || `mock_${Date.now()}`, req.user.id]);

  // Get platform info
  const connection = result.rows[0];
  const platformResult = await db.query('SELECT * FROM social_platforms WHERE id = $1', [platform_id]);
  
  res.status(201).json({
    status: 'success',
    data: {
      ...connection,
      platform_name: platformResult.rows[0]?.name,
      platform_display_name: platformResult.rows[0]?.display_name,
      platform_icon: platformResult.rows[0]?.icon
    }
  });
}));

/**
 * DELETE /social/connections/:id
 * Disconnect a social account
 */
router.delete('/connections/:id', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { id } = req.params;

  const result = await db.query(`
    DELETE FROM social_connections
    WHERE id = $1 AND tenant_id = $2
    RETURNING id
  `, [id, tenantId]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Connection not found');
  }

  res.json({
    status: 'success',
    message: 'Connection removed'
  });
}));

// ============================================================================
// POSTS
// ============================================================================

/**
 * GET /social/posts
 * Get all social posts with optional filters
 */
router.get('/posts', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { status, start_date, end_date, page = 1, limit = 50 } = req.query;

  let query = `
    SELECT 
      sp.*,
      bp.title as blog_post_title,
      bp.slug as blog_post_slug,
      (
        SELECT json_agg(json_build_object(
          'id', spp.id,
          'connection_id', spp.connection_id,
          'platform_name', plt.name,
          'platform_display_name', plt.display_name,
          'account_name', sc.account_name,
          'status', spp.status,
          'published_at', spp.published_at,
          'platform_post_url', spp.platform_post_url,
          'likes_count', spp.likes_count,
          'comments_count', spp.comments_count,
          'shares_count', spp.shares_count
        ))
        FROM social_post_platforms spp
        JOIN social_connections sc ON spp.connection_id = sc.id
        JOIN social_platforms plt ON sc.platform_id = plt.id
        WHERE spp.social_post_id = sp.id
      ) as platforms
    FROM social_posts sp
    LEFT JOIN blog_posts bp ON sp.blog_post_id = bp.id
    WHERE sp.tenant_id = $1
  `;
  const params = [tenantId];
  let paramCount = 1;

  if (status) {
    params.push(status);
    query += ` AND sp.status = $${++paramCount}`;
  }

  if (start_date) {
    params.push(start_date);
    query += ` AND (sp.scheduled_for >= $${++paramCount} OR sp.posted_at >= $${paramCount})`;
  }

  if (end_date) {
    params.push(end_date);
    query += ` AND (sp.scheduled_for <= $${++paramCount} OR sp.posted_at <= $${paramCount})`;
  }

  // Count total
  const countQuery = `SELECT COUNT(*) FROM (${query}) as filtered`;
  const countResult = await db.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count, 10);

  // Add ordering and pagination
  query += ` ORDER BY COALESCE(sp.scheduled_for, sp.created_at) DESC`;
  
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  params.push(parseInt(limit, 10), offset);
  query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;

  const result = await db.query(query, params);

  res.json({
    status: 'success',
    data: result.rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  });
}));

/**
 * GET /social/posts/calendar
 * Get posts for calendar view (optimized for date range)
 */
router.get('/posts/calendar', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    throw new ApiError(400, 'start_date and end_date are required');
  }

  const result = await db.query(`
    SELECT 
      sp.id,
      sp.content,
      sp.scheduled_for,
      sp.posted_at,
      sp.status,
      sp.media_urls,
      sp.blog_post_id,
      bp.title as blog_post_title,
      (
        SELECT json_agg(json_build_object(
          'platform_name', plt.name,
          'platform_display_name', plt.display_name,
          'account_name', sc.account_name,
          'status', spp.status
        ))
        FROM social_post_platforms spp
        JOIN social_connections sc ON spp.connection_id = sc.id
        JOIN social_platforms plt ON sc.platform_id = plt.id
        WHERE spp.social_post_id = sp.id
      ) as platforms
    FROM social_posts sp
    LEFT JOIN blog_posts bp ON sp.blog_post_id = bp.id
    WHERE sp.tenant_id = $1
      AND sp.status != 'cancelled'
      AND (
        (sp.scheduled_for >= $2 AND sp.scheduled_for <= $3)
        OR (sp.posted_at >= $2 AND sp.posted_at <= $3)
      )
    ORDER BY COALESCE(sp.scheduled_for, sp.posted_at)
  `, [tenantId, start_date, end_date]);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

/**
 * GET /social/posts/:id
 * Get a single post with full details
 */
router.get('/posts/:id', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { id } = req.params;

  const result = await db.query(`
    SELECT 
      sp.*,
      bp.title as blog_post_title,
      bp.slug as blog_post_slug,
      bp.excerpt as blog_post_excerpt,
      (
        SELECT json_agg(json_build_object(
          'id', spp.id,
          'connection_id', spp.connection_id,
          'platform_name', plt.name,
          'platform_display_name', plt.display_name,
          'platform_icon', plt.icon,
          'account_name', sc.account_name,
          'status', spp.status,
          'content_override', spp.content_override,
          'published_at', spp.published_at,
          'platform_post_url', spp.platform_post_url,
          'error_message', spp.error_message,
          'likes_count', spp.likes_count,
          'comments_count', spp.comments_count,
          'shares_count', spp.shares_count,
          'clicks_count', spp.clicks_count,
          'impressions_count', spp.impressions_count
        ))
        FROM social_post_platforms spp
        JOIN social_connections sc ON spp.connection_id = sc.id
        JOIN social_platforms plt ON sc.platform_id = plt.id
        WHERE spp.social_post_id = sp.id
      ) as platforms
    FROM social_posts sp
    LEFT JOIN blog_posts bp ON sp.blog_post_id = bp.id
    WHERE sp.id = $1 AND sp.tenant_id = $2
  `, [id, tenantId]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Post not found');
  }

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

/**
 * POST /social/posts
 * Create a new social post
 */
router.post('/posts', [
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('connection_ids').isArray({ min: 1 }).withMessage('At least one platform connection is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const {
    content,
    media_urls = [],
    link_url,
    link_title,
    link_description,
    link_image_url,
    blog_post_id,
    scheduled_for,
    is_recurring = false,
    recurrence_rule,
    recurrence_end_date,
    connection_ids,
    platform_overrides = {}  // { connection_id: { content_override: '...' } }
  } = req.body;

  // Determine status
  let status = 'draft';
  if (scheduled_for) {
    const scheduleDate = new Date(scheduled_for);
    if (scheduleDate <= new Date()) {
      status = 'publishing';  // Post immediately
    } else {
      status = 'scheduled';
    }
  }

  // Create the post
  const postResult = await db.query(`
    INSERT INTO social_posts (
      tenant_id, content, media_urls, link_url, link_title, link_description,
      link_image_url, blog_post_id, scheduled_for, is_recurring, recurrence_rule,
      recurrence_end_date, status, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
  `, [
    tenantId, content, JSON.stringify(media_urls), link_url, link_title,
    link_description, link_image_url, blog_post_id || null, scheduled_for || null,
    is_recurring, recurrence_rule || null, recurrence_end_date || null,
    status, req.user.id
  ]);

  const post = postResult.rows[0];

  // Add platform connections
  for (const connectionId of connection_ids) {
    const override = platform_overrides[connectionId];
    await db.query(`
      INSERT INTO social_post_platforms (social_post_id, connection_id, content_override)
      VALUES ($1, $2, $3)
    `, [post.id, connectionId, override?.content_override || null]);
  }

  // If posting immediately, trigger publish (mock for MVP)
  if (status === 'publishing') {
    // In production, this would queue the post for the publishing worker
    // For MVP, we'll just mark it as published after a delay
    setTimeout(async () => {
      try {
        await db.query(`UPDATE social_posts SET status = 'published', posted_at = NOW() WHERE id = $1`, [post.id]);
        await db.query(`UPDATE social_post_platforms SET status = 'published', published_at = NOW() WHERE social_post_id = $1`, [post.id]);
        logger.info('Social post published (mock)', { postId: post.id });
      } catch (err) {
        logger.error('Failed to mock publish post', { postId: post.id, error: err.message });
      }
    }, 2000);
  }

  logger.info('Social post created', { postId: post.id, status, platforms: connection_ids.length });

  // Fetch the complete post with platforms
  const fullPost = await db.query(`
    SELECT 
      sp.*,
      (
        SELECT json_agg(json_build_object(
          'id', spp.id,
          'connection_id', spp.connection_id,
          'platform_name', plt.name,
          'platform_display_name', plt.display_name,
          'account_name', sc.account_name,
          'status', spp.status
        ))
        FROM social_post_platforms spp
        JOIN social_connections sc ON spp.connection_id = sc.id
        JOIN social_platforms plt ON sc.platform_id = plt.id
        WHERE spp.social_post_id = sp.id
      ) as platforms
    FROM social_posts sp
    WHERE sp.id = $1
  `, [post.id]);

  res.status(201).json({
    status: 'success',
    data: fullPost.rows[0]
  });
}));

/**
 * PUT /social/posts/:id
 * Update a social post (only if draft or scheduled)
 */
router.put('/posts/:id', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { id } = req.params;
  const {
    content,
    media_urls,
    link_url,
    link_title,
    link_description,
    link_image_url,
    scheduled_for,
    is_recurring,
    recurrence_rule,
    recurrence_end_date,
    connection_ids,
    platform_overrides
  } = req.body;

  // Check current status
  const current = await db.query(
    'SELECT * FROM social_posts WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );

  if (current.rows.length === 0) {
    throw new ApiError(404, 'Post not found');
  }

  if (!['draft', 'scheduled'].includes(current.rows[0].status)) {
    throw new ApiError(400, 'Can only edit draft or scheduled posts');
  }

  // Determine new status
  let status = current.rows[0].status;
  if (scheduled_for !== undefined) {
    if (scheduled_for) {
      const scheduleDate = new Date(scheduled_for);
      status = scheduleDate <= new Date() ? 'publishing' : 'scheduled';
    } else {
      status = 'draft';
    }
  }

  // Update post
  const result = await db.query(`
    UPDATE social_posts SET
      content = COALESCE($1, content),
      media_urls = COALESCE($2, media_urls),
      link_url = $3,
      link_title = $4,
      link_description = $5,
      link_image_url = $6,
      scheduled_for = $7,
      is_recurring = COALESCE($8, is_recurring),
      recurrence_rule = $9,
      recurrence_end_date = $10,
      status = $11,
      updated_at = NOW()
    WHERE id = $12 AND tenant_id = $13
    RETURNING *
  `, [
    content, media_urls ? JSON.stringify(media_urls) : null,
    link_url, link_title, link_description, link_image_url,
    scheduled_for || null, is_recurring, recurrence_rule || null,
    recurrence_end_date || null, status, id, tenantId
  ]);

  // Update platform connections if provided
  if (connection_ids) {
    // Remove old connections
    await db.query('DELETE FROM social_post_platforms WHERE social_post_id = $1', [id]);
    
    // Add new connections
    for (const connectionId of connection_ids) {
      const override = platform_overrides?.[connectionId];
      await db.query(`
        INSERT INTO social_post_platforms (social_post_id, connection_id, content_override)
        VALUES ($1, $2, $3)
      `, [id, connectionId, override?.content_override || null]);
    }
  }

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

/**
 * DELETE /social/posts/:id
 * Delete or cancel a social post
 */
router.delete('/posts/:id', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { id } = req.params;

  const current = await db.query(
    'SELECT status FROM social_posts WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );

  if (current.rows.length === 0) {
    throw new ApiError(404, 'Post not found');
  }

  const currentStatus = current.rows[0].status;

  if (['draft', 'failed'].includes(currentStatus)) {
    // Hard delete for drafts and failed posts
    await db.query('DELETE FROM social_posts WHERE id = $1', [id]);
    res.json({ status: 'success', message: 'Post deleted' });
  } else if (currentStatus === 'scheduled') {
    // Cancel scheduled posts
    await db.query(
      `UPDATE social_posts SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
      [id]
    );
    res.json({ status: 'success', message: 'Post cancelled' });
  } else {
    throw new ApiError(400, 'Cannot delete published posts');
  }
}));

/**
 * POST /social/posts/:id/publish
 * Publish a draft post immediately
 */
router.post('/posts/:id/publish', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { id } = req.params;

  const current = await db.query(
    'SELECT * FROM social_posts WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );

  if (current.rows.length === 0) {
    throw new ApiError(404, 'Post not found');
  }

  if (!['draft', 'scheduled'].includes(current.rows[0].status)) {
    throw new ApiError(400, 'Can only publish draft or scheduled posts');
  }

  // Update to publishing
  await db.query(
    `UPDATE social_posts SET status = 'publishing', updated_at = NOW() WHERE id = $1`,
    [id]
  );

  // Mock publish (in production, queue for worker)
  setTimeout(async () => {
    try {
      await db.query(`UPDATE social_posts SET status = 'published', posted_at = NOW() WHERE id = $1`, [id]);
      await db.query(`UPDATE social_post_platforms SET status = 'published', published_at = NOW() WHERE social_post_id = $1`, [id]);
      logger.info('Social post published (mock)', { postId: id });
    } catch (err) {
      logger.error('Failed to mock publish post', { postId: id, error: err.message });
    }
  }, 2000);

  res.json({
    status: 'success',
    message: 'Post is being published'
  });
}));

/**
 * GET /social/stats
 * Get social media statistics
 */
router.get('/stats', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';

  const stats = await db.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'draft') as drafts,
      COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
      COUNT(*) FILTER (WHERE status = 'published') as published,
      COUNT(*) FILTER (WHERE status = 'failed') as failed,
      (SELECT COUNT(*) FROM social_connections WHERE tenant_id = $1 AND status = 'connected') as connected_accounts
    FROM social_posts
    WHERE tenant_id = $1
  `, [tenantId]);

  // Get engagement totals
  const engagement = await db.query(`
    SELECT
      COALESCE(SUM(spp.likes_count), 0) as total_likes,
      COALESCE(SUM(spp.comments_count), 0) as total_comments,
      COALESCE(SUM(spp.shares_count), 0) as total_shares,
      COALESCE(SUM(spp.clicks_count), 0) as total_clicks,
      COALESCE(SUM(spp.impressions_count), 0) as total_impressions
    FROM social_post_platforms spp
    JOIN social_posts sp ON spp.social_post_id = sp.id
    WHERE sp.tenant_id = $1
  `, [tenantId]);

  res.json({
    status: 'success',
    data: {
      posts: stats.rows[0],
      engagement: engagement.rows[0]
    }
  });
}));

module.exports = router;
