/**
 * Plaid API Service (Multi-Tenant)
 * Uses the shared api axios instance for automatic auth token
 * and X-Tenant-ID header injection.
 * 
 * Usage:
 *   import { plaidService } from './services/plaidApi';
 *   const token = await plaidService.createLinkToken();
 */

import api from './api';

export const plaidService = {
  /**
   * Create a link token to initialize Plaid Link
   */
  async createLinkToken() {
    const response = await api.post('/plaid/create-link-token');
    return response.data;
  },

  /**
   * Exchange public token for access token after Link completes
   */
  async exchangeToken(publicToken) {
    const response = await api.post('/plaid/exchange-token', {
      public_token: publicToken,
    });
    return response.data;
  },

  /**
   * Create a link token for update mode (re-authentication)
   */
  async createUpdateLinkToken(itemId) {
    const response = await api.post('/plaid/create-update-link-token', {
      item_id: itemId,
    });
    return response.data;
  },

  /**
   * Notify backend that update mode completed successfully
   */
  async updateComplete(itemId) {
    const response = await api.post('/plaid/update-complete', {
      item_id: itemId,
    });
    return response.data;
  },

  /**
   * Sync transactions from all linked banks
   */
  async syncTransactions(itemId = null) {
    const response = await api.post('/plaid/sync-transactions', {
      item_id: itemId,
    });
    return response.data;
  },

  /**
   * Refresh accounts from Plaid for existing items
   */
  async refreshAccounts(itemId = null) {
    const response = await api.post('/plaid/refresh-accounts', {
      item_id: itemId,
    });
    return response.data;
  },

  /**
   * Get all linked bank accounts
   */
  async getAccounts() {
    const response = await api.get('/plaid/accounts');
    return response.data;
  },

  /**
   * Get all Plaid items (bank connections)
   */
  async getItems() {
    const response = await api.get('/plaid/items');
    return response.data;
  },

  /**
   * Link a Plaid account to a GL account
   */
  async linkAccount(plaidAccountId, glAccountId) {
    try {
      const response = await api.put(`/plaid/accounts/${plaidAccountId}/link`, {
        linked_account_id: glAccountId,
      });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      const err = new Error(errorData.message || errorData.error || 'Failed to link account');
      err.details = errorData;
      throw err;
    }
  },

  /**
   * Remove a bank connection
   */
  async removeItem(itemId) {
    const response = await api.delete(`/plaid/items/${itemId}`);
    return response.data;
  },
};

export default plaidService;
