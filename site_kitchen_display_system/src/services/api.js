/**
 * API Helper Service for Kitchen Display System
 * Provides fetch wrappers with multi-tenant support
 */

import { getTenantFromSubdomain } from './tenant';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

/**
 * Get default headers including tenant header
 */
export const getHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Tenant-ID': getTenantFromSubdomain(),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * API fetch wrapper with tenant support
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('kds_token');
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Send SSO cookie with every request
    headers: {
      ...getHeaders(token),
      ...options.headers,
    },
  });
  
  return response;
};

/**
 * SSO bootstrap — check if cookie session exists when no local token
 */
export const checkSSOSession = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
      headers: getHeaders(),
    });
    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Convenience methods
 */
export const api = {
  get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
  
  post: (endpoint, data) => apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  put: (endpoint, data) => apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  patch: (endpoint, data) => apiFetch(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  
  delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
};

// ============================================================================
// TWO-FACTOR AUTHENTICATION
// ============================================================================

export const twoFactorService = {
  getStatus: async () => {
    const response = await apiFetch('/2fa/status');
    const data = await response.json();
    return data.data;
  },

  setup: async () => {
    const response = await apiFetch('/2fa/setup', { method: 'POST' });
    const data = await response.json();
    return data.data;
  },

  verifySetup: async (code) => {
    const response = await apiFetch('/2fa/verify-setup', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return data;
  },

  disable: async (password) => {
    const response = await apiFetch('/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return data;
  },

  regenerateRecovery: async (password) => {
    const response = await apiFetch('/2fa/regenerate-recovery', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return data.data;
  },
};

export { getTenantFromSubdomain, API_URL };
export default api;
