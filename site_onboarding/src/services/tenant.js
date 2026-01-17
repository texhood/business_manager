/**
 * Tenant Detection Service
 * Extracts tenant identifier from subdomain for multi-tenant routing
 * 
 * Production URL format: {tenant}.app.hoodfamilyfarms.com
 * Development: Uses ?tenant= query param or defaults to 'hood'
 */

/**
 * Extract tenant slug from the current hostname
 * @returns {string|null} The tenant identifier or null for system-wide access
 */
export const getTenantFromSubdomain = () => {
  const hostname = window.location.hostname;
  
  // System admin portal (signup.hoodfamilyfarms.com) - no tenant filtering
  if (hostname === 'signup.hoodfamilyfarms.com' || hostname.startsWith('signup.')) {
    return null; // Super admins operate across all tenants
  }
  
  // Development: localhost uses query param or default
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const params = new URLSearchParams(window.location.search);
    return params.get('tenant') || null;
  }
  
  // Production: extract tenant from subdomain
  // Format: {tenant}.app.hoodfamilyfarms.com
  const parts = hostname.split('.');
  
  // Expecting: ['tenant', 'app', 'hoodfamilyfarms', 'com']
  if (parts.length >= 4 && parts[1] === 'app') {
    return parts[0];
  }
  
  // Format: {tenant}.hoodfamilyfarms.com (alternative)
  if (parts.length >= 3 && parts[1] === 'hoodfamilyfarms') {
    return parts[0];
  }
  
  // Fallback - no tenant filtering for system admin
  return null;
};

/**
 * Get the current tenant ID
 * In the future, this could be enhanced to return numeric ID from auth response
 * @returns {string} The tenant identifier
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
 * @returns {string} The full URL for that tenant
 */
export const getTenantUrl = (tenantSlug) => {
  if (isDevelopment()) {
    const url = new URL(window.location.href);
    url.searchParams.set('tenant', tenantSlug);
    return url.toString();
  }
  
  // Production: construct subdomain URL
  return `https://${tenantSlug}.app.hoodfamilyfarms.com`;
};

export default {
  getTenantFromSubdomain,
  getTenantId,
  isDevelopment,
  getTenantUrl,
};
