/**
 * Plaid API Service
 * Add this to your existing api.js or create as separate file
 * 
 * Usage:
 *   import { plaidService } from './services/plaidApi';
 *   const token = await plaidService.createLinkToken();
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

export const plaidService = {
  /**
   * Create a link token to initialize Plaid Link
   */
  async createLinkToken() {
    const response = await fetch(`${API_BASE}/plaid/create-link-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to create link token');
    return response.json();
  },

  /**
   * Exchange public token for access token after Link completes
   */
  async exchangeToken(publicToken) {
    const response = await fetch(`${API_BASE}/plaid/exchange-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_token: publicToken }),
    });
    if (!response.ok) throw new Error('Failed to exchange token');
    return response.json();
  },

  /**
   * Sync transactions from all linked banks
   */
  async syncTransactions(itemId = null) {
    const response = await fetch(`${API_BASE}/plaid/sync-transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId }),
    });
    if (!response.ok) throw new Error('Failed to sync transactions');
    return response.json();
  },

  /**
   * Get all linked bank accounts
   */
  async getAccounts() {
    const response = await fetch(`${API_BASE}/plaid/accounts`);
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return response.json();
  },

  /**
   * Get all Plaid items (bank connections)
   */
  async getItems() {
    const response = await fetch(`${API_BASE}/plaid/items`);
    if (!response.ok) throw new Error('Failed to fetch items');
    return response.json();
  },

  /**
   * Link a Plaid account to a GL account
   */
  async linkAccount(plaidAccountId, glAccountId) {
    const response = await fetch(`${API_BASE}/plaid/accounts/${plaidAccountId}/link`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linked_account_id: glAccountId }),
    });
    if (!response.ok) throw new Error('Failed to link account');
    return response.json();
  },

  /**
   * Remove a bank connection
   */
  async removeItem(itemId) {
    const response = await fetch(`${API_BASE}/plaid/items/${itemId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove bank connection');
    return response.json();
  },
};

export default plaidService;