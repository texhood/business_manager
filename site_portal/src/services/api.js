/**
 * API Service — Portal
 * Handles all communication with the backend API
 */

import axios from 'axios';
import { getTenantFromSubdomain } from './tenant';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send SSO cookie with every request
});

// Request interceptor — add auth token and tenant header
api.interceptors.request.use((config) => {
  const tenant = getTenantFromSubdomain();
  config.headers['X-Tenant-ID'] = tenant;

  const token = localStorage.getItem('portal_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Flag to prevent redirect during SSO bootstrap
let _ssoChecking = false;

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !_ssoChecking) {
      localStorage.removeItem('portal_token');
      localStorage.removeItem('portal_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH
// ============================================================================

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data.data;

    // If 2FA is required, return the pending state instead of completing login
    if (data.requires2FA) {
      return { requires2FA: true, twoFactorToken: data.twoFactorToken };
    }

    const { token, refreshToken, user } = data;
    localStorage.setItem('portal_token', token);
    localStorage.setItem('portal_refresh_token', refreshToken);
    localStorage.setItem('portal_user', JSON.stringify(user));
    return user;
  },

  verify2FA: async (twoFactorToken, code) => {
    const response = await api.post('/auth/verify-2fa', { twoFactorToken, code });
    const { token, refreshToken, user } = response.data.data;
    localStorage.setItem('portal_token', token);
    localStorage.setItem('portal_refresh_token', refreshToken);
    localStorage.setItem('portal_user', JSON.stringify(user));
    return user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Best-effort — clear local state regardless
    }
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_refresh_token');
    localStorage.removeItem('portal_user');
  },

  // SSO bootstrap — check if cookie session exists when no local token
  checkSSOSession: async () => {
    try {
      _ssoChecking = true;
      const response = await api.get('/auth/me');
      const user = response.data.data;
      localStorage.setItem('portal_user', JSON.stringify(user));
      return user;
    } catch (e) {
      return null;
    } finally {
      _ssoChecking = false;
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('portal_user');
    return user ? JSON.parse(user) : null;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },
};

// ============================================================================
// PORTAL
// ============================================================================

export const portalService = {
  getLauncher: async () => {
    const response = await api.get('/portal/launcher');
    return response.data.data;
  },

  recordAccess: async (appSlug) => {
    await api.post(`/portal/apps/${appSlug}/access`);
  },

  checkAccess: async (appSlug) => {
    const response = await api.get(`/portal/check-access/${appSlug}`);
    return response.data.data;
  },
};

// ============================================================================
// TWO-FACTOR AUTHENTICATION
// ============================================================================

export const twoFactorService = {
  getStatus: async () => {
    const response = await api.get('/2fa/status');
    return response.data.data;
  },

  setup: async () => {
    const response = await api.post('/2fa/setup');
    return response.data.data;
  },

  verifySetup: async (code) => {
    const response = await api.post('/2fa/verify-setup', { code });
    return response.data;
  },

  disable: async (password) => {
    const response = await api.post('/2fa/disable', { password });
    return response.data;
  },

  regenerateRecovery: async (password) => {
    const response = await api.post('/2fa/regenerate-recovery', { password });
    return response.data.data;
  },
};

export default api;
