/**
 * Tenant Detection Service — Portal Edition
 * Extracts tenant identifier from subdomain for multi-tenant routing
 * 
 * Production URL format: {tenant}.portal.busmgr.com
 * Development: Uses localStorage tenant_slug or env var
 */

const APP_SUBDOMAINS = [
  'www', 'api', 'office', 'pos', 'rpos', 'kds', 'herds', 'onboard',
  'app', 'admin', 'restaurant', 'ecommerce', 'shop', 'store',
  'mail', 'smtp', 'ftp', 'cdn', 'static', 'dev', 'staging', 'test', 'demo',
  'kitchen', 'terminal', 'signup', 'backend', 'portal',
];

export const getTenantFromSubdomain = () => {
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const params = new URLSearchParams(window.location.search);
    return params.get('tenant') || localStorage.getItem('tenant_slug') || process.env.REACT_APP_TENANT_SLUG || 'hood-family-farms';
  }

  const parts = hostname.split('.');
  
  // {tenant}.portal.busmgr.com = 4 parts
  if (parts.length >= 4) {
    const candidate = parts[0].toLowerCase();
    if (!APP_SUBDOMAINS.includes(candidate)) {
      return candidate;
    }
  }

  // {tenant}.busmgr.com = 3 parts
  if (parts.length === 3) {
    const candidate = parts[0].toLowerCase();
    if (!APP_SUBDOMAINS.includes(candidate)) {
      return candidate;
    }
  }

  return 'hood-family-farms';
};

export const isDevelopment = () => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

export default { getTenantFromSubdomain, isDevelopment };
