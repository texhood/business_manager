/**
 * BankConnectionsView Component
 * Manages Plaid bank connections and transaction syncing
 * 
 * Installation:
 *   cd frontend
 *   npm install react-plaid-link
 * 
 * Add to App.jsx routes/navigation as needed
 */

import React, { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { plaidService } from '../services/plaidApi';
import { accountingService } from '../services/api';

// ============================================================================
// PLAID LINK BUTTON COMPONENT
// ============================================================================

function PlaidLinkButton({ onSuccess, onExit }) {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch link token on mount
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await plaidService.createLinkToken();
        setLinkToken(data.link_token);
      } catch (err) {
        console.error('Error fetching link token:', err);
        setError('Failed to initialize bank connection. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchLinkToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken, metadata) => {
      console.log('Plaid Link success:', metadata);
      onSuccess(publicToken, metadata);
    },
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid Link error:', err);
      }
      onExit?.(err, metadata);
    },
  });

  if (error) {
    return (
      <div style={{ color: '#dc2626', padding: '8px' }}>
        {error}
        <button 
          onClick={() => window.location.reload()}
          style={{ marginLeft: '8px', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => open()}
      disabled={!ready || loading}
      style={{
        backgroundColor: ready && !loading ? '#2563eb' : '#9ca3af',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '6px',
        border: 'none',
        fontSize: '16px',
        fontWeight: '500',
        cursor: ready && !loading ? 'pointer' : 'not-allowed',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {loading ? (
        <>
          <span className="spinner" /> Initializing...
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4z"/>
          </svg>
          Connect Bank Account
        </>
      )}
    </button>
  );
}

// ============================================================================
// MAIN BANK CONNECTIONS VIEW
// ============================================================================

export default function BankConnectionsView() {
  const [items, setItems] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [glAccounts, setGlAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [selectedGlAccount, setSelectedGlAccount] = useState('');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, accountsData, glAccountsData] = await Promise.all([
        plaidService.getItems(),
        plaidService.getAccounts(),
        accountingService.getAccounts(),
      ]);
      setItems(itemsData);
      setAccounts(accountsData);
      // Filter to only bank-type GL accounts
      const bankGlAccounts = (Array.isArray(glAccountsData) ? glAccountsData : glAccountsData.data || [])
        .filter(a => a.account_subtype === 'bank' || a.account_type === 'asset');
      setGlAccounts(bankGlAccounts);
    } catch (err) {
      console.error('Error loading data:', err);
      setMessage({ type: 'error', text: 'Failed to load bank connections' });
    } finally {
      setLoading(false);
    }
  };

  // Handle successful Plaid Link
  const handleLinkSuccess = async (publicToken, metadata) => {
    try {
      setMessage({ type: 'info', text: 'Connecting bank account...' });
      const result = await plaidService.exchangeToken(publicToken);
      setMessage({ 
        type: 'success', 
        text: `Successfully connected ${result.institution} with ${result.accounts.length} account(s)!` 
      });
      await loadData();
      
      // Auto-sync transactions
      await handleSync();
    } catch (err) {
      console.error('Error exchanging token:', err);
      setMessage({ type: 'error', text: 'Failed to connect bank account' });
    }
  };

  // Sync transactions
  const handleSync = async (itemId = null) => {
    try {
      setSyncing(true);
      setMessage({ type: 'info', text: 'Syncing transactions...' });
      const result = await plaidService.syncTransactions(itemId);
      setMessage({ 
        type: 'success', 
        text: `Sync complete! Added: ${result.added}, Modified: ${result.modified}, Removed: ${result.removed}` 
      });
      await loadData();
    } catch (err) {
      console.error('Error syncing:', err);
      setMessage({ type: 'error', text: 'Failed to sync transactions' });
    } finally {
      setSyncing(false);
    }
  };

  // Remove a bank connection
  const handleRemove = async (itemId, institutionName) => {
    if (!window.confirm(`Are you sure you want to disconnect ${institutionName}? This will not delete existing transactions.`)) {
      return;
    }

    try {
      await plaidService.removeItem(itemId);
      setMessage({ type: 'success', text: `Disconnected ${institutionName}` });
      await loadData();
    } catch (err) {
      console.error('Error removing item:', err);
      setMessage({ type: 'error', text: `Failed to disconnect bank: ${err.message}` });
    }
  };

  // Start editing account link
  const handleEditLink = (account) => {
    setEditingAccount(account);
    setSelectedGlAccount(account.linked_account_id || '');
  };

  // Save account link
  const handleSaveLink = async () => {
    if (!editingAccount) return;

    try {
      await plaidService.linkAccount(editingAccount.id, selectedGlAccount || null);
      setMessage({ type: 'success', text: `Linked ${editingAccount.name} to GL account` });
      setEditingAccount(null);
      setSelectedGlAccount('');
      await loadData();
    } catch (err) {
      console.error('Error linking account:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to link account' });
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingAccount(null);
    setSelectedGlAccount('');
  };

  // Clear message after delay
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>Bank Connections</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => handleSync()}
            disabled={syncing || items.length === 0}
            style={{
              backgroundColor: syncing ? '#9ca3af' : '#059669',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: syncing || items.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {syncing ? 'Syncing...' : 'Sync All Transactions'}
          </button>
          <PlaidLinkButton onSuccess={handleLinkSuccess} />
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            backgroundColor: message.type === 'error' ? '#fef2f2' : message.type === 'success' ? '#f0fdf4' : '#eff6ff',
            color: message.type === 'error' ? '#dc2626' : message.type === 'success' ? '#16a34a' : '#2563eb',
            border: `1px solid ${message.type === 'error' ? '#fecaca' : message.type === 'success' ? '#bbf7d0' : '#bfdbfe'}`,
          }}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading...
        </div>
      ) : items.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          backgroundColor: '#f9fafb', 
          borderRadius: '8px',
          border: '2px dashed #e5e7eb',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" style={{ margin: '0 auto 16px' }}>
            <path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4z"/>
          </svg>
          <h3 style={{ margin: '0 0 8px', color: '#374151' }}>No Bank Accounts Connected</h3>
          <p style={{ margin: '0 0 20px', color: '#6b7280' }}>
            Connect your bank account to automatically import transactions.
          </p>
          <PlaidLinkButton onSuccess={handleLinkSuccess} />
        </div>
      ) : (
        <div>
          {/* Connected Banks */}
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Connected Banks</h2>
          <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '600' }}>
                      {item.institution_name}
                    </h3>
                    <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                      {item.account_count} account(s) · Connected {new Date(item.created_at).toLocaleDateString()}
                    </p>
                    {item.status !== 'active' && (
                      <span style={{
                        display: 'inline-block',
                        marginTop: '8px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: item.status === 'error' ? '#fef2f2' : '#fef3c7',
                        color: item.status === 'error' ? '#dc2626' : '#d97706',
                      }}>
                        {item.status === 'error' ? `Error: ${item.error_message}` : item.status}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleSync(item.item_id)}
                      disabled={syncing}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        backgroundColor: 'white',
                        cursor: syncing ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      Sync
                    </button>
                    <button
                      onClick={() => handleRemove(item.item_id, item.institution_name)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: '1px solid #fecaca',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Accounts Table */}
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Accounts
            <span style={{ fontSize: '14px', fontWeight: '400', color: '#6b7280', marginLeft: '12px' }}>
              Link each bank account to a GL account for automatic journal entries
            </span>
          </h2>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', fontSize: '14px', borderBottom: '1px solid #e5e7eb' }}>Account</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', fontSize: '14px', borderBottom: '1px solid #e5e7eb' }}>Bank</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', fontSize: '14px', borderBottom: '1px solid #e5e7eb' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500', fontSize: '14px', borderBottom: '1px solid #e5e7eb' }}>Balance</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', fontSize: '14px', borderBottom: '1px solid #e5e7eb' }}>Linked GL Account</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '500', fontSize: '14px', borderBottom: '1px solid #e5e7eb', width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '500' }}>{account.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>••••{account.mask}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>{account.institution_name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: '#f3f4f6',
                        textTransform: 'capitalize',
                      }}>
                        {account.subtype || account.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace' }}>
                      ${account.current_balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {editingAccount?.id === account.id ? (
                        <select
                          value={selectedGlAccount}
                          onChange={(e) => setSelectedGlAccount(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                          }}
                        >
                          <option value="">-- Select GL Account --</option>
                          {glAccounts.map(gl => (
                            <option key={gl.id} value={gl.id}>
                              {gl.account_code} - {gl.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ color: account.linked_account_name ? '#16a34a' : '#dc2626', fontWeight: account.linked_account_name ? '500' : '400' }}>
                          {account.linked_account_name || '⚠ Not linked'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {editingAccount?.id === account.id ? (
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            onClick={handleSaveLink}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: '#16a34a',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '13px',
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: '1px solid #d1d5db',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              fontSize: '13px',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditLink(account)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '13px',
                          }}
                        >
                          {account.linked_account_name ? 'Change' : 'Link'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Help Text */}
          <div style={{ 
            marginTop: '16px', 
            padding: '16px', 
            backgroundColor: '#eff6ff', 
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
          }}>
            <h4 style={{ margin: '0 0 8px', color: '#1e40af', fontSize: '14px' }}>💡 Why link accounts?</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#3b82f6' }}>
              When you accept a transaction from the bank feed, the system needs to know which GL account 
              represents this bank account. Link each Plaid account to its corresponding GL account 
              (e.g., "Chase Checking" → "1000 - Cash Checking") so journal entries are created correctly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
