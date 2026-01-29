/**
 * Site Context
 * Provides site settings, theme, branding, and navigation across all components
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import siteContentApi from '../services/siteContent';

// Default values
const defaultSiteContext = {
  // Loading state
  loading: true,
  error: null,
  
  // Tenant info
  tenantId: null,
  
  // Site settings
  siteName: '',
  tagline: '',
  logoUrl: null,
  faviconUrl: null,
  
  // Theme & colors
  theme: null,
  colors: {
    primary: '#4a6741',
    secondary: '#8b7355',
    accent: '#d4a574',
    background: '#fdfbf7',
    backgroundAlt: '#f5f1eb',
    text: '#333333',
    textLight: '#666666',
    border: '#e0d5c7'
  },
  fonts: {
    heading: 'Playfair Display',
    body: 'Open Sans'
  },
  
  // Contact & social
  contactInfo: { phone: '', email: '', address: '' },
  socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '' },
  businessHours: [],
  
  // SEO defaults
  defaultSeoTitle: '',
  defaultSeoDescription: '',
  
  // Navigation
  navigation: [],
  pages: [],
  
  // Methods
  refreshSettings: () => {},
  getPageBySlug: () => null
};

const SiteContext = createContext(defaultSiteContext);

/**
 * Hook to access site context
 */
export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};

/**
 * Site Provider Component
 * Wraps the app and provides site data to all children
 */
export const SiteProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(null);
  const [theme, setTheme] = useState(null);
  const [pages, setPages] = useState([]);
  const [navigation, setNavigation] = useState([]);

  // Load site settings and theme on mount
  const loadSiteData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch site settings
      const siteSettings = await siteContentApi.getSiteSettings();
      
      if (!siteSettings) {
        setError('Failed to load site settings');
        setLoading(false);
        return;
      }
      
      setSettings(siteSettings);
      
      // Fetch theme if we have a theme_id
      if (siteSettings.theme_id) {
        const themeData = await siteContentApi.getTheme(siteSettings.theme_id);
        setTheme(themeData);
      }
      
      // Fetch published pages
      const pagesData = await siteContentApi.getPages();
      setPages(pagesData);
      
      // Fetch navigation
      const navData = await siteContentApi.getNavigation();
      setNavigation(navData);
      
    } catch (err) {
      console.error('Error loading site data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSiteData();
  }, [loadSiteData]);

  // Apply CSS custom properties for colors
  useEffect(() => {
    if (!settings) return;
    
    const colors = siteContentApi.getComputedColors(theme, settings.color_overrides);
    const fonts = siteContentApi.getComputedFonts(theme, settings.font_overrides);
    
    const root = document.documentElement;
    
    // Set color variables
    Object.entries(colors).forEach(([key, value]) => {
      // Convert camelCase to kebab-case for CSS variables
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--color-${cssKey}`, value);
    });
    
    // Set font variables
    root.style.setProperty('--font-heading', fonts.heading);
    root.style.setProperty('--font-body', fonts.body);
    
    // Update document title
    if (settings.site_name) {
      document.title = settings.default_seo_title || settings.site_name;
    }
    
    // Update meta description
    if (settings.default_seo_description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = settings.default_seo_description;
    }
    
    // Update favicon if provided
    if (settings.favicon_url) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon_url;
    }
    
  }, [settings, theme]);

  // Find a page by its slug
  const getPageBySlug = useCallback((slug) => {
    return pages.find(p => p.slug === slug) || null;
  }, [pages]);

  // Compute the context value
  const contextValue = {
    loading,
    error,
    
    tenantId: settings?.tenant_id || null,
    
    siteName: settings?.site_name || '',
    tagline: settings?.tagline || '',
    logoUrl: settings?.logo_url || null,
    faviconUrl: settings?.favicon_url || null,
    
    theme,
    colors: siteContentApi.getComputedColors(theme, settings?.color_overrides),
    fonts: siteContentApi.getComputedFonts(theme, settings?.font_overrides),
    
    contactInfo: settings?.contact_info || { phone: '', email: '', address: '' },
    socialLinks: settings?.social_links || { facebook: '', instagram: '', twitter: '', linkedin: '' },
    businessHours: settings?.business_hours || [],
    
    defaultSeoTitle: settings?.default_seo_title || '',
    defaultSeoDescription: settings?.default_seo_description || '',
    
    navigation,
    pages,
    
    refreshSettings: loadSiteData,
    getPageBySlug
  };

  // Show loading screen until settings are loaded to prevent color flash
  if (loading) {
    return (
      <SiteContext.Provider value={contextValue}>
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fdfbf7', // Neutral background
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e0e0e0',
            borderTopColor: '#4a6741',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </SiteContext.Provider>
    );
  }

  return (
    <SiteContext.Provider value={contextValue}>
      {children}
    </SiteContext.Provider>
  );
};

export default SiteContext;
