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

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
    const { token, refreshToken, user } = response.data.data;
    localStorage.setItem('portal_token', token);
    localStorage.setItem('portal_refresh_token', refreshToken);
    localStorage.setItem('portal_user', JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_refresh_token');
    localStorage.removeItem('portal_user');
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

export default api;
