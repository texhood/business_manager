/**
 * API Service for System Administration Portal
 * Handles all backend communication
 */

import axios from 'axios';
import { getTenantFromSubdomain } from './tenant';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token and tenant header to requests
api.interceptors.request.use((config) => {
  // Add tenant header for multi-tenant routing (only if tenant exists)
  const tenant = getTenantFromSubdomain();
  if (tenant) {
    config.headers['X-Tenant-ID'] = tenant;
  }
  
  // Add auth token if available
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
  },
};

// ============================================================================
// TENANTS
// ============================================================================

export const tenantsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/tenants', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/tenants/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/admin/tenants', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/admin/tenants/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/admin/tenants/${id}`);
    return response.data;
  },

  getStats: async (id) => {
    const response = await api.get(`/admin/tenants/${id}/stats`);
    return response.data;
  },

  getUsers: async (id) => {
    const response = await api.get(`/admin/tenants/${id}/users`);
    return response.data;
  },

  addUser: async (id, userData) => {
    const response = await api.post(`/admin/tenants/${id}/users`, userData);
    return response.data;
  },
};

// ============================================================================
// ONBOARDING
// ============================================================================

export const onboardingService = {
  // Create new tenant with initial setup
  createTenant: async (data) => {
    const response = await api.post('/admin/onboarding/tenant', data);
    return response.data;
  },

  // Create initial admin user for tenant
  createAdminUser: async (tenantId, userData) => {
    const response = await api.post(`/admin/onboarding/${tenantId}/admin-user`, userData);
    return response.data;
  },

  // Set up business configuration
  configureBusinessSettings: async (tenantId, settings) => {
    const response = await api.post(`/admin/onboarding/${tenantId}/business-settings`, settings);
    return response.data;
  },

  // Initialize chart of accounts
  initializeChartOfAccounts: async (tenantId, template) => {
    const response = await api.post(`/admin/onboarding/${tenantId}/chart-of-accounts`, { template });
    return response.data;
  },

  // Set up integrations
  configureIntegrations: async (tenantId, integrations) => {
    const response = await api.post(`/admin/onboarding/${tenantId}/integrations`, integrations);
    return response.data;
  },

  // Load sample/starter data
  loadSampleData: async (tenantId, options) => {
    const response = await api.post(`/admin/onboarding/${tenantId}/sample-data`, options);
    return response.data;
  },

  // Complete onboarding
  completeOnboarding: async (tenantId) => {
    const response = await api.post(`/admin/onboarding/${tenantId}/complete`);
    return response.data;
  },

  // Get available COA templates
  getChartOfAccountsTemplates: async () => {
    const response = await api.get('/admin/onboarding/coa-templates');
    return response.data;
  },
};

// ============================================================================
// SYSTEM
// ============================================================================

export const systemService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/system/dashboard');
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get('/admin/system/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.put('/admin/system/settings', settings);
    return response.data;
  },

  getAuditLog: async (params = {}) => {
    const response = await api.get('/admin/system/audit-log', { params });
    return response.data;
  },

  getHealthCheck: async () => {
    const response = await api.get('/admin/system/health');
    return response.data;
  },
};

// ============================================================================
// INTEGRATIONS
// ============================================================================

export const integrationsService = {
  // Stripe
  getStripeStatus: async (tenantId) => {
    const response = await api.get(`/admin/integrations/${tenantId}/stripe/status`);
    return response.data;
  },

  configureStripe: async (tenantId, config) => {
    const response = await api.post(`/admin/integrations/${tenantId}/stripe`, config);
    return response.data;
  },

  // Plaid
  getPlaidStatus: async (tenantId) => {
    const response = await api.get(`/admin/integrations/${tenantId}/plaid/status`);
    return response.data;
  },

  configurePlaid: async (tenantId, config) => {
    const response = await api.post(`/admin/integrations/${tenantId}/plaid`, config);
    return response.data;
  },
};

export default api;
