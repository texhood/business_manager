/**
 * Site Designer Routes
 * Manage themes, pages, and page sections
 */

const express = require('express');
const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication and staff role
router.use(authenticate, requireStaff);

// ============================================================================
// THEMES
// ============================================================================

/**
 * GET /site-designer/themes
 * Get all available themes
 */
router.get('/themes', asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT * FROM site_themes
    WHERE is_active = true
    ORDER BY name
  `);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

/**
 * GET /site-designer/themes/:id
 * Get a single theme with its section definitions
 */
router.get('/themes/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const themeResult = await db.query(
    'SELECT * FROM site_themes WHERE id = $1',
    [id]
  );

  if (themeResult.rows.length === 0) {
    throw new ApiError(404, 'Theme not found');
  }

  // Get sections grouped by page type
  const sectionsResult = await db.query(`
    SELECT * FROM theme_sections
    WHERE theme_id = $1
    ORDER BY page_type, default_sort_order
  `, [id]);

  // Group sections by page type
  const sectionsByPageType = {};
  sectionsResult.rows.forEach(section => {
    if (!sectionsByPageType[section.page_type]) {
      sectionsByPageType[section.page_type] = [];
    }
    sectionsByPageType[section.page_type].push(section);
  });

  res.json({
    status: 'success',
    data: {
      ...themeResult.rows[0],
      sections: sectionsByPageType
    }
  });
}));

/**
 * GET /site-designer/themes/:id/sections/:pageType
 * Get section definitions for a specific page type
 */
router.get('/themes/:id/sections/:pageType', asyncHandler(async (req, res) => {
  const { id, pageType } = req.params;

  const result = await db.query(`
    SELECT * FROM theme_sections
    WHERE theme_id = $1 AND page_type = $2
    ORDER BY default_sort_order
  `, [id, pageType]);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

// ============================================================================
// TENANT SITE SETTINGS
// ============================================================================

/**
 * GET /site-designer/settings
 * Get tenant's site settings
 */
router.get('/settings', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';

  let result = await db.query(`
    SELECT 
      s.*,
      t.name as theme_name,
      t.slug as theme_slug,
      t.default_colors as theme_default_colors,
      t.default_fonts as theme_default_fonts
    FROM tenant_site_settings s
    LEFT JOIN site_themes t ON s.theme_id = t.id
    WHERE s.tenant_id = $1
  `, [tenantId]);

  // Create default settings if none exist
  if (result.rows.length === 0) {
    const defaultTheme = await db.query(
      "SELECT id FROM site_themes WHERE slug = 'farm-fresh' LIMIT 1"
    );
    
    const insertResult = await db.query(`
      INSERT INTO tenant_site_settings (tenant_id, theme_id, site_name)
      VALUES ($1, $2, 'My Site')
      RETURNING *
    `, [tenantId, defaultTheme.rows[0]?.id]);

    result = await db.query(`
      SELECT 
        s.*,
        t.name as theme_name,
        t.slug as theme_slug,
        t.default_colors as theme_default_colors,
        t.default_fonts as theme_default_fonts
      FROM tenant_site_settings s
      LEFT JOIN site_themes t ON s.theme_id = t.id
      WHERE s.tenant_id = $1
    `, [tenantId]);
  }

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

/**
 * PUT /site-designer/settings
 * Update tenant's site settings
 */
router.put('/settings', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const {
    theme_id,
    site_name,
    tagline,
    logo_url,
    favicon_url,
    color_overrides,
    font_overrides,
    contact_info,
    social_links,
    business_hours,
    default_seo_title,
    default_seo_description
  } = req.body;

  const result = await db.query(`
    UPDATE tenant_site_settings SET
      theme_id = COALESCE($2, theme_id),
      site_name = COALESCE($3, site_name),
      tagline = COALESCE($4, tagline),
      logo_url = $5,
      favicon_url = $6,
      color_overrides = COALESCE($7, color_overrides),
      font_overrides = COALESCE($8, font_overrides),
      contact_info = COALESCE($9, contact_info),
      social_links = COALESCE($10, social_links),
      business_hours = COALESCE($11, business_hours),
      default_seo_title = $12,
      default_seo_description = $13,
      updated_at = NOW()
    WHERE tenant_id = $1
    RETURNING *
  `, [
    tenantId, theme_id, site_name, tagline, logo_url, favicon_url,
    color_overrides ? JSON.stringify(color_overrides) : null,
    font_overrides ? JSON.stringify(font_overrides) : null,
    contact_info ? JSON.stringify(contact_info) : null,
    social_links ? JSON.stringify(social_links) : null,
    business_hours ? JSON.stringify(business_hours) : null,
    default_seo_title, default_seo_description
  ]);

  logger.info('Site settings updated', { tenantId });

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

// ============================================================================
// PAGES
// ============================================================================

/**
 * GET /site-designer/pages
 * Get all pages for tenant
 */
router.get('/pages', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';

  const result = await db.query(`
    SELECT 
      p.*,
      (SELECT COUNT(*) FROM page_sections ps WHERE ps.page_id = p.id AND ps.is_enabled = true) as enabled_sections
    FROM site_pages p
    WHERE p.tenant_id = $1
    ORDER BY 
      CASE p.page_type 
        WHEN 'home' THEN 1 
        WHEN 'about' THEN 2 
        WHEN 'contact' THEN 3 
        WHEN 'faq' THEN 4 
        ELSE 5 
      END,
      p.title
  `, [tenantId]);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

/**
 * GET /site-designer/pages/:id
 * Get a single page with its sections
 */
router.get('/pages/:id', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { id } = req.params;

  const pageResult = await db.query(`
    SELECT * FROM site_pages
    WHERE id = $1 AND tenant_id = $2
  `, [id, tenantId]);

  if (pageResult.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  const page = pageResult.rows[0];

  // Get sections
  const sectionsResult = await db.query(`
    SELECT * FROM page_sections
    WHERE page_id = $1
    ORDER BY sort_order
  `, [id]);

  res.json({
    status: 'success',
    data: {
      ...page,
      sections: sectionsResult.rows
    }
  });
}));

/**
 * POST /site-designer/pages
 * Create a new page
 */
router.post('/pages', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { page_type, title, slug, seo_title, seo_description } = req.body;

  if (!page_type || !title || !slug) {
    throw new ApiError(400, 'page_type, title, and slug are required');
  }

  // Check for duplicate slug
  const existing = await db.query(
    'SELECT id FROM site_pages WHERE tenant_id = $1 AND slug = $2',
    [tenantId, slug]
  );

  if (existing.rows.length > 0) {
    throw new ApiError(400, 'A page with this slug already exists');
  }

  // Create page
  const pageResult = await db.query(`
    INSERT INTO site_pages (tenant_id, page_type, title, slug, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [tenantId, page_type, title, slug, seo_title, seo_description]);

  const page = pageResult.rows[0];

  // Get tenant's theme
  const settingsResult = await db.query(
    'SELECT theme_id FROM tenant_site_settings WHERE tenant_id = $1',
    [tenantId]
  );

  if (settingsResult.rows[0]?.theme_id) {
    // Get theme sections for this page type and create default sections
    const themeSections = await db.query(`
      SELECT * FROM theme_sections
      WHERE theme_id = $1 AND page_type = $2
      ORDER BY default_sort_order
    `, [settingsResult.rows[0].theme_id, page_type]);

    for (const section of themeSections.rows) {
      await db.query(`
        INSERT INTO page_sections (page_id, section_type, sort_order, is_enabled, settings)
        VALUES ($1, $2, $3, $4, $5)
      `, [page.id, section.section_type, section.default_sort_order, section.default_enabled, section.default_settings]);
    }
  }

  logger.info('Page created', { pageId: page.id, pageType: page_type, slug });

  // Fetch complete page with sections
  const completeResult = await db.query(`
    SELECT * FROM page_sections WHERE page_id = $1 ORDER BY sort_order
  `, [page.id]);

  res.status(201).json({
    status: 'success',
    data: {
      ...page,
      sections: completeResult.rows
    }
  });
}));

/**
 * PUT /site-designer/pages/:id
 * Update a page
 */
router.put('/pages/:id', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { id } = req.params;
  const { title, slug, is_published, seo_title, seo_description, seo_image } = req.body;

  // Check if page exists
  const existing = await db.query(
    'SELECT * FROM site_pages WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  // Check for duplicate slug if changing
  if (slug && slug !== existing.rows[0].slug) {
    const duplicate = await db.query(
      'SELECT id FROM site_pages WHERE tenant_id = $1 AND slug = $2 AND id != $3',
      [tenantId, slug, id]
    );
    if (duplicate.rows.length > 0) {
      throw new ApiError(400, 'A page with this slug already exists');
    }
  }

  const result = await db.query(`
    UPDATE site_pages SET
      title = COALESCE($3, title),
      slug = COALESCE($4, slug),
      is_published = COALESCE($5, is_published),
      published_at = CASE WHEN $5 = true AND published_at IS NULL THEN NOW() ELSE published_at END,
      seo_title = $6,
      seo_description = $7,
      seo_image = $8,
      updated_at = NOW()
    WHERE id = $1 AND tenant_id = $2
    RETURNING *
  `, [id, tenantId, title, slug, is_published, seo_title, seo_description, seo_image]);

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

/**
 * DELETE /site-designer/pages/:id
 * Delete a page (system pages cannot be deleted)
 */
router.delete('/pages/:id', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { id } = req.params;

  const existing = await db.query(
    'SELECT * FROM site_pages WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  if (existing.rows[0].is_system_page) {
    throw new ApiError(400, 'System pages cannot be deleted');
  }

  await db.query('DELETE FROM site_pages WHERE id = $1', [id]);

  logger.info('Page deleted', { pageId: id });

  res.json({
    status: 'success',
    message: 'Page deleted'
  });
}));

/**
 * POST /site-designer/pages/initialize
 * Initialize default pages for tenant (called once during setup)
 */
router.post('/pages/initialize', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';

  // Check if pages already exist
  const existing = await db.query(
    'SELECT COUNT(*) FROM site_pages WHERE tenant_id = $1',
    [tenantId]
  );

  if (parseInt(existing.rows[0].count, 10) > 0) {
    throw new ApiError(400, 'Pages already initialized');
  }

  // Get tenant's theme
  const settingsResult = await db.query(
    'SELECT theme_id FROM tenant_site_settings WHERE tenant_id = $1',
    [tenantId]
  );

  const themeId = settingsResult.rows[0]?.theme_id;

  // Default pages to create
  const defaultPages = [
    { page_type: 'home', title: 'Home', slug: '', is_system_page: true },
    { page_type: 'about', title: 'About Us', slug: 'about', is_system_page: false },
    { page_type: 'contact', title: 'Contact Us', slug: 'contact', is_system_page: false },
    { page_type: 'faq', title: 'FAQ', slug: 'faq', is_system_page: false }
  ];

  const createdPages = [];

  for (const pageData of defaultPages) {
    // Create page
    const pageResult = await db.query(`
      INSERT INTO site_pages (tenant_id, page_type, title, slug, is_system_page)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [tenantId, pageData.page_type, pageData.title, pageData.slug, pageData.is_system_page]);

    const page = pageResult.rows[0];

    // Create default sections if theme exists
    if (themeId) {
      const themeSections = await db.query(`
        SELECT * FROM theme_sections
        WHERE theme_id = $1 AND page_type = $2
        ORDER BY default_sort_order
      `, [themeId, pageData.page_type]);

      for (const section of themeSections.rows) {
        await db.query(`
          INSERT INTO page_sections (page_id, section_type, sort_order, is_enabled, settings)
          VALUES ($1, $2, $3, $4, $5)
        `, [page.id, section.section_type, section.default_sort_order, section.default_enabled, section.default_settings]);
      }
    }

    createdPages.push(page);
  }

  logger.info('Default pages initialized', { tenantId, count: createdPages.length });

  res.status(201).json({
    status: 'success',
    data: createdPages
  });
}));

// ============================================================================
// PAGE SECTIONS
// ============================================================================

/**
 * PUT /site-designer/pages/:pageId/sections/:sectionId
 * Update a section's settings
 */
router.put('/pages/:pageId/sections/:sectionId', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { pageId, sectionId } = req.params;
  const { is_enabled, sort_order, settings } = req.body;

  // Verify page belongs to tenant
  const pageCheck = await db.query(
    'SELECT id FROM site_pages WHERE id = $1 AND tenant_id = $2',
    [pageId, tenantId]
  );

  if (pageCheck.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  const result = await db.query(`
    UPDATE page_sections SET
      is_enabled = COALESCE($2, is_enabled),
      sort_order = COALESCE($3, sort_order),
      settings = COALESCE($4, settings),
      updated_at = NOW()
    WHERE id = $1 AND page_id = $5
    RETURNING *
  `, [sectionId, is_enabled, sort_order, settings ? JSON.stringify(settings) : null, pageId]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Section not found');
  }

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

/**
 * PUT /site-designer/pages/:pageId/sections
 * Bulk update sections (for reordering)
 */
router.put('/pages/:pageId/sections', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { pageId } = req.params;
  const { sections } = req.body; // Array of { id, sort_order, is_enabled }

  // Verify page belongs to tenant
  const pageCheck = await db.query(
    'SELECT id FROM site_pages WHERE id = $1 AND tenant_id = $2',
    [pageId, tenantId]
  );

  if (pageCheck.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  // Update each section
  for (const section of sections) {
    await db.query(`
      UPDATE page_sections SET
        sort_order = $2,
        is_enabled = COALESCE($3, is_enabled),
        updated_at = NOW()
      WHERE id = $1 AND page_id = $4
    `, [section.id, section.sort_order, section.is_enabled, pageId]);
  }

  // Fetch updated sections
  const result = await db.query(`
    SELECT * FROM page_sections WHERE page_id = $1 ORDER BY sort_order
  `, [pageId]);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

// ============================================================================
// PUBLIC API (for rendering site)
// ============================================================================

/**
 * GET /site-designer/public/settings
 * Get public site settings (no auth required for site rendering)
 */
router.get('/public/settings', asyncHandler(async (req, res) => {
  const tenantId = req.query.tenant_id || '00000000-0000-0000-0000-000000000001';

  const result = await db.query(`
    SELECT 
      s.site_name,
      s.tagline,
      s.logo_url,
      s.favicon_url,
      s.color_overrides,
      s.font_overrides,
      s.contact_info,
      s.social_links,
      s.business_hours,
      s.default_seo_title,
      s.default_seo_description,
      t.name as theme_name,
      t.slug as theme_slug,
      t.default_colors,
      t.default_fonts
    FROM tenant_site_settings s
    LEFT JOIN site_themes t ON s.theme_id = t.id
    WHERE s.tenant_id = $1
  `, [tenantId]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Site settings not found');
  }

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

/**
 * GET /site-designer/public/pages/:slug
 * Get a published page by slug (no auth required for site rendering)
 */
router.get('/public/pages/:slug', asyncHandler(async (req, res) => {
  const tenantId = req.query.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { slug } = req.params;

  const pageResult = await db.query(`
    SELECT * FROM site_pages
    WHERE tenant_id = $1 AND slug = $2 AND is_published = true
  `, [tenantId, slug === 'home' ? '' : slug]);

  if (pageResult.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  const page = pageResult.rows[0];

  // Get enabled sections
  const sectionsResult = await db.query(`
    SELECT * FROM page_sections
    WHERE page_id = $1 AND is_enabled = true
    ORDER BY sort_order
  `, [page.id]);

  res.json({
    status: 'success',
    data: {
      ...page,
      sections: sectionsResult.rows
    }
  });
}));

module.exports = router;
