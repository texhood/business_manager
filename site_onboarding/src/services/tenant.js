/**
 * Tenant Detection Service
 * Extracts tenant identifier from subdomain for multi-tenant routing
 * 
 * Production URL format: {tenant}.{app}.hoodfamilyfarms.com
 * Example: hood-family-farms.onboard.hoodfamilyfarms.com
 * 
 * Development: Uses ?tenant= query param or defaults to null (system-wide)
 * 
 * Note: The onboarding portal operates in both tenant-specific and system-wide modes
 */

// App subdomains that are NOT tenant slugs
const APP_SUBDOMAINS = [
  'www', 'api', 'office', 'pos', 'rpos', 'kds', 'herds', 'onboard', 
  'app', 'admin', 'restaurant', 'ecommerce', 'shop', 'store',
  'mail', 'smtp', 'ftp', 'cdn', 'static', 'dev', 'staging', 'test', 'demo',
  'kitchen', 'terminal', 'signup', 'backend',
];

/**
 * Extract tenant slug from the current hostname
 * @returns {string|null} The tenant identifier or null for system-wide access
 */
export const getTenantFromSubdomain = () => {
  const hostname = window.location.hostname;
  
  // System admin portal (signup.hoodfamilyfarms.com or onboard.hoodfamilyfarms.com) - no tenant filtering
  if (hostname === 'signup.hoodfamilyfarms.com' || hostname.startsWith('signup.')) {
    return null; // Super admins operate across all tenants
  }
  if (hostname === 'onboard.hoodfamilyfarms.com') {
    return null; // Direct onboard portal access = system-wide
  }
  
  // Development: localhost uses query param or null for system-wide
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const params = new URLSearchParams(window.location.search);
    return params.get('tenant') || null;
  }
  
  // Production: extract tenant from subdomain
  // Format: {tenant}.{app}.hoodfamilyfarms.com
  const parts = hostname.split('.');
  
  // Need at least 4 parts: tenant.app.domain.tld
  // Example: hood-family-farms.onboard.hoodfamilyfarms.com
  if (parts.length >= 4) {
    const potentialTenant = parts[0];
    
    // If first part is not a reserved app subdomain, it's a tenant
    if (!APP_SUBDOMAINS.includes(potentialTenant.toLowerCase())) {
      return potentialTenant;
    }
  }
  
  // Format: {tenant}.hoodfamilyfarms.com (3 parts, alternative pattern)
  if (parts.length === 3) {
    const potentialTenant = parts[0];
    if (!APP_SUBDOMAINS.includes(potentialTenant.toLowerCase())) {
      return potentialTenant;
    }
  }
  
  // Fallback - no tenant filtering for system admin
  return null;
};

/**
 * Get the current tenant ID (alias for getTenantFromSubdomain)
 * @returns {string|null} The tenant identifier or null
 */
export const getTenantId = () => {
  return getTenantFromSubdomain();
};

/**
 * Check if we're running in development mode
 * @returns {boolean}
 */
export const isDevelopment = () => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

/**
 * Build a URL for a different tenant (useful for tenant switching)
 * @param {string} tenantSlug - The tenant to switch to
 * @param {string} appName - The app subdomain (e.g., 'onboard', 'office')
 * @returns {string} The full URL for that tenant
 */
export const getTenantUrl = (tenantSlug, appName = 'onboard') => {
  if (isDevelopment()) {
    const url = new URL(window.location.href);
    url.searchParams.set('tenant', tenantSlug);
    return url.toString();
  }
  
  // Production: construct subdomain URL
  return `https://${tenantSlug}.${appName}.hoodfamilyfarms.com`;
};

export default {
  getTenantFromSubdomain,
  getTenantId,
  isDevelopment,
  getTenantUrl,
};
