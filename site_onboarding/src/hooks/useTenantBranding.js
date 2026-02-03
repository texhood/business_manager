/**
 * useTenantBranding Hook
 *
 * Fetches tenant branding from the public API and applies:
 *   - CSS custom properties (--brand-color, --primary, etc.)
 *   - Document title (business name + app suffix)
 *   - Meta theme-color tag
 *   - Favicon (if tenant has one uploaded)
 *
 * Usage:
 *   import { useTenantBranding } from './hooks/useTenantBranding';
 *   function App() {
 *     const tenant = useTenantBranding('Admin');  // title becomes "Fred's Farm - Admin"
 *     ...
 *   }
 */

import { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

/**
 * Extract the tenant slug from the current hostname.
 * e.g. "freds-farm.office.busmgr.com" → "freds-farm"
 *      "freds-farm.herds.busmgr.com"  → "freds-farm"
 *      "localhost"                      → null
 */
function getTenantSlug() {
  const hostname = window.location.hostname;

  // Local development: try localStorage or env fallback
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return localStorage.getItem('tenant_slug') || process.env.REACT_APP_TENANT_SLUG || null;
  }

  // Production: first segment of subdomain is the tenant slug
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

/**
 * Darken or lighten a hex color by a given amount.
 * Negative amount = darker, positive = lighter.
 */
function adjustColor(hex, amount) {
  let color = hex.replace('#', '');
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }
  const num = parseInt(color, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

/**
 * Convert hex to rgba string.
 */
function hexToRgba(hex, alpha) {
  let color = hex.replace('#', '');
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }
  const num = parseInt(color, 16);
  const r = (num >> 16) & 0xFF;
  const g = (num >> 8) & 0xFF;
  const b = num & 0xFF;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function useTenantBranding(appSuffix = '') {
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    const slug = getTenantSlug();
    if (!slug) {
      console.warn('useTenantBranding: Could not determine tenant slug from hostname');
      return;
    }

    let cancelled = false;

    async function loadBranding() {
      try {
        // Use the base URL without /api/v1 path, then add it back
        const baseUrl = API_URL.endsWith('/api/v1')
          ? API_URL
          : `${API_URL}/api/v1`;

        const res = await fetch(`${baseUrl.replace(/\/api\/v1$/, '/api/v1')}/tenant-branding/${slug}`);
        if (!res.ok) {
          console.warn(`Tenant branding fetch failed (${res.status}) for slug: ${slug}`);
          return;
        }

        const json = await res.json();
        const data = json.data || json;

        if (cancelled) return;

        // ── Apply CSS Custom Properties ──────────────────────────────
        const root = document.documentElement;
        const color = data.primary_color;

        if (color) {
          // Set every common variant so all CSS in any app picks it up
          root.style.setProperty('--brand-color', color);
          root.style.setProperty('--primary', color);
          root.style.setProperty('--primary-color', color);
          root.style.setProperty('--accent-color', color);
          root.style.setProperty('--theme-color', color);

          // Hover / dark variant  (15% darker)
          const hoverColor = adjustColor(color, -25);
          root.style.setProperty('--brand-color-hover', hoverColor);
          root.style.setProperty('--primary-hover', hoverColor);
          root.style.setProperty('--primary-dark', hoverColor);

          // Light variant (for backgrounds)
          root.style.setProperty('--brand-color-light', adjustColor(color, 60));
          root.style.setProperty('--primary-light', adjustColor(color, 60));
          root.style.setProperty('--primary-bg', hexToRgba(color, 0.08));

          // Secondary color if provided
          if (data.secondary_color) {
            root.style.setProperty('--secondary', data.secondary_color);
            root.style.setProperty('--secondary-color', data.secondary_color);
          }
        }

        // ── Document Title ───────────────────────────────────────────
        const businessName = data.business_name || data.name || '';
        if (businessName) {
          document.title = appSuffix
            ? `${businessName} - ${appSuffix}`
            : businessName;
        }

        // ── Meta Theme-Color ─────────────────────────────────────────
        if (color) {
          const meta = document.querySelector('meta[name="theme-color"]');
          if (meta) {
            meta.setAttribute('content', color);
          }
        }

        // ── Favicon ──────────────────────────────────────────────────
        if (data.favicon_url) {
          const apiBase = API_URL.replace('/api/v1', '');
          const faviconHref = data.favicon_url.startsWith('http')
            ? data.favicon_url
            : `${apiBase}${data.favicon_url}`;

          let link = document.querySelector("link[rel*='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = faviconHref;
        }

        setTenant(data);
      } catch (err) {
        console.warn('useTenantBranding: Failed to load branding', err.message);
      }
    }

    loadBranding();

    return () => { cancelled = true; };
  }, [appSuffix]);

  return tenant;
}

export default useTenantBranding;