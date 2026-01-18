/**
 * API Helper Service for Restaurant POS
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
  const token = localStorage.getItem('restaurant_pos_token');
  
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
  
  delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
};

export { getTenantFromSubdomain, API_URL };
export default api;
