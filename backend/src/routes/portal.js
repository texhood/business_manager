/**
 * Portal Routes
 * Tenant Portal / App Launcher — SSO hub and app access gating
 */

const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticate, generateToken, generateRefreshToken } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const pool = db.pool || db;

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * GET /portal/apps
 * List all registered apps (public — for marketing/pricing pages)
 */
router.get('/apps', asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT slug, name, description, icon, category, min_plan_tier, sort_order
    FROM app_registry
    WHERE is_active = true
    ORDER BY sort_order ASC
  `);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

// ============================================================================
// AUTHENTICATED ROUTES
// ============================================================================

/**
 * GET /portal/launcher
 * Get the app launcher data for the current user
 * Returns all apps with access status based on tenant tier + user role
 */
router.get('/launcher', authenticate, asyncHandler(async (req, res) => {
  const { tenant_id, role } = req.user;

  if (!tenant_id) {
    throw new ApiError(400, 'No tenant associated with this account');
  }

  // Get tenant with subscription plan info
  const tenantResult = await pool.query(`
    SELECT 
      t.id, t.slug, t.name, t.logo_url, t.primary_color,
      t.subscription_status, t.subscription_plan_id,
      sp.slug as plan_slug,
      sp.name as plan_name,
      sp.tier_level,
      sp.limits as plan_limits,
      sp.features as plan_features
    FROM tenants t
    LEFT JOIN subscription_plans sp ON t.subscription_plan_id = sp.id
    WHERE t.id = $1 AND t.is_active = true
  `, [tenant_id]);

  if (tenantResult.rows.length === 0) {
    throw new ApiError(404, 'Tenant not found or inactive');
  }

  const tenant = tenantResult.rows[0];
  const tierLevel = tenant.tier_level || 1; // Default to starter if no plan

  // Get all active apps
  const appsResult = await pool.query(`
    SELECT 
      ar.id, ar.slug, ar.name, ar.description, ar.icon,
      ar.subdomain, ar.url_pattern, ar.min_plan_tier,
      ar.category, ar.sort_order, ar.requires_roles,
      taa.is_enabled as override_enabled,
      taa.granted_override,
      taa.last_accessed_at,
      taa.access_count
    FROM app_registry ar
    LEFT JOIN tenant_app_access taa 
      ON taa.app_id = ar.id AND taa.tenant_id = $1
    WHERE ar.is_active = true
    ORDER BY ar.sort_order ASC
  `, [tenant_id]);

  // Build access map for each app
  const apps = appsResult.rows.map(app => {
    // Check tier access
    const tierGranted = tierLevel >= app.min_plan_tier;

    // Check role access (empty requires_roles = all roles)
    const rolesArray = app.requires_roles || [];
    const roleGranted = rolesArray.length === 0 || rolesArray.includes(role) || role === 'super_admin';

    // Check overrides
    const hasOverrideGrant = app.granted_override === true;
    const isDisabledOverride = app.override_enabled === false;

    // Final access: (tier OR override) AND role AND not disabled
    const hasAccess = (tierGranted || hasOverrideGrant) && roleGranted && !isDisabledOverride;

    // Check subscription is in good standing
    const subscriptionActive = ['active', 'trialing'].includes(tenant.subscription_status) || !tenant.subscription_status;

    // Build the URL for this tenant
    const url = app.url_pattern.replace('{tenant}', tenant.slug);

    return {
      slug: app.slug,
      name: app.name,
      description: app.description,
      icon: app.icon,
      category: app.category,
      url,
      hasAccess: hasAccess && subscriptionActive,
      accessReason: !subscriptionActive
        ? 'subscription_inactive'
        : !tierGranted && !hasOverrideGrant
          ? 'tier_required'
          : !roleGranted
            ? 'role_required'
            : isDisabledOverride
              ? 'admin_disabled'
              : 'granted',
      minPlanTier: app.min_plan_tier,
      lastAccessedAt: app.last_accessed_at,
      accessCount: app.access_count || 0,
    };
  });

  // Group by category
  const categories = {};
  apps.forEach(app => {
    if (!categories[app.category]) {
      categories[app.category] = [];
    }
    categories[app.category].push(app);
  });

  res.json({
    status: 'success',
    data: {
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        logoUrl: tenant.logo_url,
        primaryColor: tenant.primary_color,
        planSlug: tenant.plan_slug,
        planName: tenant.plan_name,
        tierLevel,
        subscriptionStatus: tenant.subscription_status,
      },
      apps,
      categories,
      user: {
        id: req.user.id,
        name: req.user.name || req.user.email,
        email: req.user.email,
        role: req.user.role,
      }
    }
  });
}));

/**
 * POST /portal/apps/:appSlug/access
 * Record app access (called when user launches an app)
 */
router.post('/apps/:appSlug/access', authenticate, asyncHandler(async (req, res) => {
  const { appSlug } = req.params;
  const { tenant_id } = req.user;

  if (!tenant_id) {
    throw new ApiError(400, 'No tenant associated with this account');
  }

  // Get app
  const appResult = await pool.query(
    'SELECT id FROM app_registry WHERE slug = $1 AND is_active = true',
    [appSlug]
  );

  if (appResult.rows.length === 0) {
    throw new ApiError(404, 'App not found');
  }

  const appId = appResult.rows[0].id;

  // Upsert access record
  await pool.query(`
    INSERT INTO tenant_app_access (tenant_id, app_id, last_accessed_at, access_count)
    VALUES ($1, $2, CURRENT_TIMESTAMP, 1)
    ON CONFLICT (tenant_id, app_id) DO UPDATE SET
      last_accessed_at = CURRENT_TIMESTAMP,
      access_count = tenant_app_access.access_count + 1,
      updated_at = CURRENT_TIMESTAMP
  `, [tenant_id, appId]);

  logger.info('App accessed', { 
    tenantId: tenant_id, 
    appSlug, 
    userId: req.user.id 
  });

  res.json({ status: 'success' });
}));

/**
 * GET /portal/check-access/:appSlug
 * Check if current user has access to a specific app
 * Used by individual apps as a gate check
 */
router.get('/check-access/:appSlug', authenticate, asyncHandler(async (req, res) => {
  const { appSlug } = req.params;
  const { tenant_id, role } = req.user;

  if (!tenant_id) {
    return res.json({
      status: 'success',
      data: { hasAccess: false, reason: 'no_tenant' }
    });
  }

  // Get tenant tier
  const tenantResult = await pool.query(`
    SELECT t.subscription_status, sp.tier_level
    FROM tenants t
    LEFT JOIN subscription_plans sp ON t.subscription_plan_id = sp.id
    WHERE t.id = $1 AND t.is_active = true
  `, [tenant_id]);

  if (tenantResult.rows.length === 0) {
    return res.json({
      status: 'success',
      data: { hasAccess: false, reason: 'tenant_inactive' }
    });
  }

  const tenant = tenantResult.rows[0];
  const tierLevel = tenant.tier_level || 1;

  // Get app requirements
  const appResult = await pool.query(`
    SELECT ar.min_plan_tier, ar.requires_roles,
           taa.is_enabled, taa.granted_override
    FROM app_registry ar
    LEFT JOIN tenant_app_access taa 
      ON taa.app_id = ar.id AND taa.tenant_id = $1
    WHERE ar.slug = $2 AND ar.is_active = true
  `, [tenant_id, appSlug]);

  if (appResult.rows.length === 0) {
    return res.json({
      status: 'success',
      data: { hasAccess: false, reason: 'app_not_found' }
    });
  }

  const app = appResult.rows[0];
  const tierGranted = tierLevel >= app.min_plan_tier;
  const rolesArray = app.requires_roles || [];
  const roleGranted = rolesArray.length === 0 || rolesArray.includes(role) || role === 'super_admin';
  const hasOverrideGrant = app.granted_override === true;
  const isDisabledOverride = app.is_enabled === false;
  const subscriptionActive = ['active', 'trialing'].includes(tenant.subscription_status) || !tenant.subscription_status;

  const hasAccess = (tierGranted || hasOverrideGrant) && roleGranted && !isDisabledOverride && subscriptionActive;

  res.json({
    status: 'success',
    data: {
      hasAccess,
      reason: hasAccess ? 'granted' : (
        !subscriptionActive ? 'subscription_inactive' :
        !tierGranted && !hasOverrideGrant ? 'tier_required' :
        !roleGranted ? 'role_required' :
        'admin_disabled'
      )
    }
  });
}));

// ============================================================================
// ADMIN ROUTES — Manage app access per tenant
// ============================================================================

/**
 * PUT /portal/admin/tenant/:tenantId/apps/:appSlug
 * Toggle app access for a tenant (super_admin or tenant_admin)
 */
router.put('/admin/tenant/:tenantId/apps/:appSlug', authenticate, asyncHandler(async (req, res) => {
  const { tenantId, appSlug } = req.params;
  const { is_enabled, granted_override } = req.body;
  const { role, tenant_id } = req.user;

  // Authorization: super_admin can manage any tenant, tenant_admin only their own
  if (role !== 'super_admin' && (role !== 'tenant_admin' || tenant_id !== tenantId)) {
    throw new ApiError(403, 'Insufficient permissions');
  }

  // Only super_admin can grant override access beyond tier
  if (granted_override !== undefined && role !== 'super_admin') {
    throw new ApiError(403, 'Only super admins can grant tier overrides');
  }

  // Get app
  const appResult = await pool.query(
    'SELECT id FROM app_registry WHERE slug = $1',
    [appSlug]
  );

  if (appResult.rows.length === 0) {
    throw new ApiError(404, 'App not found');
  }

  const appId = appResult.rows[0].id;

  // Build update fields
  const updates = [];
  const values = [tenantId, appId];
  let paramIdx = 3;

  if (is_enabled !== undefined) {
    updates.push(`is_enabled = $${paramIdx++}`);
    values.push(is_enabled);
  }
  if (granted_override !== undefined) {
    updates.push(`granted_override = $${paramIdx++}`);
    values.push(granted_override);
  }

  // Upsert
  await pool.query(`
    INSERT INTO tenant_app_access (tenant_id, app_id, ${is_enabled !== undefined ? 'is_enabled,' : ''} ${granted_override !== undefined ? 'granted_override,' : ''} updated_at)
    VALUES ($1, $2, ${is_enabled !== undefined ? '$' + (values.indexOf(is_enabled) + 1) + ',' : ''} ${granted_override !== undefined ? '$' + (values.indexOf(granted_override) + 1) + ',' : ''} CURRENT_TIMESTAMP)
    ON CONFLICT (tenant_id, app_id) DO UPDATE SET
      ${updates.join(', ')},
      updated_at = CURRENT_TIMESTAMP
  `, values);

  logger.info('App access updated', { tenantId, appSlug, is_enabled, granted_override });

  res.json({
    status: 'success',
    message: 'App access updated'
  });
}));

/**
 * GET /portal/admin/tenant/:tenantId/apps
 * Get all app access status for a tenant (admin view)
 */
router.get('/admin/tenant/:tenantId/apps', authenticate, asyncHandler(async (req, res) => {
  const { tenantId } = req.params;
  const { role, tenant_id } = req.user;

  if (role !== 'super_admin' && (role !== 'tenant_admin' || tenant_id !== tenantId)) {
    throw new ApiError(403, 'Insufficient permissions');
  }

  const result = await pool.query(`
    SELECT 
      ar.slug, ar.name, ar.description, ar.icon, ar.min_plan_tier, ar.category,
      taa.is_enabled, taa.granted_override, taa.last_accessed_at, taa.access_count
    FROM app_registry ar
    LEFT JOIN tenant_app_access taa 
      ON taa.app_id = ar.id AND taa.tenant_id = $1
    WHERE ar.is_active = true
    ORDER BY ar.sort_order ASC
  `, [tenantId]);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

module.exports = router;
