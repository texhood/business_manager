/**
 * Site Content API Service
 * Fetches site settings, pages, and blocks from the public Site APIs
 */

import { API_URL } from './api';
import { getTenantFromSubdomain } from './tenant';

/**
 * Get headers for public API calls (just tenant ID, no auth)
 */
const getPublicHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Tenant-ID': getTenantFromSubdomain(),
});

/**
 * Fetch tenant info by slug
 */
export const getTenantBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_URL}/site-public/tenant/${slug}`, {
      headers: getPublicHeaders()
    });
    
    if (!response.ok) {
      console.error('Failed to fetch tenant:', slug);
      return null;
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }
};

/**
 * Fetch tenant site settings (branding, contact, social, etc.)
 */
export const getSiteSettings = async () => {
  try {
    const tenantSlug = getTenantFromSubdomain();
    
    // First, get tenant info from slug
    const tenant = await getTenantBySlug(tenantSlug);
    
    if (!tenant) {
      console.error('Tenant not found:', tenantSlug);
      return getDefaultSettings();
    }
    
    // Fetch site settings for this tenant
    const response = await fetch(`${API_URL}/site-public/settings/${tenant.id}`, {
      headers: getPublicHeaders()
    });
    
    if (!response.ok) {
      console.warn('No site settings found, using defaults');
      return {
        ...getDefaultSettings(),
        tenant_id: tenant.id,
        site_name: tenant.name,
        logo_url: tenant.logo_url
      };
    }
    
    const data = await response.json();
    return {
      tenant_id: tenant.id,
      ...data.data
    };
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return getDefaultSettings();
  }
};

/**
 * Default settings when none exist
 */
const getDefaultSettings = () => ({
  tenant_id: null,
  site_name: 'My Business',
  tagline: '',
  logo_url: null,
  favicon_url: null,
  theme_id: null,
  color_overrides: {},
  font_overrides: {},
  contact_info: { phone: '', email: '', address: '' },
  social_links: { facebook: '', instagram: '', twitter: '', linkedin: '' },
  business_hours: [],
  default_seo_title: '',
  default_seo_description: ''
});

/**
 * Fetch all published pages for the tenant
 */
export const getPages = async () => {
  try {
    const response = await fetch(`${API_URL}/site-public/pages`, {
      headers: getPublicHeaders()
    });
    
    if (!response.ok) {
      console.error('Failed to fetch pages');
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
};

/**
 * Fetch navigation menu items
 */
export const getNavigation = async () => {
  try {
    const response = await fetch(`${API_URL}/site-public/navigation`, {
      headers: getPublicHeaders()
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching navigation:', error);
    return [];
  }
};

/**
 * Fetch a specific page by slug with its sections (Site Designer system)
 * @param {string} slug - Page slug (empty string or '__home__' for home page)
 */
export const getPageBySlug = async (slug = '') => {
  try {
    const encodedSlug = slug === '' ? '__home__' : encodeURIComponent(slug);
    const response = await fetch(`${API_URL}/site-public/pages/by-slug/${encodedSlug}`, {
      headers: getPublicHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error('Failed to fetch page:', slug);
      return null;
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching page:', slug, error);
    return null;
  }
};

/**
 * Fetch a page with its blocks (Site Builder system)
 * @param {string} slug - Page slug (empty string or '__home__' for home page)
 */
export const getPageWithBlocks = async (slug = '') => {
  try {
    const encodedSlug = slug === '' ? '__home__' : encodeURIComponent(slug);
    const response = await fetch(`${API_URL}/site-public/builder/pages/by-slug/${encodedSlug}`, {
      headers: getPublicHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error('Failed to fetch page with blocks:', slug);
      return null;
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching page with blocks:', slug, error);
    return null;
  }
};

/**
 * Fetch page blocks by page ID
 * @param {string} pageId - UUID of the page
 */
export const getPageBlocks = async (pageId) => {
  try {
    const response = await fetch(`${API_URL}/site-public/builder/pages/${pageId}/blocks`, {
      headers: getPublicHeaders()
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching page blocks:', error);
    return [];
  }
};

/**
 * Fetch theme details (colors, fonts)
 * @param {string} themeId - UUID of the theme
 */
export const getTheme = async (themeId) => {
  try {
    if (!themeId) return null;
    
    const response = await fetch(`${API_URL}/site-public/themes/${themeId}`, {
      headers: getPublicHeaders()
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching theme:', error);
    return null;
  }
};

/**
 * Get computed colors (theme defaults merged with overrides)
 */
export const getComputedColors = (theme, overrides = {}) => {
  const defaults = theme?.default_colors || {
    primary: '#4a6741',
    secondary: '#8b7355',
    accent: '#d4a574',
    background: '#fdfbf7',
    backgroundAlt: '#f5f1eb',
    text: '#333333',
    textLight: '#666666',
    border: '#e0d5c7'
  };
  
  // Remove null/undefined values from overrides
  const cleanOverrides = Object.fromEntries(
    Object.entries(overrides || {}).filter(([_, v]) => v != null && v !== '')
  );
  
  return { ...defaults, ...cleanOverrides };
};

/**
 * Get computed fonts (theme defaults merged with overrides)
 */
export const getComputedFonts = (theme, overrides = {}) => {
  const defaults = theme?.default_fonts || {
    heading: 'Playfair Display',
    body: 'Open Sans'
  };
  
  // Remove null/undefined values from overrides
  const cleanOverrides = Object.fromEntries(
    Object.entries(overrides || {}).filter(([_, v]) => v != null && v !== '')
  );
  
  return { ...defaults, ...cleanOverrides };
};

export default {
  getTenantBySlug,
  getSiteSettings,
  getPages,
  getNavigation,
  getPageBySlug,
  getPageWithBlocks,
  getPageBlocks,
  getTheme,
  getComputedColors,
  getComputedFonts
};
