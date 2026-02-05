/**
 * App Access Middleware
 * Defense-in-depth gating — checks tenant subscription tier 
 * before allowing access to app-specific API routes.
 * 
 * Usage in server.js:
 *   const { requireAppAccess } = require('./middleware/appAccess');
 *   app.use(`${API_PREFIX}/restaurant-pos`, authenticate, requireAppAccess('restaurant'), restaurantPosRouter);
 * 
 * Or within individual route files:
 *   router.use(requireAppAccess('herds'));
 */

const db = require('../../config/database');
const logger = require('../utils/logger');

const pool = db.pool || db;

// Cache app requirements for 5 minutes to avoid DB hits on every request
const appCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

async function getAppRequirements(appSlug) {
  const cached = appCache.get(appSlug);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const result = await pool.query(`
    SELECT id, slug, min_plan_tier, requires_roles
    FROM app_registry
    WHERE slug = $1 AND is_active = true
  `, [appSlug]);

  if (result.rows.length === 0) {
    return null;
  }

  const data = result.rows[0];
  appCache.set(appSlug, { data, timestamp: Date.now() });
  return data;
}

// Cache tenant tier for 2 minutes
const tenantTierCache = new Map();
const TENANT_CACHE_TTL = 2 * 60 * 1000;

async function getTenantTier(tenantId) {
  const cached = tenantTierCache.get(tenantId);
  if (cached && Date.now() - cached.timestamp < TENANT_CACHE_TTL) {
    return cached.data;
  }

  const result = await pool.query(`
    SELECT t.subscription_status, sp.tier_level
    FROM tenants t
    LEFT JOIN subscription_plans sp ON t.subscription_plan_id = sp.id
    WHERE t.id = $1 AND t.is_active = true
  `, [tenantId]);

  if (result.rows.length === 0) {
    return null;
  }

  const data = result.rows[0];
  tenantTierCache.set(tenantId, { data, timestamp: Date.now() });
  return data;
}

/**
 * Middleware factory — check if the requesting user's tenant has
 * access to the specified app.
 * 
 * @param {string} appSlug - The app_registry.slug to check against
 * @returns {Function} Express middleware
 */
const requireAppAccess = (appSlug) => {
  return async (req, res, next) => {
    try {
      // Must have authenticated user with tenant
      if (!req.user || !req.user.tenant_id) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const { tenant_id, role } = req.user;

      // Super admins bypass all gating
      if (role === 'super_admin') {
        return next();
      }

      // Get app requirements
      const app = await getAppRequirements(appSlug);
      if (!app) {
        // App not in registry — allow access (backward compatibility)
        logger.warn(`App "${appSlug}" not found in registry, allowing access`);
        return next();
      }

      // Get tenant tier
      const tenant = await getTenantTier(tenant_id);
      if (!tenant) {
        return res.status(403).json({
          status: 'error',
          message: 'Tenant not found or inactive',
          code: 'TENANT_INACTIVE'
        });
      }

      // Check subscription is active
      const subscriptionActive = ['active', 'trialing'].includes(tenant.subscription_status) || !tenant.subscription_status;
      if (!subscriptionActive) {
        return res.status(403).json({
          status: 'error',
          message: 'Subscription inactive. Please update your billing.',
          code: 'SUBSCRIPTION_INACTIVE',
          portalUrl: `https://${req.hostname.split('.').pop()}/billing`
        });
      }

      const tierLevel = tenant.tier_level || 1;

      // Check tier access
      if (tierLevel < app.min_plan_tier) {
        // Check for override
        const overrideResult = await pool.query(`
          SELECT granted_override, is_enabled
          FROM tenant_app_access
          WHERE tenant_id = $1 AND app_id = $2
        `, [tenant_id, app.id]);

        const override = overrideResult.rows[0];
        const hasOverride = override && override.granted_override === true;
        const isDisabled = override && override.is_enabled === false;

        if (!hasOverride || isDisabled) {
          return res.status(403).json({
            status: 'error',
            message: `This feature requires a ${app.min_plan_tier <= 2 ? 'Professional' : 'Enterprise'} plan or higher.`,
            code: 'TIER_REQUIRED',
            requiredTier: app.min_plan_tier,
            currentTier: tierLevel
          });
        }
      }

      // Check role access
      const rolesArray = app.requires_roles || [];
      if (rolesArray.length > 0 && !rolesArray.includes(role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Your role does not have access to this application.',
          code: 'ROLE_REQUIRED'
        });
      }

      next();
    } catch (error) {
      logger.error('App access check failed:', error);
      // Fail open on errors to avoid blocking legitimate requests
      next();
    }
  };
};

/**
 * Clear caches (useful after plan changes)
 */
const clearAppAccessCache = () => {
  appCache.clear();
  tenantTierCache.clear();
};

module.exports = {
  requireAppAccess,
  clearAppAccessCache,
};
