/**
 * useTenantBranding.js
 * ===========================================================================
 * SHARED HOOK — Portal copy
 * See site_back_office/src/hooks/useTenantBranding.js for canonical version
 * ===========================================================================
 */

import { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

function getTenantSlug() {
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return localStorage.getItem('tenant_slug') || process.env.REACT_APP_TENANT_SLUG || null;
  }

  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const candidate = parts[0].toLowerCase();
    const reserved = [
      'www', 'api', 'office', 'pos', 'rpos', 'kds', 'herds', 'onboard',
      'app', 'admin', 'mail', 'smtp', 'ftp', 'cdn', 'static',
      'dev', 'staging', 'test', 'demo', 'kitchen', 'terminal',
      'signup', 'backend', 'portal',
    ];
    if (!reserved.includes(candidate)) return candidate;
  }
  return null;
}

function hexToHsl(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { h: 0, s: 0, l: 0 };
  let r = parseInt(m[1], 16) / 255;
  let g = parseInt(m[2], 16) / 255;
  let b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: h = 0;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function applyBrandColor(hex) {
  const hsl = hexToHsl(hex);
  const root = document.documentElement;
  root.style.setProperty('--brand-color', hex);
  root.style.setProperty('--primary', hex);
  root.style.setProperty('--primary-color', hex);
  root.style.setProperty('--brand-color-h', hsl.h);
  root.style.setProperty('--brand-color-s', `${hsl.s}%`);
  root.style.setProperty('--brand-color-l', `${hsl.l}%`);
  root.style.setProperty('--brand-color-light', `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 15, 90)}%)`);
  root.style.setProperty('--brand-color-dark', `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 10, 10)}%)`);
  root.style.setProperty('--brand-color-bg', `hsl(${hsl.h}, ${Math.max(hsl.s - 30, 10)}%, 95%)`);
  root.style.setProperty('--primary-hover', `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 10, 10)}%)`);
  root.style.setProperty('--primary-dark', `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 10, 10)}%)`);
  root.style.setProperty('--primary-light', `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 15, 90)}%)`);
  root.style.setProperty('--primary-bg', `hsl(${hsl.h}, ${Math.max(hsl.s - 30, 10)}%, 95%)`);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', hex);
}

export function useTenantBranding(appSuffix = '') {
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    const slug = getTenantSlug();
    if (!slug) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${API_URL}/tenants/by-slug/${slug}`);
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data || json;
        if (cancelled) return;
        setTenant(data);
        if (data.primary_color) applyBrandColor(data.primary_color);
        const name = data.business_name || data.name || '';
        if (name) {
          document.title = appSuffix ? `${name} - ${appSuffix}` : name;
        }
      } catch (err) {
        console.warn('useTenantBranding: failed to load', err.message);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [appSuffix]);

  return tenant;
}

export default useTenantBranding;
