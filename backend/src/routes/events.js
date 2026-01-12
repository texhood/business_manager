/**
 * Events Routes
 * CRUD operations for food trailer events
 */

const express = require('express');
const { body, validationResult } = require('express-validator');

const db = require('../../config/database');
const { authenticate, optionalAuth, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Valid statuses
const VALID_STATUSES = ['draft', 'scheduled', 'cancelled', 'completed'];

// Generate slug from title and date
const generateSlug = (title, date) => {
  const dateStr = date ? new Date(date).toISOString().split('T')[0] : '';
  return `${title}-${dateStr}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
};

// Validation
const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('event_date').isISO8601().withMessage('Valid date is required'),
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
 * GET /events
 * List events (public sees only scheduled, staff sees all)
 */
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { 
    status, 
    upcoming = 'true',
    past = 'false',
    limit = 20,
    page = 1 
  } = req.query;
  
  const isStaff = ['admin', 'staff'].includes(req.user?.role);

  let queryText = `
    SELECT 
      e.*,
      m.name as menu_name,
      m.slug as menu_slug
    FROM events e
    LEFT JOIN menus m ON e.menu_id = m.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  // Non-staff only see scheduled events
  if (!isStaff) {
    queryText += ` AND e.status = 'scheduled'`;
  } else if (status) {
    params.push(status);
    queryText += ` AND e.status = $${++paramCount}`;
  }

  // Filter by upcoming/past
  if (upcoming === 'true' && past !== 'true') {
    queryText += ` AND e.event_date >= CURRENT_DATE`;
  } else if (past === 'true' && upcoming !== 'true') {
    queryText += ` AND e.event_date < CURRENT_DATE`;
  }

  // Count total
  const countQuery = `SELECT COUNT(*) FROM (${queryText}) as filtered`;
  const countResult = await db.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count, 10);

  // Sort: upcoming events ascending, past events descending
  if (past === 'true' && upcoming !== 'true') {
    queryText += ` ORDER BY e.event_date DESC, e.start_time DESC`;
  } else {
    queryText += ` ORDER BY e.event_date ASC, e.start_time ASC`;
  }

  // Pagination
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
 * GET /events/upcoming
 * Get next N upcoming events
 */
router.get('/upcoming', asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  const result = await db.query(`
    SELECT 
      e.*,
      m.name as menu_name,
      m.slug as menu_slug
    FROM events e
    LEFT JOIN menus m ON e.menu_id = m.id
    WHERE e.status = 'scheduled' AND e.event_date >= CURRENT_DATE
    ORDER BY e.event_date ASC, e.start_time ASC
    LIMIT $1
  `, [parseInt(limit, 10)]);

  res.json({
    status: 'success',
    data: result.rows,
  });
}));

/**
 * GET /events/:idOrSlug
 * Get a single event
 */
router.get('/:idOrSlug', optionalAuth, asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isStaff = ['admin', 'staff'].includes(req.user?.role);

  const result = await db.query(`
    SELECT 
      e.*,
      m.name as menu_name,
      m.slug as menu_slug,
      a.name as created_by_name
    FROM events e
    LEFT JOIN menus m ON e.menu_id = m.id
    LEFT JOIN accounts a ON e.created_by = a.id
    WHERE e.id::text = $1 OR e.slug = $1
  `, [idOrSlug]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Event not found');
  }

  const event = result.rows[0];

  // Non-staff can only see scheduled events
  if (!isStaff && event.status !== 'scheduled') {
    throw new ApiError(404, 'Event not found');
  }

  res.json({
    status: 'success',
    data: event,
  });
}));

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * POST /events
 * Create a new event
 */
router.post('/', authenticate, requireStaff, eventValidation, validate, asyncHandler(async (req, res) => {
  const {
    title,
    slug: customSlug,
    description,
    event_date,
    start_time,
    end_time,
    timezone = 'America/Chicago',
    location_name,
    address,
    city,
    state,
    zip_code,
    map_url,
    latitude,
    longitude,
    menu_id,
    featured_image,
    is_featured = false,
    status = 'scheduled',
    ticket_url,
    facebook_event_url,
    series_id
  } = req.body;

  // Generate or use custom slug
  let slug = customSlug || generateSlug(title, event_date);
  
  // Ensure slug is unique
  const slugCheck = await db.query('SELECT id FROM events WHERE slug = $1', [slug]);
  if (slugCheck.rows.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }

  // Auto-generate map URL if address provided but no map URL
  let finalMapUrl = map_url;
  if (!finalMapUrl && address) {
    const fullAddress = [address, city, state, zip_code].filter(Boolean).join(', ');
    finalMapUrl = `https://maps.google.com?q=${encodeURIComponent(fullAddress)}`;
  }

  const result = await db.query(`
    INSERT INTO events (
      title, slug, description, event_date, start_time, end_time, timezone,
      location_name, address, city, state, zip_code, map_url, latitude, longitude,
      menu_id, featured_image, is_featured, status, ticket_url, facebook_event_url,
      series_id, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
    RETURNING *
  `, [
    title, slug, description, event_date, start_time, end_time, timezone,
    location_name, address, city, state, zip_code, finalMapUrl, latitude, longitude,
    menu_id, featured_image, is_featured, status, ticket_url, facebook_event_url,
    series_id, req.user.id
  ]);

  logger.info('Event created', { eventId: result.rows[0].id, slug, createdBy: req.user.id });

  res.status(201).json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * PUT /events/:id
 * Update an event
 */
router.put('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Check event exists
  const existing = await db.query('SELECT * FROM events WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Event not found');
  }

  // Check slug uniqueness if changing
  if (updates.slug && updates.slug !== existing.rows[0].slug) {
    const slugCheck = await db.query('SELECT id FROM events WHERE slug = $1 AND id != $2', [updates.slug, id]);
    if (slugCheck.rows.length > 0) {
      throw new ApiError(400, 'Slug already in use');
    }
  }

  const result = await db.query(`
    UPDATE events SET
      title = COALESCE($1, title),
      slug = COALESCE($2, slug),
      description = $3,
      event_date = COALESCE($4, event_date),
      start_time = $5,
      end_time = $6,
      timezone = COALESCE($7, timezone),
      location_name = $8,
      address = $9,
      city = $10,
      state = $11,
      zip_code = $12,
      map_url = $13,
      latitude = $14,
      longitude = $15,
      menu_id = $16,
      featured_image = $17,
      is_featured = COALESCE($18, is_featured),
      status = COALESCE($19, status),
      ticket_url = $20,
      facebook_event_url = $21,
      series_id = $22,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $23
    RETURNING *
  `, [
    updates.title,
    updates.slug,
    updates.description !== undefined ? updates.description : existing.rows[0].description,
    updates.event_date,
    updates.start_time !== undefined ? updates.start_time : existing.rows[0].start_time,
    updates.end_time !== undefined ? updates.end_time : existing.rows[0].end_time,
    updates.timezone,
    updates.location_name !== undefined ? updates.location_name : existing.rows[0].location_name,
    updates.address !== undefined ? updates.address : existing.rows[0].address,
    updates.city !== undefined ? updates.city : existing.rows[0].city,
    updates.state !== undefined ? updates.state : existing.rows[0].state,
    updates.zip_code !== undefined ? updates.zip_code : existing.rows[0].zip_code,
    updates.map_url !== undefined ? updates.map_url : existing.rows[0].map_url,
    updates.latitude !== undefined ? updates.latitude : existing.rows[0].latitude,
    updates.longitude !== undefined ? updates.longitude : existing.rows[0].longitude,
    updates.menu_id !== undefined ? updates.menu_id : existing.rows[0].menu_id,
    updates.featured_image !== undefined ? updates.featured_image : existing.rows[0].featured_image,
    updates.is_featured,
    updates.status,
    updates.ticket_url !== undefined ? updates.ticket_url : existing.rows[0].ticket_url,
    updates.facebook_event_url !== undefined ? updates.facebook_event_url : existing.rows[0].facebook_event_url,
    updates.series_id !== undefined ? updates.series_id : existing.rows[0].series_id,
    id
  ]);

  logger.info('Event updated', { eventId: id, updatedBy: req.user.id });

  res.json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * DELETE /events/:id
 * Delete or cancel an event
 */
router.delete('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { hard = false } = req.query;

  if (hard === 'true') {
    const result = await db.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Event not found');
    }
    logger.info('Event deleted', { eventId: id, deletedBy: req.user.id });
    
    res.json({ status: 'success', message: 'Event deleted permanently' });
  } else {
    const result = await db.query(
      `UPDATE events SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Event not found');
    }
    logger.info('Event cancelled', { eventId: id, cancelledBy: req.user.id });
    
    res.json({ status: 'success', message: 'Event cancelled' });
  }
}));

/**
 * POST /events/:id/duplicate
 * Duplicate an event (useful for recurring events)
 */
router.post('/:id/duplicate', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { event_date, title } = req.body;

  // Get original event
  const original = await db.query('SELECT * FROM events WHERE id = $1', [id]);
  if (original.rows.length === 0) {
    throw new ApiError(404, 'Event not found');
  }

  const event = original.rows[0];
  const newDate = event_date || event.event_date;
  const newTitle = title || event.title;
  const newSlug = generateSlug(newTitle, newDate);

  const result = await db.query(`
    INSERT INTO events (
      title, slug, description, event_date, start_time, end_time, timezone,
      location_name, address, city, state, zip_code, map_url, latitude, longitude,
      menu_id, featured_image, status, series_id, created_by
    ) 
    SELECT 
      $1, $2, description, $3, start_time, end_time, timezone,
      location_name, address, city, state, zip_code, map_url, latitude, longitude,
      menu_id, featured_image, 'scheduled', series_id, $4
    FROM events WHERE id = $5
    RETURNING *
  `, [newTitle, newSlug, newDate, req.user.id, id]);

  logger.info('Event duplicated', { originalId: id, newId: result.rows[0].id, createdBy: req.user.id });

  res.status(201).json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * POST /events/:id/complete
 * Mark an event as completed
 */
router.post('/:id/complete', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `UPDATE events SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Event not found');
  }

  logger.info('Event completed', { eventId: id, completedBy: req.user.id });

  res.json({
    status: 'success',
    data: result.rows[0],
  });
}));

module.exports = router;
