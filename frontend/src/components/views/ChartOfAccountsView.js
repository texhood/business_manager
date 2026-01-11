/**
 * ChartOfAccountsView Component
 * Manage chart of accounts with import/export functionality
 */

import React, { useState } from 'react';
import { Icons } from '../common/Icons';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { accountingService, importService } from '../../services/api';

const ChartOfAccountsView = ({ accounts, loading, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [formData, setFormData] = useState({ account_code: '', name: '', account_type: 'asset', description: '' });
  
  // Edit state
  const [editAccount, setEditAccount] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    account_code: '',
    name: '',
    account_type: '',
    account_subtype: '',
    normal_balance: 'debit',
    is_active: true,
    description: ''
  });

  // Group accounts by type
  const groupedAccounts = accounts.reduce((groups, account) => {
    const type = account.account_type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(account);
    return groups;
  }, {});

  const accountTypeOrder = ['asset', 'liability', 'equity', 'revenue', 'expense'];
  const accountTypeLabels = {
    asset: 'Assets',
    liability: 'Liabilities',
    equity: 'Equity',
    revenue: 'Revenue',
    expense: 'Expenses'
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await accountingService.createAccount(formData);
      setShowModal(false);
      setFormData({ account_code: '', name: '', account_type: 'asset', description: '' });
      onRefresh();
    } catch (err) {
      alert('Failed to create account: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const result = await importService.importChartOfAccounts(file);
      setImportResult(result);
      onRefresh();
    } catch (err) {
      setImportResult({ 
        success: false, 
        message: err.response?.data?.message || 'Import failed' 
      });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const openEditModal = (account) => {
    setEditAccount(account);
    setEditForm({
      account_code: account.account_code || '',
      name: account.name || '',
      account_type: account.account_type || '',
      account_subtype: account.account_subtype || '',
      normal_balance: account.normal_balance || 'debit',
      is_active: account.is_active !== false,
      description: account.description || ''
    });
  };

  const handleEditSave = async () => {
    if (!editAccount) return;
    
    setEditLoading(true);
    try {
      await accountingService.updateAccount(editAccount.id, editForm);
      setEditAccount(null);
      onRefresh();
    } catch (err) {
      alert('Failed to update account: ' + (err.response?.data?.message || err.message));
    } finally {
      setEditLoading(false);
    }
  };

  const subtypeOptions = {
    asset: ['cash', 'bank', 'accounts_receivable', 'inventory', 'fixed_asset', 'other_asset'],
    liability: ['accounts_payable', 'credit_card', 'current_liability', 'long_term_liability'],
    equity: ['owners_equity', 'retained_earnings'],
    revenue: ['sales', 'other_income'],
    expense: ['cost_of_goods', 'operating_expense', 'other_expense']
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Chart of Accounts</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
            <Icons.Upload /> Import
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Icons.Plus /> Add Account
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Icons.Loader /> Loading...
        </div>
      ) : (
        <div className="card">
          {accountTypeOrder.map(type => (
            groupedAccounts[type] && groupedAccounts[type].length > 0 && (
              <div key={type} style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  padding: '8px 16px', 
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  color: '#374151'
                }}>
                  {accountTypeLabels[type]}
                </h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '100px' }}>Code</th>
                      <th>Name</th>
                      <th>Subtype</th>
                      <th style={{ textAlign: 'right' }}>Balance</th>
                      <th style={{ width: '80px' }}>Status</th>
                      <th style={{ width: '80px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedAccounts[type]
                      .sort((a, b) => a.account_code.localeCompare(b.account_code))
                      .map(account => (
                        <tr key={account.id} style={{ opacity: account.is_active === false ? 0.5 : 1 }}>
                          <td style={{ fontFamily: 'monospace', fontWeight: '500' }}>{account.account_code}</td>
                          <td>{account.name}</td>
                          <td style={{ color: '#666', fontSize: '13px' }}>
                            {account.account_subtype?.replace(/_/g, ' ') || '—'}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                            {formatCurrency(account.current_balance || 0)}
                          </td>
                          <td>
                            <span className={`badge ${account.is_active !== false ? 'badge-green' : 'badge-gray'}`}>
                              {account.is_active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm"
                              onClick={() => openEditModal(account)}
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )
          ))}
        </div>
      )}

      {/* Create Account Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Account">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Account Code</label>
            <input
              type="text"
              value={formData.account_code}
              onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
              placeholder="e.g., 1000"
              required
            />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Cash - Checking"
              required
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select
              value={formData.account_type}
              onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
            >
              <option value="asset">Asset</option>
              <option value="liability">Liability</option>
              <option value="equity">Equity</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Import Chart of Accounts">
        <div style={{ padding: '16px 0' }}>
          <p style={{ marginBottom: '16px' }}>
            Import accounts from a QuickBooks export (CSV format).
          </p>
          
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            disabled={importing}
            style={{ marginBottom: '16px' }}
          />

          {importing && (
            <div style={{ color: '#2563eb' }}>
              <Icons.Loader /> Importing...
            </div>
          )}

          {importResult && (
            <div style={{
              padding: '12px',
              borderRadius: '6px',
              backgroundColor: importResult.success ? '#f0fdf4' : '#fef2f2',
              color: importResult.success ? '#16a34a' : '#dc2626',
              marginTop: '16px'
            }}>
              {importResult.message}
              {importResult.imported > 0 && (
                <div style={{ marginTop: '8px' }}>
                  Imported: {importResult.imported} | Skipped: {importResult.skipped}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Account Modal */}
      <Modal isOpen={!!editAccount} onClose={() => setEditAccount(null)} title="Edit Account">
        <div className="form-group">
          <label>Account Code</label>
          <input
            type="text"
            value={editForm.account_code}
            onChange={(e) => setEditForm({ ...editForm, account_code: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select
            value={editForm.account_type}
            onChange={(e) => setEditForm({ 
              ...editForm, 
              account_type: e.target.value,
              account_subtype: '' 
            })}
          >
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="form-group">
          <label>Subtype</label>
          <select
            value={editForm.account_subtype}
            onChange={(e) => setEditForm({ ...editForm, account_subtype: e.target.value })}
          >
            <option value="">-- Select --</option>
            {(subtypeOptions[editForm.account_type] || []).map(sub => (
              <option key={sub} value={sub}>{sub.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Normal Balance</label>
          <select
            value={editForm.normal_balance}
            onChange={(e) => setEditForm({ ...editForm, normal_balance: e.target.value })}
          >
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
        </div>
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={editForm.is_active}
              onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
            />
            Active
          </label>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            rows={2}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => setEditAccount(null)}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleEditSave}
            disabled={editLoading}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ChartOfAccountsView;
