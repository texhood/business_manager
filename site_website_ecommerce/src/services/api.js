/**
 * API Helper Service for Website eCommerce
 * Provides fetch wrappers with multi-tenant support
 */

import { getTenantFromSubdomain } from './tenant';

// Determine API URL based on environment
// In production (Vercel), we need the full Railway URL
// In development, we use the proxy
const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Production: use Railway backend
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return 'https://business-manager-production.up.railway.app/api/v1';
  }
  
  // Development: use proxy
  return '/api/v1';
};

const API_URL = getApiUrl();

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
  const token = localStorage.getItem('ecommerce_token');
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(token),
      ...options.headers,
    },
  });
  
  return response;
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
