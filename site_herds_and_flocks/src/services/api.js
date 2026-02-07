/**
 * Herds & Flocks API Service
 * Handles all communication with the backend API
 */

import axios from 'axios';
import { getTenantFromSubdomain } from './tenant';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send SSO cookie with every request
});

// Request interceptor - add auth token and tenant header
api.interceptors.request.use(
  (config) => {
    // Add tenant header for multi-tenant routing
    const tenant = getTenantFromSubdomain();
    config.headers['X-Tenant-ID'] = tenant;
    
    // Add auth token if available
    const token = localStorage.getItem('hf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent redirect during SSO bootstrap
let _ssoChecking = false;

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !_ssoChecking) {
      localStorage.removeItem('hf_token');
      localStorage.removeItem('hf_user');
      window.location.href = '/';
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
    localStorage.setItem('hf_token', token);
    localStorage.setItem('hf_refreshToken', refreshToken);
    localStorage.setItem('hf_user', JSON.stringify(user));
    return user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Best-effort
    }
    localStorage.removeItem('hf_token');
    localStorage.removeItem('hf_refreshToken');
    localStorage.removeItem('hf_user');
  },

  // SSO bootstrap — check if cookie session exists when no local token
  checkSSOSession: async () => {
    try {
      _ssoChecking = true;
      const response = await api.get('/auth/me');
      const user = response.data.data;
      localStorage.setItem('hf_user', JSON.stringify(user));
      return user;
    } catch (e) {
      return null;
    } finally {
      _ssoChecking = false;
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('hf_user');
    return user ? JSON.parse(user) : null;
  },
};

// ============================================================================
// HERDS & FLOCKS
// ============================================================================

export const herdsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/herds-flocks/herds', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/herds-flocks/herds/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/herds-flocks/herds', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/herds-flocks/herds/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/herds-flocks/herds/${id}`);
    return response.data;
  },
};

// ============================================================================
// PASTURES
// ============================================================================

export const pasturesService = {
  getAll: async (params = {}) => {
    const response = await api.get('/herds-flocks/pastures', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/herds-flocks/pastures/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/herds-flocks/pastures', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/herds-flocks/pastures/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/herds-flocks/pastures/${id}`);
    return response.data;
  },

  // Grazing Events
  getGrazingEvents: async (pastureId) => {
    const response = await api.get(`/herds-flocks/pastures/${pastureId}/grazing-events`);
    return response.data;
  },

  createGrazingEvent: async (pastureId, data) => {
    const response = await api.post(`/herds-flocks/pastures/${pastureId}/grazing-events`, data);
    return response.data;
  },

  updateGrazingEvent: async (id, data) => {
    const response = await api.put(`/herds-flocks/grazing-events/${id}`, data);
    return response.data;
  },

  deleteGrazingEvent: async (id) => {
    const response = await api.delete(`/herds-flocks/grazing-events/${id}`);
    return response.data;
  },

  // Soil Samples
  getSoilSamples: async (pastureId) => {
    const response = await api.get(`/herds-flocks/pastures/${pastureId}/soil-samples`);
    return response.data;
  },

  createSoilSample: async (pastureId, data) => {
    const response = await api.post(`/herds-flocks/pastures/${pastureId}/soil-samples`, data);
    return response.data;
  },

  updateSoilSample: async (id, data) => {
    const response = await api.put(`/herds-flocks/soil-samples/${id}`, data);
    return response.data;
  },

  deleteSoilSample: async (id) => {
    const response = await api.delete(`/herds-flocks/soil-samples/${id}`);
    return response.data;
  },

  // Nutrients
  addNutrient: async (sampleId, data) => {
    const response = await api.post(`/herds-flocks/soil-samples/${sampleId}/nutrients`, data);
    return response.data;
  },

  deleteNutrient: async (id) => {
    const response = await api.delete(`/herds-flocks/nutrients/${id}`);
    return response.data;
  },

  // Tasks
  getTasks: async (pastureId, showCompleted = false) => {
    const response = await api.get(`/herds-flocks/pastures/${pastureId}/tasks`, { params: { show_completed: showCompleted } });
    return response.data;
  },

  createTask: async (pastureId, data) => {
    const response = await api.post(`/herds-flocks/pastures/${pastureId}/tasks`, data);
    return response.data;
  },

  updateTask: async (id, data) => {
    const response = await api.put(`/herds-flocks/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/herds-flocks/tasks/${id}`);
    return response.data;
  },

  // Treatments
  getTreatments: async (pastureId) => {
    const response = await api.get(`/herds-flocks/pastures/${pastureId}/treatments`);
    return response.data;
  },

  createTreatment: async (pastureId, data) => {
    const response = await api.post(`/herds-flocks/pastures/${pastureId}/treatments`, data);
    return response.data;
  },

  updateTreatment: async (id, data) => {
    const response = await api.put(`/herds-flocks/treatments/${id}`, data);
    return response.data;
  },

  deleteTreatment: async (id) => {
    const response = await api.delete(`/herds-flocks/treatments/${id}`);
    return response.data;
  },
};

// ============================================================================
// ANIMALS
// ============================================================================

export const animalsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/herds-flocks/animals', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/herds-flocks/animals/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/herds-flocks/animals', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/herds-flocks/animals/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/herds-flocks/animals/${id}`);
    return response.data;
  },

  // Health Records
  getHealthRecords: async (animalId) => {
    const response = await api.get(`/herds-flocks/animals/${animalId}/health-records`);
    return response.data;
  },

  createHealthRecord: async (animalId, data) => {
    const response = await api.post(`/herds-flocks/animals/${animalId}/health-records`, data);
    return response.data;
  },

  updateHealthRecord: async (id, data) => {
    const response = await api.put(`/herds-flocks/health-records/${id}`, data);
    return response.data;
  },

  deleteHealthRecord: async (id) => {
    const response = await api.delete(`/herds-flocks/health-records/${id}`);
    return response.data;
  },

  // Weights
  getWeights: async (animalId) => {
    const response = await api.get(`/herds-flocks/animals/${animalId}/weights`);
    return response.data;
  },

  createWeight: async (animalId, data) => {
    const response = await api.post(`/herds-flocks/animals/${animalId}/weights`, data);
    return response.data;
  },

  updateWeight: async (id, data) => {
    const response = await api.put(`/herds-flocks/weights/${id}`, data);
    return response.data;
  },

  deleteWeight: async (id) => {
    const response = await api.delete(`/herds-flocks/weights/${id}`);
    return response.data;
  },
};

// ============================================================================
// LOOKUP TABLES
// ============================================================================

export const lookupsService = {
  getAnimalTypes: async () => {
    const response = await api.get('/herds-flocks/animal-types');
    return response.data;
  },

  createAnimalType: async (data) => {
    const response = await api.post('/herds-flocks/animal-types', data);
    return response.data;
  },

  getBreeds: async (species) => {
    const response = await api.get('/herds-flocks/breeds', { params: { species } });
    return response.data;
  },

  createBreed: async (data) => {
    const response = await api.post('/herds-flocks/breeds', data);
    return response.data;
  },

  getAnimalCategories: async () => {
    const response = await api.get('/herds-flocks/animal-categories');
    return response.data;
  },

  createAnimalCategory: async (data) => {
    const response = await api.post('/herds-flocks/animal-categories', data);
    return response.data;
  },

  getOwners: async (activeOnly = false) => {
    const response = await api.get('/herds-flocks/owners', { params: { active_only: activeOnly } });
    return response.data;
  },

  createOwner: async (data) => {
    const response = await api.post('/herds-flocks/owners', data);
    return response.data;
  },
};

// ============================================================================
// BUYERS
// ============================================================================

export const buyersService = {
  getAll: async (activeOnly = false) => {
    const response = await api.get('/herds-flocks/buyers', { params: { active_only: activeOnly } });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/herds-flocks/buyers', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/herds-flocks/buyers/${id}`, data);
    return response.data;
  },
};

// ============================================================================
// SALE FEE TYPES
// ============================================================================

export const saleFeeTypesService = {
  getAll: async () => {
    const response = await api.get('/herds-flocks/sale-fee-types');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/herds-flocks/sale-fee-types', data);
    return response.data;
  },
};

// ============================================================================
// SALE TICKETS
// ============================================================================

export const saleTicketsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/herds-flocks/sale-tickets', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/herds-flocks/sale-tickets/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/herds-flocks/sale-tickets', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/herds-flocks/sale-tickets/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/herds-flocks/sale-tickets/${id}`);
    return response.data;
  },

  addItem: async (ticketId, item) => {
    const response = await api.post(`/herds-flocks/sale-tickets/${ticketId}/items`, item);
    return response.data;
  },

  removeItem: async (ticketId, itemId) => {
    const response = await api.delete(`/herds-flocks/sale-tickets/${ticketId}/items/${itemId}`);
    return response.data;
  },

  addFee: async (ticketId, fee) => {
    const response = await api.post(`/herds-flocks/sale-tickets/${ticketId}/fees`, fee);
    return response.data;
  },

  removeFee: async (ticketId, feeId) => {
    const response = await api.delete(`/herds-flocks/sale-tickets/${ticketId}/fees/${feeId}`);
    return response.data;
  },
};

// ============================================================================
// STATISTICS / DASHBOARD
// ============================================================================

export const statsService = {
  getDashboard: async () => {
    const response = await api.get('/herds-flocks/stats');
    return response.data;
  },
};

// ============================================================================
// RAINFALL RECORDS
// ============================================================================

export const rainfallService = {
  getAll: async (params = {}) => {
    const response = await api.get('/herds-flocks/rainfall', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/herds-flocks/rainfall', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/herds-flocks/rainfall/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/herds-flocks/rainfall/${id}`);
    return response.data;
  },
};

// ============================================================================
// PROCESSING RECORDS
// ============================================================================

export const processingService = {
  getAll: async (params = {}) => {
    const response = await api.get('/herds-flocks/processing-records', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/herds-flocks/processing-records/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/herds-flocks/processing-records', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/herds-flocks/processing-records/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/herds-flocks/processing-records/${id}`);
    return response.data;
  },
};

// ============================================================================
// HERD EVENT TYPES
// ============================================================================

export const herdEventTypesService = {
  getAll: async (params = {}) => {
    const response = await api.get('/herds-flocks/herd-event-types', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/herds-flocks/herd-event-types', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/herds-flocks/herd-event-types/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/herds-flocks/herd-event-types/${id}`);
    return response.data;
  },
};

// ============================================================================
// HERD EVENTS
// ============================================================================

export const herdEventsService = {
  getByHerd: async (herdId) => {
    const response = await api.get(`/herds-flocks/herds/${herdId}/events`);
    return response.data;
  },

  create: async (herdId, data) => {
    const response = await api.post(`/herds-flocks/herds/${herdId}/events`, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/herds-flocks/herd-events/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/herds-flocks/herd-events/${id}`);
    return response.data;
  },
};

export default api;
