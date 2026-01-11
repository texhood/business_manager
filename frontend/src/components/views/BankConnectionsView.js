/**
 * BankConnectionsView Component
 * Manages Plaid bank connections and transaction syncing
 */

import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { plaidService } from '../../services/plaidApi';
import { accountingService } from '../../services/api';

// ============================================================================
// PLAID LINK BUTTON COMPONENT
// ============================================================================

function PlaidLinkButton({ onSuccess, onExit }) {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      onSuccess(publicToken, metadata);
    },
    onExit: (err, metadata) => {
      if (err) console.error('Plaid Link error:', err);
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
      {loading ? 'Initializing...' : 'Connect Bank Account'}
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
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

  useEffect(() => { loadData(); }, []);

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

  const handleLinkSuccess = async (publicToken, metadata) => {
    try {
      setMessage({ type: 'info', text: 'Connecting bank account...' });
      const result = await plaidService.exchangeToken(publicToken);
      setMessage({ type: 'success', text: `Successfully connected ${result.institution}!` });
      await loadData();
      await handleSync();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to connect bank account' });
    }
  };

  const handleSync = async (itemId = null) => {
    try {
      setSyncing(true);
      setMessage({ type: 'info', text: 'Syncing transactions...' });
      const result = await plaidService.syncTransactions(itemId);
      setMessage({ type: 'success', text: `Sync complete! Added: ${result.added}, Modified: ${result.modified}` });
      await loadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to sync transactions' });
    } finally {
      setSyncing(false);
    }
  };

  const handleRemove = async (itemId, institutionName) => {
    if (!window.confirm(`Disconnect ${institutionName}? Existing transactions will be preserved.`)) return;
    try {
      await plaidService.removeItem(itemId);
      setMessage({ type: 'success', text: `Disconnected ${institutionName}` });
      await loadData();
    } catch (err) {
      setMessage({ type: 'error', text: `Failed to disconnect: ${err.message}` });
    }
  };

  const handleEditLink = (account) => {
    setEditingAccount(account);
    setSelectedGlAccount(account.linked_account_id || '');
  };

  const handleSaveLink = async () => {
    if (!editingAccount) return;
    try {
      await plaidService.linkAccount(editingAccount.id, selectedGlAccount || null);
      setMessage({ type: 'success', text: `Linked ${editingAccount.name} to GL account` });
      setEditingAccount(null);
      await loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to link account' });
    }
  };

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
            }}
          >
            {syncing ? 'Syncing...' : 'Sync All'}
          </button>
          <PlaidLinkButton onSuccess={handleLinkSuccess} />
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          backgroundColor: message.type === 'error' ? '#fef2f2' : message.type === 'success' ? '#f0fdf4' : '#eff6ff',
          color: message.type === 'error' ? '#dc2626' : message.type === 'success' ? '#16a34a' : '#2563eb',
        }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '2px dashed #e5e7eb' }}>
          <h3>No Bank Accounts Connected</h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>Connect your bank to import transactions automatically.</p>
          <PlaidLinkButton onSuccess={handleLinkSuccess} />
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Connected Banks</h2>
          {items.map((item) => (
            <div key={item.id} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px' }}>{item.institution_name}</h3>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>{item.account_count} account(s)</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleSync(item.item_id)} disabled={syncing} className="btn btn-secondary">Sync</button>
                  <button onClick={() => handleRemove(item.item_id, item.institution_name)} style={{ color: '#dc2626', border: '1px solid #fecaca', background: '#fef2f2', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Disconnect</button>
                </div>
              </div>
            </div>
          ))}

          <h2 style={{ fontSize: '18px', marginTop: '32px', marginBottom: '16px' }}>Accounts</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Account</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Bank</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Balance</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Linked GL Account</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
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
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace' }}>
                      ${account.current_balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {editingAccount?.id === account.id ? (
                        <select value={selectedGlAccount} onChange={(e) => setSelectedGlAccount(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                          <option value="">-- Select GL Account --</option>
                          {glAccounts.map(gl => <option key={gl.id} value={gl.id}>{gl.account_code} - {gl.name}</option>)}
                        </select>
                      ) : (
                        <span style={{ color: account.linked_account_name ? '#16a34a' : '#dc2626' }}>
                          {account.linked_account_name || '⚠ Not linked'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {editingAccount?.id === account.id ? (
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button onClick={handleSaveLink} style={{ padding: '6px 12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                          <button onClick={() => setEditingAccount(null)} style={{ padding: '6px 12px', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditLink(account)} style={{ padding: '6px 12px', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>
                          {account.linked_account_name ? 'Change' : 'Link'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
