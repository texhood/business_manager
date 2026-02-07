/**
 * API Service
 * Handles all communication with the backend API
 */

import axios from 'axios';
import { getTenantFromSubdomain } from './tenant';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send SSO cookie with every request
});

// Request interceptor - add auth token and tenant header
api.interceptors.request.use(
  (config) => {
    // Add tenant header for multi-tenant routing
    const tenant = getTenantFromSubdomain();
    config.headers['X-Tenant-ID'] = tenant;
    
    // Add auth token if available
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  register: async (data) => {
    const response = await api.post('/auth/register', data);
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Best-effort
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // SSO bootstrap — check if cookie session exists when no local token
  checkSSOSession: async () => {
    try {
      _ssoChecking = true;
      const response = await api.get('/auth/me');
      const user = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (e) {
      return null;
    } finally {
      _ssoChecking = false;
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/me', data);
    localStorage.setItem('user', JSON.stringify(response.data.data));
    return response.data.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/password', { currentPassword, newPassword });
    return response.data;
  },
};

// ============================================================================
// ACCOUNTS (User accounts - customers, staff, etc.)
// ============================================================================

export const accountsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/accounts', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/accounts/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/accounts', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/accounts/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/accounts/${id}`);
    return response.data;
  },

  toggleMembership: async (id, isFarmMember) => {
    const response = await api.patch(`/accounts/${id}/membership`, { is_farm_member: isFarmMember });
    return response.data.data;
  },
};

// ============================================================================
// ITEMS
// ============================================================================

export const itemsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/items', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/items', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/items/${id}`, data);
    return response.data.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/items/${id}/status`, { status });
    return response.data.data;
  },

  delete: async (id, hard = false) => {
    const response = await api.delete(`/items/${id}`, { params: { hard } });
    return response.data;
  },

  adjustInventory: async (id, data) => {
    const response = await api.patch(`/items/${id}/inventory`, data);
    return response.data.data;
  },

  getInventoryHistory: async (id, limit = 50) => {
    const response = await api.get(`/items/${id}/inventory-history`, { params: { limit } });
    return response.data.data;
  },
};

// ============================================================================
// ITEM CATEGORIES (for product/item classification)
// ============================================================================

export const categoriesService = {
  getAll: async (includeInactive = false) => {
    const response = await api.get('/categories', { params: { include_inactive: includeInactive } });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/categories', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  reorder: async (orders) => {
    const response = await api.patch('/categories/reorder', { orders });
    return response.data;
  },
};

export const tagsService = {
  getAll: async () => {
    const response = await api.get('/tags');
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/tags', data);
    return response.data.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tags/${id}`);
    return response.data;
  },
};

// ============================================================================
// TRANSACTIONS
// ============================================================================

export const transactionsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data.data;
  },

  getSummary: async (params = {}) => {
    const response = await api.get('/transactions/summary', { params });
    return response.data.data;
  },

  getFilterOptions: async () => {
    const response = await api.get('/transactions/filter-options');
    return response.data.data;
  },

  getBankAccounts: async () => {
    const response = await api.get('/transactions/bank-accounts');
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/transactions', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  bulkCreate: async (transactions) => {
    const response = await api.post('/transactions/bulk', { transactions });
    return response.data.data;
  },

  exportCSV: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const token = localStorage.getItem('token');
    window.open(`${API_URL}/transactions/export/csv?${queryString}&token=${token}`, '_blank');
  },
};

// ============================================================================
// DELIVERY ZONES
// ============================================================================

export const deliveryZonesService = {
  getAll: async (includeInactive = false) => {
    const response = await api.get('/delivery-zones', { params: { include_inactive: includeInactive } });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/delivery-zones/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/delivery-zones', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/delivery-zones/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/delivery-zones/${id}`);
    return response.data;
  },

  getCustomers: async (id) => {
    const response = await api.get(`/delivery-zones/${id}/customers`);
    return response.data.data;
  },
};

// ============================================================================
// MEMBERSHIPS
// ============================================================================

export const membershipsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/memberships', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/memberships/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/memberships', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/memberships/${id}`, data);
    return response.data.data;
  },

  renew: async (id, newEndDate) => {
    const response = await api.post(`/memberships/${id}/renew`, { new_end_date: newEndDate });
    return response.data.data;
  },

  getExpiring: async (days = 30) => {
    const response = await api.get('/memberships/reports/expiring', { params: { days } });
    return response.data.data;
  },
};

// ============================================================================
// ORDERS
// ============================================================================

export const ordersService = {
  getAll: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/orders', data);
    return response.data.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data.data;
  },

  cancel: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

// ============================================================================
// CLASSES (for tracking by business segment)
// ============================================================================

export const classesService = {
  getAll: async () => {
    const response = await api.get('/classes');
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/classes', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/classes/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },
};

// ============================================================================
// REPORTS
// ============================================================================

export const reportsService = {
  getDashboard: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data.data;
  },

  getProfitLoss: async (params = {}) => {
    const response = await api.get('/reports/profit-loss', { params });
    return response.data.data;
  },

  getSales: async (params = {}) => {
    const response = await api.get('/reports/sales', { params });
    return response.data.data;
  },

  getInventory: async () => {
    const response = await api.get('/reports/inventory');
    return response.data.data;
  },

  getCustomers: async () => {
    const response = await api.get('/reports/customers');
    return response.data.data;
  },

  getDelivery: async (date) => {
    const response = await api.get('/reports/delivery', { params: { date } });
    return response.data.data;
  },

  // Financial Reports
  getIncomeStatement: async (startDate, endDate, options = {}) => {
    const params = { start_date: startDate, end_date: endDate, ...options };
    const response = await api.get('/financial-reports/income-statement', { params });
    return response.data.data;
  },

  getBalanceSheet: async (asOfDate, options = {}) => {
    const params = { as_of_date: asOfDate, ...options };
    const response = await api.get('/financial-reports/balance-sheet', { params });
    return response.data.data;
  },

  getSalesByCustomer: async (startDate, endDate, limit = 50) => {
    const params = { start_date: startDate, end_date: endDate, limit };
    const response = await api.get('/financial-reports/sales-by-customer', { params });
    return response.data.data;
  },

  getSalesByClass: async (startDate, endDate) => {
    const params = { start_date: startDate, end_date: endDate };
    const response = await api.get('/financial-reports/sales-by-class', { params });
    return response.data.data;
  },

  // Report configurations
  getConfigurations: async (reportType = null) => {
    const params = reportType ? { report_type: reportType } : {};
    const response = await api.get('/financial-reports/configurations', { params });
    return response.data.data;
  },

  saveConfiguration: async (config) => {
    const response = await api.post('/financial-reports/configurations', config);
    return response.data.data;
  },

  updateConfiguration: async (id, config) => {
    const response = await api.put(`/financial-reports/configurations/${id}`, config);
    return response.data.data;
  },

  deleteConfiguration: async (id) => {
    const response = await api.delete(`/financial-reports/configurations/${id}`);
    return response.data;
  },

  getReportAccounts: async (type = null) => {
    const params = type ? { type } : {};
    const response = await api.get('/financial-reports/accounts', { params });
    return response.data.data;
  },

  getAccountTransactions: async (accountId, startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get(`/financial-reports/account-transactions/${accountId}`, { params });
    return response.data.data;
  },

  // CSV Export methods
  exportIncomeStatementCSV: async (startDate, endDate) => {
    try {
      const response = await api.get(`/financial-reports/income-statement/csv?start_date=${startDate}&end_date=${endDate}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `income_statement_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export error:', error);
      alert('Failed to export CSV. Please try again.');
    }
  },

  exportBalanceSheetCSV: async (asOfDate) => {
    try {
      const response = await api.get(`/financial-reports/balance-sheet/csv?as_of_date=${asOfDate}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `balance_sheet_${asOfDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export error:', error);
      alert('Failed to export CSV. Please try again.');
    }
  },

  exportSalesByCustomerCSV: async (startDate, endDate) => {
    try {
      const response = await api.get(`/financial-reports/sales-by-customer/csv?start_date=${startDate}&end_date=${endDate}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_by_customer_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export error:', error);
      alert('Failed to export CSV. Please try again.');
    }
  },

  exportSalesByClassCSV: async (startDate, endDate) => {
    try {
      const response = await api.get(`/financial-reports/sales-by-class/csv?start_date=${startDate}&end_date=${endDate}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_by_class_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export error:', error);
      alert('Failed to export CSV. Please try again.');
    }
  },
};

// ============================================================================
// ACCOUNTING (Double-Entry)
// ============================================================================

export const accountingService = {
  // Chart of Accounts
  getAccounts: async (params = {}) => {
    const response = await api.get('/accounting/accounts', { params });
    return response.data.data;
  },

  getAccountById: async (id) => {
    const response = await api.get(`/accounting/accounts/${id}`);
    return response.data.data;
  },

  createAccount: async (data) => {
    const response = await api.post('/accounting/accounts', data);
    return response.data.data;
  },

  updateAccount: async (id, data) => {
    const response = await api.put(`/accounting/accounts/${id}`, data);
    return response.data.data;
  },

  deleteAccount: async (id) => {
    const response = await api.delete(`/accounting/accounts/${id}`);
    return response.data;
  },

  // Journal Entries
  getJournalEntries: async (params = {}) => {
    const response = await api.get('/accounting/journal-entries', { params });
    return response.data;
  },

  getJournalEntry: async (id) => {
    const response = await api.get(`/accounting/journal-entries/${id}`);
    return response.data.data;
  },

  createJournalEntry: async (data) => {
    const response = await api.post('/accounting/journal-entries', data);
    return response.data.data;
  },

  postJournalEntry: async (id) => {
    const response = await api.post(`/accounting/journal-entries/${id}/post`);
    return response.data.data;
  },

  voidJournalEntry: async (id, reason) => {
    const response = await api.post(`/accounting/journal-entries/${id}/void`, { reason });
    return response.data.data;
  },

  deleteJournalEntry: async (id) => {
    const response = await api.delete(`/accounting/journal-entries/${id}`);
    return response.data;
  },

  // Financial Reports
  getTrialBalance: async (asOfDate) => {
    const response = await api.get('/accounting/reports/trial-balance', { 
      params: { as_of_date: asOfDate } 
    });
    return response.data.data;
  },

  getBalanceSheet: async () => {
    const response = await api.get('/accounting/reports/balance-sheet');
    return response.data.data;
  },

  getIncomeStatement: async (startDate, endDate) => {
    const response = await api.get('/accounting/reports/income-statement', { 
      params: { start_date: startDate, end_date: endDate } 
    });
    return response.data.data;
  },

  getGeneralLedger: async (accountId, startDate, endDate) => {
    const response = await api.get(`/accounting/reports/general-ledger/${accountId}`, { 
      params: { start_date: startDate, end_date: endDate } 
    });
    return response.data.data;
  },
};

// ============================================================================
// IMPORT (QuickBooks CSV)
// ============================================================================

export const importService = {
  importChartOfAccounts: async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (options.replace_existing) formData.append('replace_existing', options.replace_existing);
    if (options.skip_duplicates) formData.append('skip_duplicates', options.skip_duplicates);
    
    const response = await api.post('/import/quickbooks/chart-of-accounts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  downloadTemplate: () => {
    const token = localStorage.getItem('token');
    window.open(`${API_URL}/import/quickbooks/template?token=${token}`, '_blank');
  },
};

// ============================================================================
// TRANSACTION ACCEPTANCE (Bank Feed Workflow)
// ============================================================================

export const transactionAcceptanceService = {
  // Get transactions by status
  getPending: async (limit = 100, offset = 0) => {
    const response = await api.get('/transaction-acceptance/pending', { params: { limit, offset } });
    return response.data;
  },

  getAccepted: async (params = {}) => {
    const response = await api.get('/transaction-acceptance/accepted', { params });
    return response.data;
  },

  getExcluded: async (limit = 100, offset = 0) => {
    const response = await api.get('/transaction-acceptance/excluded', { params: { limit, offset } });
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/transaction-acceptance/summary');
    return response.data.data;
  },

  /**
   * Accept a transaction
   * @param {string} id - Transaction ID
   * @param {object} data - { account_id, class_id, description }
   *   - account_id: GL account from chart of accounts (expense/revenue)
   *   - class_id: Optional business segment class
   *   - description: Optional description override
   * Note: Bank account is automatically derived from transaction's plaid_account_id
   */
  accept: async (id, data) => {
    const response = await api.post(`/transaction-acceptance/${id}/accept`, data);
    return response.data;
  },

  // Exclude a transaction (mark as not applicable)
  exclude: async (id, reason) => {
    const response = await api.post(`/transaction-acceptance/${id}/exclude`, { reason });
    return response.data;
  },

  // Unaccept a transaction (void journal entry, return to pending)
  unaccept: async (id) => {
    const response = await api.post(`/transaction-acceptance/${id}/unaccept`);
    return response.data;
  },

  // Restore an excluded transaction back to pending
  restore: async (id) => {
    const response = await api.post(`/transaction-acceptance/${id}/restore`);
    return response.data;
  },

  // Create a manual transaction for review
  createManual: async (data) => {
    const response = await api.post('/transaction-acceptance/manual', data);
    return response.data;
  },

  /**
   * Bulk accept transactions
   * @param {array} transactionIds - Array of transaction IDs
   * @param {number} accountId - GL account ID (expense/revenue)
   * @param {number} classId - Optional class ID
   * Note: Bank account is automatically derived for each transaction
   */
  bulkAccept: async (transactionIds, accountId, classId = null) => {
    const response = await api.post('/transaction-acceptance/bulk-accept', {
      transaction_ids: transactionIds,
      account_id: accountId,
      class_id: classId
    });
    return response.data;
  },
};

// ============================================================================
// JOURNAL ENTRIES
// ============================================================================

export const journalEntriesService = {
  // Get all journal entries with pagination and filters
  getAll: async (params = {}) => {
    const response = await api.get('/journal-entries', { params });
    return response.data;
  },

  // Get a single journal entry with lines
  getById: async (id) => {
    const response = await api.get(`/journal-entries/${id}`);
    return response.data;
  },

  // Create a new journal entry
  create: async (data) => {
    const response = await api.post('/journal-entries', data);
    return response.data;
  },

  // Update a draft journal entry
  update: async (id, data) => {
    const response = await api.put(`/journal-entries/${id}`, data);
    return response.data;
  },

  // Post a draft entry
  post: async (id) => {
    const response = await api.post(`/journal-entries/${id}/post`);
    return response.data;
  },

  // Void a posted entry
  void: async (id, reason) => {
    const response = await api.post(`/journal-entries/${id}/void`, { reason });
    return response.data;
  },

  // Delete a draft entry
  delete: async (id) => {
    const response = await api.delete(`/journal-entries/${id}`);
    return response.data;
  },
};

// ============================================================================
// DATA IMPORT (Tenant Data Population)
// ============================================================================

export const dataImportService = {
  // Get list of available import types grouped by category
  getTypes: async () => {
    const response = await api.get('/data-import/types');
    return response.data;
  },

  // Download CSV template for a specific import type
  downloadTemplate: (type) => {
    const token = localStorage.getItem('token');
    window.open(`${API_URL}/data-import/template/${type}?token=${token}`, '_blank');
  },

  // Validate import file (dry run)
  validate: async (type, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/data-import/validate/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Execute import
  execute: async (type, file, tenantId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (tenantId) formData.append('tenant_id', tenantId);
    const response = await api.post(`/data-import/execute/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// ============================================================================
// VENDORS
// ============================================================================

export const vendorsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/vendors', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/vendors', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/vendors/${id}`, data);
    return response.data;
  },

  delete: async (id, hard = false) => {
    const response = await api.delete(`/vendors/${id}`, { params: { hard } });
    return response.data;
  },

  quickCreate: async (name) => {
    const response = await api.post('/vendors/quick-create', { name });
    return response.data;
  },

  getTransactions: async (id, params = {}) => {
    const response = await api.get(`/vendors/${id}/transactions`, { params });
    return response.data;
  },
};

// ============================================================================
// REPORT BUILDER (Custom Reports)
// ============================================================================

export const reportBuilderService = {
  // Get available operators for each data type
  getOperators: async () => {
    const response = await api.get('/report-builder/operators');
    return response.data;
  },

  // Get all available record types (tables/views)
  getRecords: async () => {
    const response = await api.get('/report-builder/records');
    return response.data;
  },

  // Get details about a specific record type
  getRecord: async (recordName) => {
    const response = await api.get(`/report-builder/records/${recordName}`);
    return response.data;
  },

  // Get field definitions for a record type
  getFields: async (recordName) => {
    const response = await api.get(`/report-builder/records/${recordName}/fields`);
    return response.data;
  },

  // Execute preview query
  preview: async (data) => {
    const response = await api.post('/report-builder/preview', data);
    return response.data;
  },

  // Get all saved reports
  getReports: async (params = {}) => {
    const response = await api.get('/report-builder/reports', { params });
    return response.data;
  },

  // Get a specific saved report
  getReport: async (id) => {
    const response = await api.get(`/report-builder/reports/${id}`);
    return response.data;
  },

  // Save a new report
  saveReport: async (data) => {
    const response = await api.post('/report-builder/reports', data);
    return response.data;
  },

  // Update an existing report
  updateReport: async (id, data) => {
    const response = await api.put(`/report-builder/reports/${id}`, data);
    return response.data;
  },

  // Delete a report
  deleteReport: async (id) => {
    const response = await api.delete(`/report-builder/reports/${id}`);
    return response.data;
  },

  // Run a saved report
  runReport: async (id, params = {}) => {
    const response = await api.post(`/report-builder/reports/${id}/run`, params);
    return response.data;
  },

  // Toggle favorite
  toggleFavorite: async (id) => {
    const response = await api.post(`/report-builder/reports/${id}/favorite`);
    return response.data;
  },

  // Export saved report to CSV
  exportReport: async (id) => {
    const response = await api.get(`/report-builder/reports/${id}/export?format=csv`, {
      responseType: 'blob'
    });
    return response;
  },

  // Export preview to CSV
  exportPreview: async (data) => {
    const response = await api.post('/report-builder/preview/export', { ...data, format: 'csv' }, {
      responseType: 'blob'
    });
    return response;
  },
};

// ============================================================================
// STRIPE CONNECT
// ============================================================================

export const connectService = {
  // Get current account status
  getStatus: async () => {
    const response = await api.get('/connect/accounts/status');
    return response.data.data;
  },

  // Create a connected account
  createAccount: async () => {
    const response = await api.post('/connect/accounts');
    return response.data.data;
  },

  // Get onboarding link
  getOnboardingLink: async (returnUrl, refreshUrl) => {
    const response = await api.post('/connect/accounts/onboarding-link', {
      return_url: returnUrl,
      refresh_url: refreshUrl,
    });
    return response.data.data;
  },

  // Get login link for Stripe Express dashboard
  getLoginLink: async () => {
    const response = await api.post('/connect/accounts/login-link');
    return response.data.data;
  },

  // Platform admin: Get all connected accounts
  getAllAccounts: async (params = {}) => {
    const response = await api.get('/connect/platform/accounts', { params });
    return response.data;
  },

  // Platform admin: Get fee summary
  getFees: async (params = {}) => {
    const response = await api.get('/connect/platform/fees', { params });
    return response.data.data;
  },

  // Platform admin: Get settings
  getSettings: async () => {
    const response = await api.get('/connect/platform/settings');
    return response.data.data;
  },

  // Platform admin: Update settings
  updateSetting: async (key, value) => {
    const response = await api.put('/connect/platform/settings', { key, value });
    return response.data;
  },
};

// ============================================================================
// FIXED ASSETS
// ============================================================================

export const fixedAssetsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/fixed-assets', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/fixed-assets/${id}`);
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get('/fixed-assets/categories');
    return response.data;
  },
  getSummary: async () => {
    const response = await api.get('/fixed-assets/summary');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/fixed-assets', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/fixed-assets/${id}`, data);
    return response.data;
  },
  regenerateSchedule: async (id) => {
    const response = await api.post(`/fixed-assets/${id}/regenerate-schedule`);
    return response.data;
  },
  postDepreciation: async (id, throughPeriod) => {
    const response = await api.post(`/fixed-assets/${id}/post-depreciation`, { through_period: throughPeriod });
    return response.data;
  },
  dispose: async (id, data) => {
    const response = await api.post(`/fixed-assets/${id}/dispose`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/fixed-assets/${id}`);
    return response.data;
  },
};

export default api;
