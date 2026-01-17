/**
 * Tenant Detection Service
 * Extracts tenant identifier from subdomain for multi-tenant routing
 * 
 * Production URL format: {tenant}.app.hoodfamilyfarms.com
 * Development: Uses ?tenant= query param or defaults to 'hood'
 */

/**
 * Extract tenant slug from the current hostname
 * @returns {string} The tenant identifier
 */
export const getTenantFromSubdomain = () => {
  const hostname = window.location.hostname;
  
  // Development: localhost uses query param or default
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const params = new URLSearchParams(window.location.search);
    return params.get('tenant') || 'hood';
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
  
  // Fallback for app.hoodfamilyfarms.com (no tenant subdomain)
  return 'hood';
};

/**
 * Get the current tenant ID
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

export default {
  getTenantFromSubdomain,
  getTenantId,
  isDevelopment,
};
