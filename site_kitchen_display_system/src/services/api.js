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

export { getTenantFromSubdomain, API_URL };
export default api;
