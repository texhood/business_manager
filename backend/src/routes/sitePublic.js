/**
 * Site Public Routes
 * Public endpoints for rendering website content (no authentication required)
 */

const express = require('express');
const db = require('../../config/database');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a string is a valid UUID format
 */
const isUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Resolve tenant ID from slug or UUID
 * Returns the UUID tenant_id
 */
const resolveTenantId = async (tenantIdOrSlug) => {
  if (!tenantIdOrSlug) return null;
  
  // If it's already a UUID, return it
  if (isUUID(tenantIdOrSlug)) {
    return tenantIdOrSlug;
  }
  
  // Otherwise, look up by slug
  const result = await db.query(
    'SELECT id FROM tenants WHERE slug = $1 AND is_active = true',
    [tenantIdOrSlug]
  );
  
  if (result.rows.length > 0) {
    return result.rows[0].id;
  }
  
  return null;
};

// ============================================================================
// TENANT LOOKUP
// ============================================================================

/**
 * GET /site-public/tenant/:slug
 * Get tenant info by slug (for tenant detection)
 */
router.get('/tenant/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const result = await db.query(`
    SELECT id, name, slug, logo_url
    FROM tenants
    WHERE slug = $1 AND is_active = true
  `, [slug]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Tenant not found');
  }

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

// ============================================================================
// SITE SETTINGS
// ============================================================================

/**
 * GET /site-public/settings/:tenantId
 * Get public site settings for a tenant (accepts UUID or slug)
 */
router.get('/settings/:tenantId', asyncHandler(async (req, res) => {
  const { tenantId } = req.params;
  
  // Resolve to UUID if slug was passed
  const resolvedTenantId = await resolveTenantId(tenantId);
  
  if (!resolvedTenantId) {
    // Return defaults if tenant not found
    res.json({
      status: 'success',
      data: {
        tenant_id: null,
        site_name: '',
        tagline: '',
        logo_url: null,
        favicon_url: null,
        color_overrides: {},
        font_overrides: {},
        contact_info: { phone: '', email: '', address: '' },
        social_links: { facebook: '', instagram: '', twitter: '', linkedin: '' },
        business_hours: [],
        default_seo_title: '',
        default_seo_description: ''
      }
    });
    return;
  }

  const result = await db.query(`
    SELECT 
      s.tenant_id,
      s.theme_id,
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
  `, [resolvedTenantId]);

  if (result.rows.length === 0) {
    // Return defaults if no settings exist
    res.json({
      status: 'success',
      data: {
        tenant_id: resolvedTenantId,
        site_name: '',
        tagline: '',
        logo_url: null,
        favicon_url: null,
        color_overrides: {},
        font_overrides: {},
        contact_info: { phone: '', email: '', address: '' },
        social_links: { facebook: '', instagram: '', twitter: '', linkedin: '' },
        business_hours: [],
        default_seo_title: '',
        default_seo_description: ''
      }
    });
    return;
  }

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

// ============================================================================
// THEMES
// ============================================================================

/**
 * GET /site-public/themes/:themeId
 * Get theme details (colors, fonts)
 */
router.get('/themes/:themeId', asyncHandler(async (req, res) => {
  const { themeId } = req.params;

  const result = await db.query(`
    SELECT 
      id, name, slug, description,
      default_colors, default_fonts
    FROM site_themes
    WHERE id = $1 AND is_active = true
  `, [themeId]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Theme not found');
  }

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

// ============================================================================
// PAGES (Site Designer system)
// ============================================================================

/**
 * GET /site-public/pages
 * Get all published pages for a tenant (using X-Tenant-ID header)
 */
router.get('/pages', asyncHandler(async (req, res) => {
  const tenantIdOrSlug = req.headers['x-tenant-id'] || req.query.tenant_id;

  if (!tenantIdOrSlug) {
    throw new ApiError(400, 'Tenant ID required');
  }

  const resolvedTenantId = await resolveTenantId(tenantIdOrSlug);
  
  if (!resolvedTenantId) {
    // Return empty array if tenant not found
    res.json({
      status: 'success',
      data: []
    });
    return;
  }

  const result = await db.query(`
    SELECT 
      id, page_type, title, slug, 
      seo_title, seo_description, seo_image,
      is_system_page
    FROM site_pages
    WHERE tenant_id = $1 AND is_published = true
    ORDER BY 
      CASE page_type 
        WHEN 'home' THEN 1 
        WHEN 'about' THEN 2 
        WHEN 'contact' THEN 3 
        WHEN 'faq' THEN 4 
        ELSE 5 
      END,
      title
  `, [resolvedTenantId]);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

/**
 * GET /site-public/pages/by-slug/:slug
 * Get a published page by slug with its sections
 */
router.get('/pages/by-slug/:slug', asyncHandler(async (req, res) => {
  const tenantIdOrSlug = req.headers['x-tenant-id'] || req.query.tenant_id;
  let { slug } = req.params;

  if (!tenantIdOrSlug) {
    throw new ApiError(400, 'Tenant ID required');
  }

  // Handle home page special case
  if (slug === '__home__' || slug === 'home') {
    slug = '';
  }

  const resolvedTenantId = await resolveTenantId(tenantIdOrSlug);
  
  if (!resolvedTenantId) {
    throw new ApiError(404, 'Tenant not found');
  }

  const pageResult = await db.query(`
    SELECT * FROM site_pages
    WHERE tenant_id = $1 AND slug = $2 AND is_published = true
  `, [resolvedTenantId, slug]);

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

// ============================================================================
// PAGE BLOCKS (Site Builder system)
// ============================================================================

/**
 * GET /site-public/builder/pages
 * Get all published pages for a tenant (Site Builder system)
 */
router.get('/builder/pages', asyncHandler(async (req, res) => {
  const tenantIdOrSlug = req.headers['x-tenant-id'] || req.query.tenant_id;

  if (!tenantIdOrSlug) {
    throw new ApiError(400, 'Tenant ID required');
  }

  const resolvedTenantId = await resolveTenantId(tenantIdOrSlug);
  
  if (!resolvedTenantId) {
    res.json({
      status: 'success',
      data: []
    });
    return;
  }

  const result = await db.query(`
    SELECT 
      id, title, slug, template_id,
      seo_title, seo_description, seo_image
    FROM site_pages
    WHERE tenant_id = $1 AND is_published = true
    ORDER BY title
  `, [resolvedTenantId]);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

/**
 * GET /site-public/builder/pages/by-slug/:slug
 * Get a published page by slug with its blocks (Site Builder system)
 */
router.get('/builder/pages/by-slug/:slug', asyncHandler(async (req, res) => {
  const tenantIdOrSlug = req.headers['x-tenant-id'] || req.query.tenant_id;
  let { slug } = req.params;

  if (!tenantIdOrSlug) {
    throw new ApiError(400, 'Tenant ID required');
  }

  // Handle home page special case
  if (slug === '__home__' || slug === 'home') {
    slug = '';
  }

  const resolvedTenantId = await resolveTenantId(tenantIdOrSlug);
  
  if (!resolvedTenantId) {
    throw new ApiError(404, 'Tenant not found');
  }

  const pageResult = await db.query(`
    SELECT * FROM site_pages
    WHERE tenant_id = $1 AND slug = $2 AND is_published = true
  `, [resolvedTenantId, slug]);

  if (pageResult.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  const page = pageResult.rows[0];

  // Get blocks for this page
  const blocksResult = await db.query(`
    SELECT 
      id, zone_key, block_type, display_order,
      content, settings, is_visible
    FROM page_blocks
    WHERE page_id = $1 AND is_visible = true
    ORDER BY zone_key, display_order
  `, [page.id]);

  res.json({
    status: 'success',
    data: {
      ...page,
      blocks: blocksResult.rows
    }
  });
}));

/**
 * GET /site-public/builder/pages/:pageId/blocks
 * Get all blocks for a page
 */
router.get('/builder/pages/:pageId/blocks', asyncHandler(async (req, res) => {
  const tenantIdOrSlug = req.headers['x-tenant-id'] || req.query.tenant_id;
  const { pageId } = req.params;

  if (!tenantIdOrSlug) {
    throw new ApiError(400, 'Tenant ID required');
  }

  const resolvedTenantId = await resolveTenantId(tenantIdOrSlug);
  
  if (!resolvedTenantId) {
    throw new ApiError(404, 'Tenant not found');
  }

  // Verify page belongs to tenant and is published
  const pageCheck = await db.query(`
    SELECT id FROM site_pages
    WHERE id = $1 AND tenant_id = $2 AND is_published = true
  `, [pageId, resolvedTenantId]);

  if (pageCheck.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  const blocksResult = await db.query(`
    SELECT 
      id, zone_key, block_type, display_order,
      content, settings, is_visible
    FROM page_blocks
    WHERE page_id = $1 AND is_visible = true
    ORDER BY zone_key, display_order
  `, [pageId]);

  res.json({
    status: 'success',
    data: blocksResult.rows
  });
}));

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * GET /site-public/navigation
 * Get navigation menu items for a tenant
 */
router.get('/navigation', asyncHandler(async (req, res) => {
  const tenantIdOrSlug = req.headers['x-tenant-id'] || req.query.tenant_id;

  if (!tenantIdOrSlug) {
    throw new ApiError(400, 'Tenant ID required');
  }

  const resolvedTenantId = await resolveTenantId(tenantIdOrSlug);
  
  if (!resolvedTenantId) {
    res.json({
      status: 'success',
      data: []
    });
    return;
  }

  // Get published pages for navigation
  const result = await db.query(`
    SELECT 
      id, title, slug, page_type
    FROM site_pages
    WHERE tenant_id = $1 AND is_published = true
    ORDER BY 
      CASE page_type 
        WHEN 'home' THEN 1 
        WHEN 'about' THEN 2 
        WHEN 'contact' THEN 3 
        WHEN 'faq' THEN 4 
        ELSE 5 
      END,
      title
  `, [resolvedTenantId]);

  // Build navigation items
  const navItems = result.rows.map(page => ({
    id: page.id,
    label: page.title,
    path: page.slug === '' ? '/' : `/${page.slug}`,
    type: page.page_type
  }));

  res.json({
    status: 'success',
    data: navItems
  });
}));

module.exports = router;
