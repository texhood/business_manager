import React, { useState, useEffect } from 'react';
import { authService, accountsService, itemsService, transactionsService, deliveryZonesService, accountingService, importService, reportsService, transactionAcceptanceService, accountingCategoriesService, classesService } from './services/api';
import './App.css';
import BankConnectionsView from './components/BankConnectionsView';

// ============================================================================
// HOOD FAMILY FARMS - ADMIN APPLICATION
// With Authentication & API Integration
// ============================================================================

// ============================================================================
// ICON COMPONENTS
// ============================================================================
const Icons = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Package: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  DollarSign: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Book: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  Truck: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  BarChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  TrendingDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  LogOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Loader: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
      <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  ),
  Inbox: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  XCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  RefreshCw: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  Tag: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  Bank: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
    </svg>
  ),
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ============================================================================
// LOGIN COMPONENT
// ============================================================================
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <h1>🌱 Hood Family Farms</h1>
          <p>Business Manager</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <Icons.AlertCircle />
              <span>{error}</span>
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sara@hoodfamilyfarms.com"
              required
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <Icons.Loader /> : <Icons.Check />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL COMPONENT
// ============================================================================
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: '400px', md: '600px', lg: '800px', xl: '1000px' };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: sizes[size] }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

// ============================================================================
// DASHBOARD VIEW
// ============================================================================
const DashboardView = ({ accounts, items, transactions }) => {
  const farmMembers = accounts.filter(a => a.is_farm_member).length;
  const totalCustomers = accounts.filter(a => a.role === 'customer').length;
  const lowStockItems = items.filter(i => i.item_type === 'inventory' && i.inventory_quantity <= 5 && i.inventory_quantity > 0).length;
  const outOfStockItems = items.filter(i => i.item_type === 'inventory' && i.inventory_quantity === 0).length;
  
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const netProfit = totalIncome - totalExpenses;
  
  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  
  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="subtitle">Welcome back to Hood Family Farms</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon"><Icons.TrendingUp /></div>
          <div className="stat-content">
            <span className="stat-label">Total Income</span>
            <span className="stat-value">{formatCurrency(totalIncome)}</span>
          </div>
        </div>
        <div className="stat-card expense">
          <div className="stat-icon"><Icons.TrendingDown /></div>
          <div className="stat-content">
            <span className="stat-label">Total Expenses</span>
            <span className="stat-value">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
        <div className="stat-card profit">
          <div className="stat-icon"><Icons.DollarSign /></div>
          <div className="stat-content">
            <span className="stat-label">Net Profit</span>
            <span className="stat-value">{formatCurrency(netProfit)}</span>
          </div>
        </div>
        <div className="stat-card members">
          <div className="stat-icon"><Icons.Star /></div>
          <div className="stat-content">
            <span className="stat-label">Farm Members</span>
            <span className="stat-value">{farmMembers} <span className="stat-detail">of {totalCustomers}</span></span>
          </div>
        </div>
      </div>
      
      {(lowStockItems > 0 || outOfStockItems > 0) && (
        <div className="card">
          <div className="card-header"><h2>⚠️ Inventory Alerts</h2></div>
          <div className="card-body">
            {outOfStockItems > 0 && <p><strong style={{color: '#c62828'}}>{outOfStockItems} items</strong> are out of stock</p>}
            {lowStockItems > 0 && <p><strong style={{color: '#f57c00'}}>{lowStockItems} items</strong> are running low</p>}
          </div>
        </div>
      )}
      
      <div className="card">
        <div className="card-header"><h2>Recent Transactions</h2></div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Date</th><th>Description</th><th>Type</th><th style={{textAlign: 'right'}}>Amount</th></tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr><td colSpan="4" style={{textAlign: 'center', padding: '40px', color: '#888'}}>No transactions yet</td></tr>
              ) : (
                recentTransactions.map(txn => (
                  <tr key={txn.id}>
                    <td>{formatDate(txn.date)}</td>
                    <td>{txn.description}</td>
                    <td><span className={`badge ${txn.type === 'income' ? 'badge-green' : 'badge-red'}`}>{txn.type}</span></td>
                    <td style={{textAlign: 'right', fontWeight: 600, color: txn.type === 'income' ? '#2e7d32' : '#c62828'}}>{formatCurrency(txn.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CHART OF ACCOUNTS VIEW
// ============================================================================
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

  // Transaction drill-down state
  const [transactionsAccount, setTransactionsAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const groupedAccounts = accounts.reduce((groups, account) => {
    const type = account.account_type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(account);
    return groups;
  }, {});

  const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
  const typeLabels = { asset: 'Assets', liability: 'Liabilities', equity: 'Equity', revenue: 'Revenue', expense: 'Expenses' };
  const accountSubtypes = {
    asset: ['cash', 'bank', 'accounts_receivable', 'inventory', 'fixed_asset', 'other_asset'],
    liability: ['accounts_payable', 'credit_card', 'current_liability', 'long_term_liability'],
    equity: ['owners_equity', 'retained_earnings'],
    revenue: ['sales', 'other_income'],
    expense: ['cost_of_goods', 'operating_expense', 'other_expense']
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await accountingService.createAccount(formData);
      setShowModal(false);
      setFormData({ account_code: '', name: '', account_type: 'asset', description: '' });
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create account');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    const fileInput = e.target.querySelector('input[type="file"]');
    const file = fileInput?.files?.[0];
    if (!file) {
      alert('Please select a CSV file');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const result = await importService.importChartOfAccounts(file, { skip_duplicates: 'true' });
      setImportResult(result.data);
      onRefresh();
    } catch (err) {
      setImportResult({ error: err.response?.data?.message || 'Import failed' });
    } finally {
      setImporting(false);
    }
  };

  // Edit handlers
  const openEditModal = (account, e) => {
    if (e) e.stopPropagation();
    setEditForm({
      account_code: account.account_code || '',
      name: account.name || '',
      account_type: account.account_type || '',
      account_subtype: account.account_subtype || '',
      normal_balance: account.normal_balance || 'debit',
      is_active: account.is_active !== false,
      description: account.description || ''
    });
    setEditAccount(account);
  };

  const closeEditModal = () => {
    setEditAccount(null);
    setEditForm({
      account_code: '',
      name: '',
      account_type: '',
      account_subtype: '',
      normal_balance: 'debit',
      is_active: true,
      description: ''
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'account_type') {
        updated.normal_balance = (value === 'asset' || value === 'expense') ? 'debit' : 'credit';
        updated.account_subtype = '';
      }
      return updated;
    });
  };

  const saveEdit = async () => {
    setEditLoading(true);
    try {
      await accountingService.updateAccount(editAccount.id, editForm);
      closeEditModal();
      onRefresh();
    } catch (err) {
      alert('Failed to update account: ' + (err.response?.data?.message || err.message));
    } finally {
      setEditLoading(false);
    }
  };

  // Transaction drill-down handlers
  const openTransactionsModal = async (account, e) => {
    if (e) e.stopPropagation();
    setTransactionsAccount(account);
    setTransactionsLoading(true);
    setTransactions([]);
    
    try {
      const data = await reportsService.getAccountTransactions(account.id, null, null);
      console.log('Account transactions response:', data);
      // Handle various response formats
      const txns = data.transactions || data.entries || data || [];
      if (txns.length > 0) {
        console.log('First transaction keys:', Object.keys(txns[0]));
        console.log('First transaction:', txns[0]);
      }
      setTransactions(Array.isArray(txns) ? txns : []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      alert('Failed to load transactions: ' + (err.response?.data?.message || err.message));
    } finally {
      setTransactionsLoading(false);
    }
  };

  const closeTransactionsModal = () => {
    setTransactionsAccount(null);
    setTransactions([]);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Chart of Accounts</h1>
        <p className="subtitle">Manage your accounting structure</p>
      </div>

      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Icons.Plus /> Add Account</button>
        <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: 18, height: 18}}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import from QuickBooks
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="card-body" style={{textAlign: 'center', padding: '40px'}}><Icons.Loader /><p>Loading accounts...</p></div>
        ) : accounts.length === 0 ? (
          <div className="card-body" style={{textAlign: 'center', padding: '40px', color: '#888'}}>
            <p>No accounts yet. Add accounts manually or import from QuickBooks.</p>
          </div>
        ) : (
          accountTypes.map(type => (
            groupedAccounts[type] && groupedAccounts[type].length > 0 && (
              <div key={type}>
                <div className={`account-type-header ${type}`}>{typeLabels[type]} ({groupedAccounts[type].length})</div>
                {groupedAccounts[type].sort((a, b) => a.account_code.localeCompare(b.account_code)).map(account => (
                  <div className="account-row" key={account.id}>
                    <span 
                      className="account-code" 
                      style={{cursor: 'pointer', color: '#1976d2'}}
                      onClick={(e) => openEditModal(account, e)}
                      title="Click to edit account"
                    >
                      {account.account_code}
                    </span>
                    <span 
                      className="account-name" 
                      style={{cursor: 'pointer', color: '#1976d2'}}
                      onClick={(e) => openEditModal(account, e)}
                      title="Click to edit account"
                    >
                      {account.name}
                    </span>
                    <span 
                      className={`account-balance ${account.normal_balance}`}
                      style={{cursor: 'pointer', textDecoration: 'underline'}}
                      onClick={(e) => openTransactionsModal(account, e)}
                      title="Click to view transactions"
                    >
                      {formatCurrency(account.current_balance)}
                    </span>
                  </div>
                ))}
              </div>
            )
          ))
        )}
      </div>

      {/* Add Account Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Account">
        <form onSubmit={handleCreate}>
          <div className="form-row">
            <div className="form-group">
              <label>Account Code</label>
              <input type="text" value={formData.account_code} onChange={(e) => setFormData({...formData, account_code: e.target.value})} placeholder="e.g., 1050" required />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <select value={formData.account_type} onChange={(e) => setFormData({...formData, account_type: e.target.value})} required>
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
                <option value="equity">Equity</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Account Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Petty Cash" required />
          </div>
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="2" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Account</button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => { setShowImportModal(false); setImportResult(null); }} title="Import from QuickBooks">
        <form onSubmit={handleImport}>
          <div style={{background: '#f0f7ff', padding: 16, borderRadius: 8, marginBottom: 20}}>
            <h4 style={{margin: '0 0 8px', color: '#1565c0'}}>How to export from QuickBooks:</h4>
            <ol style={{margin: 0, paddingLeft: 20, fontSize: 14, color: '#555'}}>
              <li>In QuickBooks, go to <strong>Lists → Chart of Accounts</strong></li>
              <li>Click <strong>Excel → Export All Accounts</strong></li>
              <li>Save as CSV file</li>
              <li>Upload the file below</li>
            </ol>
          </div>

          <div className="form-group">
            <label>Select CSV File</label>
            <input type="file" accept=".csv" style={{padding: 10, border: '2px dashed #ddd', borderRadius: 8, width: '100%'}} />
          </div>

          {importResult && (
            <div style={{
              padding: 16, 
              borderRadius: 8, 
              marginBottom: 16,
              background: importResult.error ? '#ffebee' : '#e8f5e9',
              color: importResult.error ? '#c62828' : '#2e7d32'
            }}>
              {importResult.error ? (
                <p style={{margin: 0}}><strong>Error:</strong> {importResult.error}</p>
              ) : (
                <div>
                  <p style={{margin: '0 0 8px'}}><strong>Import Complete!</strong></p>
                  <p style={{margin: 0, fontSize: 14}}>
                    ✓ {importResult.imported} accounts imported<br/>
                    {importResult.skipped > 0 && `⊘ ${importResult.skipped} skipped (duplicates or errors)`}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => { setShowImportModal(false); setImportResult(null); }}>
              {importResult?.imported ? 'Done' : 'Cancel'}
            </button>
            {!importResult?.imported && (
              <button type="submit" className="btn btn-primary" disabled={importing}>
                {importing ? 'Importing...' : 'Import Accounts'}
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* Edit Account Modal */}
      {editAccount && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" style={{maxWidth: 500}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Account</h2>
              <button className="modal-close" onClick={closeEditModal}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Account Code</label>
                <input 
                  type="text" 
                  value={editForm.account_code}
                  onChange={(e) => handleEditChange('account_code', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Account Name</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Account Type</label>
                  <select 
                    value={editForm.account_type}
                    onChange={(e) => handleEditChange('account_type', e.target.value)}
                  >
                    <option value="">Select Type</option>
                    {accountTypes.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Subtype</label>
                  <select 
                    value={editForm.account_subtype}
                    onChange={(e) => handleEditChange('account_subtype', e.target.value)}
                    disabled={!editForm.account_type}
                  >
                    <option value="">Select Subtype</option>
                    {editForm.account_type && accountSubtypes[editForm.account_type]?.map(st => (
                      <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Normal Balance</label>
                  <select 
                    value={editForm.normal_balance}
                    onChange={(e) => handleEditChange('normal_balance', e.target.value)}
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
                <div className="form-group" style={{display: 'flex', alignItems: 'flex-end', paddingBottom: 10}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 0}}>
                    <input 
                      type="checkbox" 
                      checked={editForm.is_active}
                      onChange={(e) => handleEditChange('is_active', e.target.checked)}
                    />
                    Active Account
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={editForm.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeEditModal}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Modal */}
      {transactionsAccount && (
        <div className="modal-overlay" onClick={closeTransactionsModal}>
          <div className="modal-content" style={{maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {transactionsAccount.name}
                <span style={{fontSize: 14, color: '#888', marginLeft: 12}}>({transactionsAccount.account_code})</span>
              </h2>
              <button className="modal-close" onClick={closeTransactionsModal}><Icons.X /></button>
            </div>
            <div className="modal-body" style={{overflow: 'auto', flex: 1}}>
              {transactionsLoading ? (
                <div style={{textAlign: 'center', padding: 40}}>
                  <Icons.Loader />
                  <p>Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div style={{textAlign: 'center', padding: 40, color: '#888'}}>
                  <p>No transactions found for this account.</p>
                </div>
              ) : (
                <div>
                  <div style={{display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap'}}>
                    <div style={{background: '#f5f5f5', padding: '12px 20px', borderRadius: 8, textAlign: 'center'}}>
                      <span style={{display: 'block', fontSize: 12, color: '#666', marginBottom: 4}}>Transactions</span>
                      <span style={{display: 'block', fontSize: 18, fontWeight: 600}}>{transactions.length}</span>
                    </div>
                    <div style={{background: '#e3f2fd', padding: '12px 20px', borderRadius: 8, textAlign: 'center'}}>
                      <span style={{display: 'block', fontSize: 12, color: '#666', marginBottom: 4}}>Current Balance</span>
                      <span style={{display: 'block', fontSize: 18, fontWeight: 600}}>{formatCurrency(transactionsAccount.current_balance)}</span>
                    </div>
                  </div>
                  
                  <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 13}}>
                    <thead>
                      <tr style={{background: '#f5f5f5'}}>
                        <th style={{padding: '10px 8px', textAlign: 'left', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', borderBottom: '2px solid #ddd'}}>Date</th>
                        <th style={{padding: '10px 8px', textAlign: 'left', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', borderBottom: '2px solid #ddd'}}>Entry #</th>
                        <th style={{padding: '10px 8px', textAlign: 'left', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', borderBottom: '2px solid #ddd'}}>Description</th>
                        <th style={{padding: '10px 8px', textAlign: 'right', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', borderBottom: '2px solid #ddd'}}>Debit</th>
                        <th style={{padding: '10px 8px', textAlign: 'right', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', borderBottom: '2px solid #ddd'}}>Credit</th>
                        <th style={{padding: '10px 8px', textAlign: 'right', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', borderBottom: '2px solid #ddd'}}>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn, idx) => {
                        // Handle various date formats and field names
                        let dateStr = '-';
                        const dateValue = txn.entry_date || txn.date || txn.transaction_date || txn.created_at || txn.txn_date;
                        if (dateValue) {
                          // Handle YYYY-MM-DD format by adding time to avoid timezone issues
                          const dateInput = typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/) 
                            ? dateValue + 'T12:00:00' 
                            : dateValue;
                          const d = new Date(dateInput);
                          if (!isNaN(d.getTime())) {
                            dateStr = d.toLocaleDateString();
                          } else {
                            // Show raw value if parsing fails
                            dateStr = String(dateValue).substring(0, 10);
                          }
                        }
                        return (
                        <tr key={idx} style={{borderBottom: '1px solid #eee'}}>
                          <td style={{padding: 8}}>{dateStr}</td>
                          <td style={{padding: 8, fontFamily: 'monospace', color: '#666'}}>{txn.entry_number || txn.reference || txn.id || '-'}</td>
                          <td style={{padding: 8}}>{txn.description || txn.line_description || txn.entry_description || txn.memo || '-'}</td>
                          <td style={{padding: 8, textAlign: 'right', color: parseFloat(txn.debit) > 0 ? '#2e7d32' : '#888'}}>
                            {parseFloat(txn.debit) > 0 ? formatCurrency(txn.debit) : '-'}
                          </td>
                          <td style={{padding: 8, textAlign: 'right', color: parseFloat(txn.credit) > 0 ? '#c62828' : '#888'}}>
                            {parseFloat(txn.credit) > 0 ? formatCurrency(txn.credit) : '-'}
                          </td>
                          <td style={{padding: 8, textAlign: 'right', fontWeight: 500}}>
                            {txn.running_balance !== undefined ? formatCurrency(txn.running_balance) : '-'}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeTransactionsModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ACCOUNTS VIEW (Users)
// ============================================================================
const AccountsView = ({ accounts, loading, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    role: 'customer',
    delivery_zone_id: '',
    is_farm_member: false,
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    // Load delivery zones for the dropdown
    const loadZones = async () => {
      try {
        const zones = await deliveryZonesService.getAll();
        setDeliveryZones(Array.isArray(zones) ? zones : zones.data || []);
      } catch (err) {
        console.error('Failed to load delivery zones:', err);
      }
    };
    loadZones();
  }, []);

  const filtered = accounts.filter(a => {
    const matchSearch = a.name?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || a.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openEditModal = (account) => {
    setEditForm({
      name: account.name || '',
      email: account.email || '',
      phone: account.phone || '',
      address: account.address || '',
      city: account.city || '',
      state: account.state || '',
      zip_code: account.zip_code || '',
      role: account.role || 'customer',
      delivery_zone_id: account.delivery_zone_id || '',
      is_farm_member: account.is_farm_member || false,
      is_active: account.is_active !== false,
      notes: account.notes || ''
    });
    setEditModal(account);
  };

  const closeEditModal = () => {
    setEditModal(null);
    setEditForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      role: 'customer',
      delivery_zone_id: '',
      is_farm_member: false,
      is_active: true,
      notes: ''
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const saveChanges = async () => {
    setEditLoading(true);
    try {
      await accountsService.update(editModal.id, editForm);
      closeEditModal();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to update account: ' + (err.response?.data?.message || err.message));
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header"><h1>Accounts</h1><p className="subtitle">Manage customers and staff</p></div>
      <div className="toolbar">
        <div className="search-box"><Icons.Search /><input type="text" placeholder="Search accounts..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option><option value="admin">Admin</option><option value="staff">Staff</option><option value="customer">Customer</option>
        </select>
      </div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Member</th><th>Zone</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (<tr><td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>Loading...</td></tr>) :
               filtered.length === 0 ? (<tr><td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#888'}}>No accounts found</td></tr>) :
               (filtered.map(account => (
                <tr key={account.id}>
                  <td><strong style={{cursor: 'pointer', color: '#1976d2'}} onClick={() => openEditModal(account)}>{account.name}</strong></td>
                  <td>{account.email}</td>
                  <td><span className={`badge ${account.role === 'admin' ? 'badge-blue' : account.role === 'staff' ? 'badge-yellow' : 'badge-gray'}`}>{account.role}</span></td>
                  <td>{account.is_farm_member && <span className="badge badge-green">Member</span>}</td>
                  <td>{account.delivery_zone_name || '—'}</td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{padding: '6px 12px', fontSize: 13}}
                      onClick={() => openEditModal(account)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Account Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" style={{maxWidth: 600}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Account</h2>
              <button className="modal-close" onClick={closeEditModal}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input 
                    type="email" 
                    value={editForm.email}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="text" 
                    value={editForm.phone}
                    onChange={(e) => handleEditChange('phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select 
                    value={editForm.role}
                    onChange={(e) => handleEditChange('role', e.target.value)}
                  >
                    <option value="customer">Customer</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input 
                  type="text" 
                  value={editForm.address}
                  onChange={(e) => handleEditChange('address', e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    value={editForm.city}
                    onChange={(e) => handleEditChange('city', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input 
                    type="text" 
                    value={editForm.state}
                    onChange={(e) => handleEditChange('state', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input 
                    type="text" 
                    value={editForm.zip_code}
                    onChange={(e) => handleEditChange('zip_code', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Delivery Zone</label>
                  <select 
                    value={editForm.delivery_zone_id}
                    onChange={(e) => handleEditChange('delivery_zone_id', e.target.value || null)}
                  >
                    <option value="">No Zone</option>
                    {deliveryZones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8}}>
                    <input 
                      type="checkbox" 
                      checked={editForm.is_farm_member}
                      onChange={(e) => handleEditChange('is_farm_member', e.target.checked)}
                    />
                    Farm Member
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'}}>
                    <input 
                      type="checkbox" 
                      checked={editForm.is_active}
                      onChange={(e) => handleEditChange('is_active', e.target.checked)}
                    />
                    Active Account
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea 
                  value={editForm.notes}
                  onChange={(e) => handleEditChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeEditModal}>Cancel</button>
              <button className="btn btn-primary" onClick={saveChanges} disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ITEMS VIEW
// ============================================================================
const ItemsView = ({ items, loading }) => {
  const [search, setSearch] = useState('');
  const filtered = items.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()) || i.sku?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header"><h1>Items</h1><p className="subtitle">Manage products and inventory</p></div>
      <div className="toolbar">
        <div className="search-box"><Icons.Search /><input type="text" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>SKU</th><th>Name</th><th>Type</th><th style={{textAlign: 'right'}}>Price</th><th style={{textAlign: 'right'}}>Stock</th></tr></thead>
            <tbody>
              {loading ? (<tr><td colSpan="5" style={{textAlign: 'center', padding: '40px'}}>Loading...</td></tr>) :
               filtered.length === 0 ? (<tr><td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#888'}}>No items found</td></tr>) :
               (filtered.map(item => (
                <tr key={item.id}>
                  <td><code>{item.sku}</code></td>
                  <td><strong>{item.name}</strong></td>
                  <td><span className="badge badge-gray">{item.item_type}</span></td>
                  <td style={{textAlign: 'right'}}>{formatCurrency(item.price)}</td>
                  <td style={{textAlign: 'right'}}>{item.item_type === 'inventory' ? (<span className={item.inventory_quantity === 0 ? 'badge badge-red' : item.inventory_quantity <= 5 ? 'badge badge-yellow' : ''}>{item.inventory_quantity}</span>) : '—'}</td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TRANSACTIONS VIEW
// ============================================================================
const TransactionsView = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [bankAccounts, setBankAccounts] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkBankAccount, setBulkBankAccount] = useState('');
  const [bulkClass, setBulkClass] = useState('');
  
  // Modal state for single transaction
  const [acceptModal, setAcceptModal] = useState(null);
  const [acceptForm, setAcceptForm] = useState({
    category_id: '',
    bank_account_id: '',
    class_id: '',
    description: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
    loadCategories();
    loadBankAccounts();
    loadClasses();
  }, []);

  useEffect(() => {
    loadData();
    setSelectedIds([]);
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      let data;
      switch (activeTab) {
        case 'pending':
          data = await transactionAcceptanceService.getPending(200, 0);
          break;
        case 'accepted':
          data = await transactionAcceptanceService.getAccepted({ limit: 200 });
          break;
        case 'excluded':
          data = await transactionAcceptanceService.getExcluded(200, 0);
          break;
        default:
          data = { data: [] };
      }
      setTransactions(data.data || []);
      
      const summaryData = await transactionAcceptanceService.getSummary();
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await accountingCategoriesService.getGrouped();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadBankAccounts = async () => {
    try {
      const data = await transactionAcceptanceService.getBankAccounts();
      setBankAccounts(data);
      if (data.length > 0) {
        setBulkBankAccount(data[0].id);
        setAcceptForm(prev => ({ ...prev, bank_account_id: data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load bank accounts:', err);
    }
  };

  const loadClasses = async () => {
    try {
      const data = await classesService.getAll();
      setClasses(data);
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  const openAcceptModal = (txn) => {
    const isIncome = parseFloat(txn.amount) > 0;
    setAcceptForm({
      category_id: '',
      bank_account_id: bankAccounts.length > 0 ? bankAccounts[0].id : '',
      class_id: '',
      description: txn.description || ''
    });
    setAcceptModal({ ...txn, isIncome });
  };

  const handleAccept = async () => {
    if (!acceptForm.category_id) {
      alert('Please select a category');
      return;
    }
    if (!acceptForm.bank_account_id) {
      alert('Please select a bank account');
      return;
    }
    
    setActionLoading(true);
    try {
      await transactionAcceptanceService.accept(acceptModal.id, acceptForm);
      setAcceptModal(null);
      loadData();
    } catch (err) {
      alert('Failed to accept: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleExclude = async (txn) => {
    const reason = window.prompt('Reason for excluding this transaction (optional):');
    if (reason === null) return;
    
    setActionLoading(true);
    try {
      await transactionAcceptanceService.exclude(txn.id, reason);
      loadData();
    } catch (err) {
      alert('Failed to exclude: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (txn) => {
    setActionLoading(true);
    try {
      await transactionAcceptanceService.restore(txn.id);
      loadData();
    } catch (err) {
      alert('Failed to restore: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnaccept = async (txn) => {
    if (!window.confirm('Unaccept this transaction? The journal entry will be voided.')) return;
    
    setActionLoading(true);
    try {
      await transactionAcceptanceService.unaccept(txn.id);
      loadData();
    } catch (err) {
      alert('Failed to unaccept: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map(t => t.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkAccept = async () => {
    if (selectedIds.length === 0) {
      alert('No transactions selected');
      return;
    }
    if (!bulkCategory) {
      alert('Please select a category');
      return;
    }
    if (!bulkBankAccount) {
      alert('Please select a bank account');
      return;
    }
    
    setActionLoading(true);
    try {
      const result = await transactionAcceptanceService.bulkAccept(
        selectedIds,
        bulkCategory,
        bulkBankAccount,
        bulkClass || null
      );
      alert(`Accepted: ${result.data.accepted}, Failed: ${result.data.failed}`);
      setSelectedIds([]);
      loadData();
    } catch (err) {
      alert('Bulk accept failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const fmtDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Transaction Review</h1>
        <p className="subtitle">Categorize and approve incoming transactions</p>
      </div>

      {summary && (
        <div style={{display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap'}}>
          <div style={{
            background: activeTab === 'pending' ? '#fff3e0' : '#f5f5f5',
            padding: '16px 24px',
            borderRadius: 8,
            cursor: 'pointer',
            border: activeTab === 'pending' ? '2px solid #ff9800' : '2px solid transparent',
            minWidth: 150
          }} onClick={() => setActiveTab('pending')}>
            <div style={{fontSize: 12, color: '#666', textTransform: 'uppercase'}}>Pending</div>
            <div style={{fontSize: 28, fontWeight: 600, color: '#ff9800'}}>{summary.pending?.count || 0}</div>
          </div>
          <div style={{
            background: activeTab === 'accepted' ? '#e8f5e9' : '#f5f5f5',
            padding: '16px 24px',
            borderRadius: 8,
            cursor: 'pointer',
            border: activeTab === 'accepted' ? '2px solid #4caf50' : '2px solid transparent',
            minWidth: 150
          }} onClick={() => setActiveTab('accepted')}>
            <div style={{fontSize: 12, color: '#666', textTransform: 'uppercase'}}>Accepted</div>
            <div style={{fontSize: 28, fontWeight: 600, color: '#4caf50'}}>{summary.accepted?.count || 0}</div>
          </div>
          <div style={{
            background: activeTab === 'excluded' ? '#ffebee' : '#f5f5f5',
            padding: '16px 24px',
            borderRadius: 8,
            cursor: 'pointer',
            border: activeTab === 'excluded' ? '2px solid #f44336' : '2px solid transparent',
            minWidth: 150
          }} onClick={() => setActiveTab('excluded')}>
            <div style={{fontSize: 12, color: '#666', textTransform: 'uppercase'}}>Excluded</div>
            <div style={{fontSize: 28, fontWeight: 600, color: '#f44336'}}>{summary.excluded?.count || 0}</div>
          </div>
        </div>
      )}

      {activeTab === 'pending' && transactions.length > 0 && (
        <div className="card" style={{marginBottom: 16, padding: 16}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <input 
                type="checkbox" 
                checked={selectedIds.length === transactions.length && transactions.length > 0}
                onChange={toggleSelectAll}
              />
              Select All ({selectedIds.length} selected)
            </label>
            
            <select 
              value={bulkCategory} 
              onChange={(e) => setBulkCategory(e.target.value)}
              style={{padding: '8px 12px', minWidth: 200}}
            >
              <option value="">-- Select Category --</option>
              <optgroup label="Income">
                {categories.income?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
              <optgroup label="Expense">
                {categories.expense?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
            </select>
            
            <select 
              value={bulkBankAccount} 
              onChange={(e) => setBulkBankAccount(e.target.value)}
              style={{padding: '8px 12px', minWidth: 180}}
            >
              <option value="">-- Bank Account --</option>
              {bankAccounts.map(ba => (
                <option key={ba.id} value={ba.id}>{ba.name}</option>
              ))}
            </select>
            
            <select 
              value={bulkClass} 
              onChange={(e) => setBulkClass(e.target.value)}
              style={{padding: '8px 12px', minWidth: 150}}
            >
              <option value="">-- Class (optional) --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            
            <button 
              className="btn btn-primary" 
              onClick={handleBulkAccept}
              disabled={selectedIds.length === 0 || actionLoading}
            >
              Accept Selected
            </button>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div style={{textAlign: 'center', padding: 40}}>
            <Icons.Loader />
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{textAlign: 'center', padding: 40, color: '#888'}}>
            <p>No {activeTab} transactions found.</p>
          </div>
        ) : (
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f5f5f5'}}>
                {activeTab === 'pending' && (
                  <th style={{padding: 12, textAlign: 'center', width: 40}}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === transactions.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                <th style={{padding: 12, textAlign: 'left'}}>Date</th>
                <th style={{padding: 12, textAlign: 'left'}}>Description</th>
                <th style={{padding: 12, textAlign: 'right'}}>Amount</th>
                {activeTab !== 'pending' && (
                  <th style={{padding: 12, textAlign: 'left'}}>Category</th>
                )}
                {activeTab === 'accepted' && (
                  <th style={{padding: 12, textAlign: 'left'}}>Class</th>
                )}
                <th style={{padding: 12, textAlign: 'center', width: 150}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(txn => {
                const amount = parseFloat(txn.amount) || 0;
                const isIncome = amount > 0;
                
                return (
                  <tr key={txn.id} style={{borderBottom: '1px solid #eee'}}>
                    {activeTab === 'pending' && (
                      <td style={{padding: 12, textAlign: 'center'}}>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(txn.id)}
                          onChange={() => toggleSelect(txn.id)}
                        />
                      </td>
                    )}
                    <td style={{padding: 12}}>{fmtDate(txn.date)}</td>
                    <td style={{padding: 12}}>
                      <div>{txn.description || '-'}</div>
                      {txn.reference && (
                        <div style={{fontSize: 11, color: '#888'}}>Ref: {txn.reference}</div>
                      )}
                    </td>
                    <td style={{
                      padding: 12, 
                      textAlign: 'right', 
                      fontWeight: 600,
                      color: isIncome ? '#2e7d32' : '#c62828'
                    }}>
                      {isIncome ? '+' : ''}{formatCurrency(amount)}
                    </td>
                    {activeTab !== 'pending' && (
                      <td style={{padding: 12}}>
                        {txn.category_name ? (
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 12,
                            background: txn.category_type === 'income' ? '#e8f5e9' : '#ffebee',
                            color: txn.category_type === 'income' ? '#2e7d32' : '#c62828'
                          }}>
                            {txn.category_name}
                          </span>
                        ) : '-'}
                      </td>
                    )}
                    {activeTab === 'accepted' && (
                      <td style={{padding: 12}}>
                        {txn.class_name || '-'}
                      </td>
                    )}
                    <td style={{padding: 12, textAlign: 'center'}}>
                      {activeTab === 'pending' && (
                        <>
                          <button 
                            className="btn btn-primary" 
                            style={{padding: '6px 12px', fontSize: 12, marginRight: 8}}
                            onClick={() => openAcceptModal(txn)}
                          >
                            Categorize
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{padding: '6px 12px', fontSize: 12}}
                            onClick={() => handleExclude(txn)}
                          >
                            Exclude
                          </button>
                        </>
                      )}
                      {activeTab === 'accepted' && (
                        <button 
                          className="btn btn-secondary" 
                          style={{padding: '6px 12px', fontSize: 12}}
                          onClick={() => handleUnaccept(txn)}
                        >
                          Unaccept
                        </button>
                      )}
                      {activeTab === 'excluded' && (
                        <button 
                          className="btn btn-secondary" 
                          style={{padding: '6px 12px', fontSize: 12}}
                          onClick={() => handleRestore(txn)}
                        >
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {acceptModal && (
        <div className="modal-overlay" onClick={() => setAcceptModal(null)}>
          <div className="modal-content" style={{maxWidth: 500}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Categorize Transaction</h2>
              <button className="modal-close" onClick={() => setAcceptModal(null)}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <div style={{
                background: '#f5f5f5', 
                padding: 16, 
                borderRadius: 8, 
                marginBottom: 20
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
                  <span style={{color: '#666'}}>Date:</span>
                  <span>{fmtDate(acceptModal.date)}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
                  <span style={{color: '#666'}}>Amount:</span>
                  <span style={{
                    fontWeight: 600,
                    color: acceptModal.isIncome ? '#2e7d32' : '#c62828'
                  }}>
                    {formatCurrency(acceptModal.amount)}
                  </span>
                </div>
                <div>
                  <span style={{color: '#666'}}>Description:</span>
                  <div style={{marginTop: 4}}>{acceptModal.description || '-'}</div>
                </div>
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select 
                  value={acceptForm.category_id}
                  onChange={(e) => setAcceptForm({...acceptForm, category_id: e.target.value})}
                  required
                >
                  <option value="">-- Select Category --</option>
                  {acceptModal.isIncome ? (
                    <optgroup label="Income">
                      {categories.income?.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </optgroup>
                  ) : (
                    <optgroup label="Expense">
                      {categories.expense?.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </optgroup>
                  )}
                  {!acceptModal.isIncome ? (
                    <optgroup label="Income (if deposit)">
                      {categories.income?.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </optgroup>
                  ) : (
                    <optgroup label="Expense (if withdrawal)">
                      {categories.expense?.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Bank Account *</label>
                <select 
                  value={acceptForm.bank_account_id}
                  onChange={(e) => setAcceptForm({...acceptForm, bank_account_id: e.target.value})}
                  required
                >
                  <option value="">-- Select Bank Account --</option>
                  {bankAccounts.map(ba => (
                    <option key={ba.id} value={ba.id}>
                      {ba.name} ({formatCurrency(ba.current_balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Class (optional)</label>
                <select 
                  value={acceptForm.class_id}
                  onChange={(e) => setAcceptForm({...acceptForm, class_id: e.target.value})}
                >
                  <option value="">-- No Class --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text"
                  value={acceptForm.description}
                  onChange={(e) => setAcceptForm({...acceptForm, description: e.target.value})}
                  placeholder="Optional: override description"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setAcceptModal(null)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleAccept}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Accept & Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ACCOUNTING CATEGORIES VIEW (Income/Expense Categories)
// ============================================================================
const AccountingCategoriesView = () => {
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    code: '',
    description: '',
    sort_order: 0
  });
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await accountingCategoriesService.getGrouped();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (type = 'expense') => {
    setEditCategory(null);
    setFormData({
      name: '',
      type: type,
      code: '',
      description: '',
      sort_order: 0
    });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      code: category.code || '',
      description: category.description || '',
      sort_order: category.sort_order || 0
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditCategory(null);
    setFormData({
      name: '',
      type: 'expense',
      code: '',
      description: '',
      sort_order: 0
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    setSaveLoading(true);
    try {
      if (editCategory) {
        await accountingCategoriesService.update(editCategory.id, formData);
      } else {
        await accountingCategoriesService.create(formData);
      }
      closeModal();
      loadCategories();
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete "${category.name}"? This cannot be undone if there are no transactions using it.`)) {
      return;
    }
    
    try {
      await accountingCategoriesService.delete(category.id);
      loadCategories();
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };

  const renderCategoryList = (type, categoryList) => (
    <div className="card" style={{marginBottom: 24}}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: type === 'income' ? '#e8f5e9' : '#ffebee'
      }}>
        <h3 style={{margin: 0, color: type === 'income' ? '#2e7d32' : '#c62828'}}>
          {type === 'income' ? 'Income Categories' : 'Expense Categories'}
        </h3>
        <button 
          className="btn btn-secondary" 
          style={{padding: '6px 12px', fontSize: 13}}
          onClick={() => openAddModal(type)}
        >
          <Icons.Plus /> Add
        </button>
      </div>
      
      {categoryList.length === 0 ? (
        <div style={{padding: 20, textAlign: 'center', color: '#888'}}>
          No {type} categories yet.
        </div>
      ) : (
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#fafafa'}}>
              <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase'}}>Code</th>
              <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase'}}>Name</th>
              <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase'}}>Description</th>
              <th style={{padding: '10px 16px', textAlign: 'center', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', width: 100}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categoryList.map(cat => (
              <tr key={cat.id} style={{borderBottom: '1px solid #eee'}}>
                <td style={{padding: '12px 16px', fontFamily: 'monospace', color: '#666'}}>
                  {cat.code || '-'}
                </td>
                <td style={{padding: '12px 16px', fontWeight: 500}}>
                  {cat.name}
                </td>
                <td style={{padding: '12px 16px', color: '#666', fontSize: 13}}>
                  {cat.description || '-'}
                </td>
                <td style={{padding: '12px 16px', textAlign: 'center'}}>
                  <button 
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1976d2',
                      cursor: 'pointer',
                      marginRight: 12
                    }}
                    onClick={() => openEditModal(cat)}
                    title="Edit"
                  >
                    <Icons.Edit />
                  </button>
                  <button 
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#c62828',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleDelete(cat)}
                    title="Delete"
                  >
                    <Icons.Trash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Categories</h1>
        <p className="subtitle">Manage income and expense categories for transaction classification</p>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: 40}}>
          <Icons.Loader />
          <p>Loading categories...</p>
        </div>
      ) : (
        <>
          {renderCategoryList('income', categories.income || [])}
          {renderCategoryList('expense', categories.expense || [])}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" style={{maxWidth: 450}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button className="modal-close" onClick={closeModal}><Icons.X /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    disabled={!!editCategory}
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Name *</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Feed & Supplements"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Code (optional)</label>
                  <input 
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="e.g., EXP-100"
                  />
                </div>
                
                <div className="form-group">
                  <label>Description (optional)</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={2}
                    placeholder="What this category is used for..."
                  />
                </div>
                
                <div className="form-group">
                  <label>Sort Order</label>
                  <input 
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                  <small style={{color: '#888'}}>Lower numbers appear first</small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saveLoading}>
                  {saveLoading ? 'Saving...' : (editCategory ? 'Save Changes' : 'Create Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DELIVERY ZONES VIEW
// ============================================================================
const DeliveryZonesView = ({ zones, loading }) => {
  return (
    <div>
      <div className="page-header"><h1>Delivery Zones</h1><p className="subtitle">Manage delivery areas and schedules</p></div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Zone</th><th>Base City</th><th>Schedule</th><th>Radius</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? (<tr><td colSpan="5" style={{textAlign: 'center', padding: '40px'}}>Loading...</td></tr>) :
               zones.length === 0 ? (<tr><td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#888'}}>No zones configured</td></tr>) :
               (zones.map(zone => (
                <tr key={zone.id}>
                  <td><strong>{zone.name}</strong></td>
                  <td>{zone.base_city}</td>
                  <td>{zone.schedule}</td>
                  <td>{zone.radius_miles} miles</td>
                  <td><span className={`badge ${zone.is_active ? 'badge-green' : 'badge-gray'}`}>{zone.is_active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FINANCIAL REPORTS VIEW
// ============================================================================

const ReportsView = () => {
  const [reportType, setReportType] = useState('income_statement');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-01-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Drill-down state
  const [drillDownAccount, setDrillDownAccount] = useState(null);
  const [drillDownData, setDrillDownData] = useState(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);

  // Edit account modal state
  const [editAccountModal, setEditAccountModal] = useState(null);
  const [editAccountLoading, setEditAccountLoading] = useState(false);
  const [editAccountForm, setEditAccountForm] = useState({
    account_code: '',
    name: '',
    account_type: '',
    account_subtype: '',
    normal_balance: '',
    is_active: true,
    description: ''
  });

  // Account type options
  const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
  const accountSubtypes = {
    asset: ['cash', 'bank', 'accounts_receivable', 'inventory', 'fixed_asset', 'other_asset'],
    liability: ['accounts_payable', 'credit_card', 'current_liability', 'long_term_liability'],
    equity: ['owners_equity', 'retained_earnings'],
    revenue: ['sales', 'other_income'],
    expense: ['cost_of_goods', 'operating_expense', 'other_expense']
  };

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setReportData(null);
    setDrillDownAccount(null);
    setDrillDownData(null);
    try {
      let data;
      switch (reportType) {
        case 'income_statement':
          data = await reportsService.getIncomeStatement(startDate, endDate);
          break;
        case 'balance_sheet':
          data = await reportsService.getBalanceSheet(endDate);
          break;
        case 'sales_by_customer':
          data = await reportsService.getSalesByCustomer(startDate, endDate, 100);
          break;
        case 'sales_by_class':
          data = await reportsService.getSalesByClass(startDate, endDate);
          break;
        default:
          throw new Error('Unknown report type');
      }
      setReportData(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountClick = async (account) => {
    setDrillDownAccount(account);
    setDrillDownLoading(true);
    setDrillDownData(null);
    try {
      const data = await reportsService.getAccountTransactions(
        account.account_id,
        reportType === 'balance_sheet' ? null : startDate,
        endDate
      );
      setDrillDownData(data);
    } catch (err) {
      console.error('Failed to load account transactions:', err);
    } finally {
      setDrillDownLoading(false);
    }
  };

  const closeDrillDown = () => {
    setDrillDownAccount(null);
    setDrillDownData(null);
  };

  // Edit account handlers
  const openEditAccountModal = (account) => {
    console.log('openEditAccountModal called with:', account);
    setEditAccountForm({
      account_code: account.account_code || '',
      name: account.account_name || account.name || '',
      account_type: account.account_type || '',
      account_subtype: account.account_subtype || '',
      normal_balance: account.normal_balance || 'debit',
      is_active: account.is_active !== false,
      description: account.description || ''
    });
    setEditAccountModal(account);
    console.log('editAccountModal set to:', account);
  };

  const closeEditAccountModal = () => {
    setEditAccountModal(null);
    setEditAccountForm({
      account_code: '',
      name: '',
      account_type: '',
      account_subtype: '',
      normal_balance: '',
      is_active: true,
      description: ''
    });
  };

  const handleEditAccountChange = (field, value) => {
    setEditAccountForm(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-update normal_balance when account_type changes
      if (field === 'account_type') {
        if (value === 'asset' || value === 'expense') {
          updated.normal_balance = 'debit';
        } else {
          updated.normal_balance = 'credit';
        }
        // Reset subtype when type changes
        updated.account_subtype = '';
      }
      return updated;
    });
  };

  const saveAccountChanges = async () => {
    setEditAccountLoading(true);
    try {
      await accountingService.updateAccount(editAccountModal.account_id || editAccountModal.id, editAccountForm);
      closeEditAccountModal();
      // Refresh the report
      generateReport();
    } catch (err) {
      alert('Failed to update account: ' + (err.response?.data?.message || err.message));
    } finally {
      setEditAccountLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  const renderIncomeStatement = () => {
    if (!reportData) return null;
    return (
      <div className="report-output">
        <div className="report-header-print">
          <h2>Income Statement</h2>
          <p>{formatDate(reportData.start_date)} - {formatDate(reportData.end_date)}</p>
        </div>
        
        <div className="report-section">
          <h3 style={{color: '#2e7d32', borderBottom: '2px solid #2e7d32', paddingBottom: 8}}>Revenue</h3>
          <table className="report-table">
            <thead><tr><th>Account</th><th>Code</th><th style={{textAlign: 'right'}}>Amount</th></tr></thead>
            <tbody>
              {reportData.revenue.accounts.map(acc => (
                <tr key={acc.account_id}>
                  <td 
                    style={{cursor: 'pointer', color: '#1976d2'}} 
                    onClick={() => openEditAccountModal(acc)}
                    title="Click to edit account"
                  >
                    {acc.account_name}
                  </td>
                  <td 
                    style={{color: '#888', cursor: 'pointer'}}
                    onClick={() => openEditAccountModal(acc)}
                    title="Click to edit account"
                  >
                    {acc.account_code}
                  </td>
                  <td 
                    style={{textAlign: 'right', cursor: 'pointer', color: '#1565c0', textDecoration: 'underline'}} 
                    onClick={() => handleAccountClick(acc)}
                    title="Click to view transactions"
                  >
                    {formatCurrency(acc.balance)}
                  </td>
                </tr>
              ))}
              <tr className="subtotal-row">
                <td colSpan="2"><strong>Total Revenue</strong></td>
                <td style={{textAlign: 'right'}}><strong>{formatCurrency(reportData.revenue.total)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h3 style={{color: '#c62828', borderBottom: '2px solid #c62828', paddingBottom: 8}}>Expenses</h3>
          <table className="report-table">
            <thead><tr><th>Account</th><th>Code</th><th style={{textAlign: 'right'}}>Amount</th></tr></thead>
            <tbody>
              {reportData.expenses.accounts.map(acc => (
                <tr key={acc.account_id}>
                  <td 
                    style={{cursor: 'pointer', color: '#1976d2'}} 
                    onClick={() => openEditAccountModal(acc)}
                    title="Click to edit account"
                  >
                    {acc.account_name}
                  </td>
                  <td 
                    style={{color: '#888', cursor: 'pointer'}}
                    onClick={() => openEditAccountModal(acc)}
                    title="Click to edit account"
                  >
                    {acc.account_code}
                  </td>
                  <td 
                    style={{textAlign: 'right', cursor: 'pointer', color: '#1565c0', textDecoration: 'underline'}} 
                    onClick={() => handleAccountClick(acc)}
                    title="Click to view transactions"
                  >
                    {formatCurrency(acc.balance)}
                  </td>
                </tr>
              ))}
              <tr className="subtotal-row">
                <td colSpan="2"><strong>Total Expenses</strong></td>
                <td style={{textAlign: 'right'}}><strong>{formatCurrency(reportData.expenses.total)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-total" style={{
          background: reportData.net_income >= 0 ? '#e8f5e9' : '#ffebee',
          padding: 20, borderRadius: 8, marginTop: 20, textAlign: 'center'
        }}>
          <h2 style={{margin: 0, color: reportData.net_income >= 0 ? '#2e7d32' : '#c62828'}}>
            Net {reportData.net_income >= 0 ? 'Income' : 'Loss'}: {formatCurrency(Math.abs(reportData.net_income))}
          </h2>
        </div>
      </div>
    );
  };

  const renderBalanceSheet = () => {
    if (!reportData) return null;
    return (
      <div className="report-output">
        <div className="report-header-print">
          <h2>Balance Sheet</h2>
          <p>As of {formatDate(reportData.as_of_date)}</p>
        </div>
        
        <div className="report-section">
          <h3 style={{color: '#1565c0', borderBottom: '2px solid #1565c0', paddingBottom: 8}}>Assets</h3>
          <table className="report-table">
            <thead><tr><th>Account</th><th>Code</th><th style={{textAlign: 'right'}}>Balance</th></tr></thead>
            <tbody>
              {reportData.assets.accounts.map(acc => (
                <tr key={acc.account_id}>
                  <td 
                    style={{cursor: 'pointer', color: '#1976d2'}} 
                    onClick={() => openEditAccountModal(acc)}
                    title="Click to edit account"
                  >
                    {acc.account_name}
                  </td>
                  <td 
                    style={{color: '#888', cursor: 'pointer'}}
                    onClick={() => openEditAccountModal(acc)}
                    title="Click to edit account"
                  >
                    {acc.account_code}
                  </td>
                  <td 
                    style={{textAlign: 'right', cursor: 'pointer', color: '#1565c0', textDecoration: 'underline'}} 
                    onClick={() => handleAccountClick(acc)}
                    title="Click to view transactions"
                  >
                    {formatCurrency(acc.balance)}
                  </td>
                </tr>
              ))}
              <tr className="subtotal-row">
                <td colSpan="2"><strong>Total Assets</strong></td>
                <td style={{textAlign: 'right'}}><strong>{formatCurrency(reportData.assets.total)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h3 style={{color: '#d84315', borderBottom: '2px solid #d84315', paddingBottom: 8}}>Liabilities</h3>
          <table className="report-table">
            <thead><tr><th>Account</th><th>Code</th><th style={{textAlign: 'right'}}>Balance</th></tr></thead>
            <tbody>
              {reportData.liabilities.accounts.map(acc => (
                <tr key={acc.account_id}>
                  <td 
                    style={{cursor: 'pointer', color: '#1976d2'}} 
                    onClick={() => openEditAccountModal(acc)}
                    title="Click to edit account"
                  >
                    {acc.account_name}
                  </td>
                  <td 
                    style={{color: '#888', cursor: 'pointer'}}
                    onClick={() => openEditAccountModal(acc)}
                    title="Click to edit account"
                  >
                    {acc.account_code}
                  </td>
                  <td 
                    style={{textAlign: 'right', cursor: 'pointer', color: '#1565c0', textDecoration: 'underline'}} 
                    onClick={() => handleAccountClick(acc)}
                    title="Click to view transactions"
                  >
                    {formatCurrency(acc.balance)}
                  </td>
                </tr>
              ))}
              <tr className="subtotal-row">
                <td colSpan="2"><strong>Total Liabilities</strong></td>
                <td style={{textAlign: 'right'}}><strong>{formatCurrency(reportData.liabilities.total)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h3 style={{color: '#6a1b9a', borderBottom: '2px solid #6a1b9a', paddingBottom: 8}}>Equity</h3>
          <table className="report-table">
            <thead><tr><th>Account</th><th>Code</th><th style={{textAlign: 'right'}}>Balance</th></tr></thead>
            <tbody>
              {reportData.equity.accounts.map(acc => (
                <tr key={acc.account_id}>
                  <td 
                    style={{cursor: 'pointer', color: '#1976d2'}} 
                    onClick={() => openEditAccountModal(acc)}
                    title="Click to edit account"
                  >
                    {acc.account_name}
                  </td>
                  <td 
                    style={{color: '#888', cursor: 'pointer'}}
                    onClick={() => openEditAccountModal(acc)}
                    title="Click to edit account"
                  >
                    {acc.account_code}
                  </td>
                  <td 
                    style={{textAlign: 'right', cursor: 'pointer', color: '#1565c0', textDecoration: 'underline'}} 
                    onClick={() => handleAccountClick(acc)}
                    title="Click to view transactions"
                  >
                    {formatCurrency(acc.balance)}
                  </td>
                </tr>
              ))}
              {reportData.equity.retained_earnings_adjustment !== 0 && (
                <tr>
                  <td><em>Retained Earnings (calculated)</em></td>
                  <td style={{color: '#888'}}>-</td>
                  <td style={{textAlign: 'right'}}><em>{formatCurrency(reportData.equity.retained_earnings_adjustment)}</em></td>
                </tr>
              )}
              <tr className="subtotal-row">
                <td colSpan="2"><strong>Total Equity</strong></td>
                <td style={{textAlign: 'right'}}><strong>{formatCurrency(reportData.equity.total + reportData.equity.retained_earnings_adjustment)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-total" style={{
          background: '#e3f2fd', padding: 20, borderRadius: 8, marginTop: 20
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <strong>Total Liabilities & Equity:</strong><br/>
              <span style={{fontSize: 24}}>{formatCurrency(reportData.total_liabilities_and_equity)}</span>
            </div>
            <div style={{
              padding: '8px 16px', borderRadius: 20,
              background: reportData.is_balanced ? '#c8e6c9' : '#ffcdd2',
              color: reportData.is_balanced ? '#2e7d32' : '#c62828'
            }}>
              {reportData.is_balanced ? '✓ Balanced' : '⚠ Unbalanced'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSalesByCustomer = () => {
    if (!reportData) return null;
    return (
      <div className="report-output">
        <div className="report-header-print">
          <h2>Sales by Customer</h2>
          <p>{formatDate(reportData.start_date)} - {formatDate(reportData.end_date)}</p>
        </div>
        
        <div className="report-section">
          <table className="report-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th style={{textAlign: 'center'}}>Transactions</th>
                <th style={{textAlign: 'right'}}>Total Sales</th>
                <th style={{textAlign: 'right'}}>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {reportData.customers.map((cust, idx) => (
                <tr key={idx}>
                  <td><strong>{cust.customer_name}</strong></td>
                  <td style={{textAlign: 'center'}}>{cust.transaction_count}</td>
                  <td style={{textAlign: 'right'}}>{formatCurrency(cust.total_amount)}</td>
                  <td style={{textAlign: 'right'}}>{cust.percentage}%</td>
                </tr>
              ))}
              <tr className="subtotal-row">
                <td><strong>Total</strong></td>
                <td style={{textAlign: 'center'}}><strong>{reportData.customers.reduce((s, c) => s + parseInt(c.transaction_count), 0)}</strong></td>
                <td style={{textAlign: 'right'}}><strong>{formatCurrency(reportData.total_sales)}</strong></td>
                <td style={{textAlign: 'right'}}><strong>100%</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSalesByClass = () => {
    if (!reportData) return null;
    return (
      <div className="report-output">
        <div className="report-header-print">
          <h2>Sales by Class</h2>
          <p>{formatDate(reportData.start_date)} - {formatDate(reportData.end_date)}</p>
        </div>
        
        <div className="report-section">
          <table className="report-table">
            <thead>
              <tr>
                <th>Class/Category</th>
                <th>Account Code</th>
                <th style={{textAlign: 'center'}}>Transactions</th>
                <th style={{textAlign: 'right'}}>Total Sales</th>
                <th style={{textAlign: 'right'}}>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {reportData.classes.map((cls, idx) => (
                <tr key={idx}>
                  <td><strong>{cls.class_name}</strong></td>
                  <td style={{color: '#888'}}>{cls.account_code}</td>
                  <td style={{textAlign: 'center'}}>{cls.transaction_count}</td>
                  <td style={{textAlign: 'right'}}>{formatCurrency(cls.total_amount)}</td>
                  <td style={{textAlign: 'right'}}>{cls.percentage}%</td>
                </tr>
              ))}
              <tr className="subtotal-row">
                <td colSpan="2"><strong>Total</strong></td>
                <td style={{textAlign: 'center'}}><strong>{reportData.classes.reduce((s, c) => s + parseInt(c.transaction_count), 0)}</strong></td>
                <td style={{textAlign: 'right'}}><strong>{formatCurrency(reportData.total_sales)}</strong></td>
                <td style={{textAlign: 'right'}}><strong>100%</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReport = () => {
    switch (reportType) {
      case 'income_statement': return renderIncomeStatement();
      case 'balance_sheet': return renderBalanceSheet();
      case 'sales_by_customer': return renderSalesByCustomer();
      case 'sales_by_class': return renderSalesByClass();
      default: return null;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Financial Reports</h1>
        <p className="subtitle">Generate income statements, balance sheets, and sales reports</p>
      </div>

      <div className="card" style={{marginBottom: 20}}>
        <div className="card-body">
          <div className="form-row" style={{display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end'}}>
            <div className="form-group" style={{minWidth: 200}}>
              <label>Report Type</label>
              <select value={reportType} onChange={(e) => { setReportType(e.target.value); setReportData(null); }}>
                <option value="income_statement">Income Statement (P&L)</option>
                <option value="balance_sheet">Balance Sheet</option>
                <option value="sales_by_customer">Sales by Customer</option>
                <option value="sales_by_class">Sales by Class</option>
              </select>
            </div>
            
            {reportType !== 'balance_sheet' && (
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
            )}
            
            <div className="form-group">
              <label>{reportType === 'balance_sheet' ? 'As of Date' : 'End Date'}</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <button className="btn btn-primary" onClick={generateReport} disabled={loading} style={{height: 42}}>
              {loading ? 'Generating...' : 'Generate Report'}
            </button>

            {reportData && (
              <>
                <button className="btn btn-secondary" onClick={() => window.print()} style={{height: 42}}>
                  Print Report
                </button>
                <button className="btn btn-secondary" onClick={() => {
                  if (reportType === 'income_statement') {
                    reportsService.exportIncomeStatementCSV(startDate, endDate);
                  } else if (reportType === 'balance_sheet') {
                    reportsService.exportBalanceSheetCSV(endDate);
                  } else if (reportType === 'sales_by_customer') {
                    reportsService.exportSalesByCustomerCSV(startDate, endDate);
                  } else if (reportType === 'sales_by_class') {
                    reportsService.exportSalesByClassCSV(startDate, endDate);
                  }
                }} style={{height: 42}}>
                  Export CSV
                </button>
              </>
            )}
          </div>

          <div style={{marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap'}}>
            <button className="btn btn-secondary" style={{padding: '6px 12px', fontSize: 13}}
              onClick={() => { const d = new Date(); setStartDate(`${d.getFullYear()}-01-01`); setEndDate(d.toISOString().split('T')[0]); }}>
              YTD
            </button>
            <button className="btn btn-secondary" style={{padding: '6px 12px', fontSize: 13}}
              onClick={() => { const d = new Date(); setStartDate(`${d.getFullYear()-1}-01-01`); setEndDate(`${d.getFullYear()-1}-12-31`); }}>
              Last Year
            </button>
            <button className="btn btn-secondary" style={{padding: '6px 12px', fontSize: 13}}
              onClick={() => { const d = new Date(); const m = d.getMonth(); const y = d.getFullYear(); setStartDate(`${y}-${String(m+1).padStart(2,'0')}-01`); setEndDate(d.toISOString().split('T')[0]); }}>
              This Month
            </button>
            <button className="btn btn-secondary" style={{padding: '6px 12px', fontSize: 13}}
              onClick={() => { const d = new Date(); d.setMonth(d.getMonth()-1); const m = d.getMonth(); const y = d.getFullYear(); const lastDay = new Date(y, m+1, 0).getDate(); setStartDate(`${y}-${String(m+1).padStart(2,'0')}-01`); setEndDate(`${y}-${String(m+1).padStart(2,'0')}-${lastDay}`); }}>
              Last Month
            </button>
            <button className="btn btn-secondary" style={{padding: '6px 12px', fontSize: 13}}
              onClick={() => { const q = Math.floor(new Date().getMonth()/3); const y = new Date().getFullYear(); const qs = q*3; setStartDate(`${y}-${String(qs+1).padStart(2,'0')}-01`); const qe = new Date(y, qs+3, 0); setEndDate(qe.toISOString().split('T')[0]); }}>
              This Quarter
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{background: '#ffebee', border: '1px solid #ef5350', marginBottom: 20}}>
          <div className="card-body" style={{color: '#c62828'}}>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {loading && (
        <div className="card">
          <div className="card-body" style={{textAlign: 'center', padding: 60}}>
            <Icons.Loader />
            <p>Generating report...</p>
          </div>
        </div>
      )}

      {reportData && !loading && (
        <div className="card">
          <div className="card-body">
            {renderReport()}
          </div>
        </div>
      )}

      {/* Drill-Down Modal */}
      {drillDownAccount && (
        <div className="modal-overlay" onClick={closeDrillDown}>
          <div className="modal-content drill-down-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {drillDownAccount.account_name}
                <span style={{fontSize: 14, color: '#888', marginLeft: 12}}>({drillDownAccount.account_code})</span>
              </h2>
              <button className="modal-close" onClick={closeDrillDown}><Icons.X /></button>
            </div>
            <div className="modal-body">
              {drillDownLoading ? (
                <div style={{textAlign: 'center', padding: 40}}>
                  <p>Loading transactions...</p>
                </div>
              ) : drillDownData ? (
                <>
                  <div className="drill-down-summary">
                    <div className="summary-item">
                      <span className="label">Transactions</span>
                      <span className="value">{drillDownData.transaction_count}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Total Debits</span>
                      <span className="value">{formatCurrency(drillDownData.total_debits)}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Total Credits</span>
                      <span className="value">{formatCurrency(drillDownData.total_credits)}</span>
                    </div>
                    <div className="summary-item highlight">
                      <span className="label">Ending Balance</span>
                      <span className="value">{formatCurrency(drillDownData.ending_balance)}</span>
                    </div>
                  </div>
                  
                  {drillDownData.start_date && (
                    <p style={{color: '#666', marginBottom: 16}}>
                      Period: {formatDate(drillDownData.start_date)} - {formatDate(drillDownData.end_date)}
                    </p>
                  )}
                  {!drillDownData.start_date && drillDownData.end_date && (
                    <p style={{color: '#666', marginBottom: 16}}>
                      All transactions through {formatDate(drillDownData.end_date)}
                    </p>
                  )}

                  <div className="table-container" style={{maxHeight: 400, overflowY: 'auto'}}>
                    <table className="drill-down-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Reference</th>
                          <th>Description</th>
                          <th style={{textAlign: 'right'}}>Debit</th>
                          <th style={{textAlign: 'right'}}>Credit</th>
                          <th style={{textAlign: 'right'}}>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drillDownData.transactions.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{textAlign: 'center', padding: 20, color: '#888'}}>
                              No transactions found for this period
                            </td>
                          </tr>
                        ) : (
                          drillDownData.transactions.map((txn, idx) => (
                            <tr key={idx}>
                              <td style={{whiteSpace: 'nowrap'}}>{new Date(txn.entry_date).toLocaleDateString()}</td>
                              <td style={{fontSize: 12, color: '#666'}}>{txn.entry_number}</td>
                              <td style={{maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={txn.entry_description}>
                                {txn.line_description || txn.entry_description}
                              </td>
                              <td style={{textAlign: 'right', color: txn.debit > 0 ? '#1565c0' : '#ccc'}}>
                                {txn.debit > 0 ? formatCurrency(txn.debit) : '-'}
                              </td>
                              <td style={{textAlign: 'right', color: txn.credit > 0 ? '#c62828' : '#ccc'}}>
                                {txn.credit > 0 ? formatCurrency(txn.credit) : '-'}
                              </td>
                              <td style={{textAlign: 'right', fontWeight: 500}}>
                                {formatCurrency(txn.running_balance)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p style={{color: '#888'}}>Failed to load transactions</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {editAccountModal && (
        <div className="modal-overlay" onClick={closeEditAccountModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 500}}>
            <div className="modal-header">
              <h2>Edit Account</h2>
              <button className="modal-close" onClick={closeEditAccountModal}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <div>
                  <label style={{display: 'block', marginBottom: 4, fontWeight: 500}}>Account Code</label>
                  <input 
                    type="text" 
                    value={editAccountForm.account_code}
                    onChange={(e) => handleEditAccountChange('account_code', e.target.value)}
                    className="form-control"
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: 4, fontWeight: 500}}>Account Name</label>
                  <input 
                    type="text" 
                    value={editAccountForm.name}
                    onChange={(e) => handleEditAccountChange('name', e.target.value)}
                    className="form-control"
                  />
                </div>
                <div style={{display: 'flex', gap: 12}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: 4, fontWeight: 500}}>Account Type</label>
                    <select 
                      value={editAccountForm.account_type}
                      onChange={(e) => handleEditAccountChange('account_type', e.target.value)}
                      className="form-control"
                    >
                      <option value="">Select Type</option>
                      {accountTypes.map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: 4, fontWeight: 500}}>Subtype</label>
                    <select 
                      value={editAccountForm.account_subtype}
                      onChange={(e) => handleEditAccountChange('account_subtype', e.target.value)}
                      className="form-control"
                      disabled={!editAccountForm.account_type}
                    >
                      <option value="">Select Subtype</option>
                      {editAccountForm.account_type && accountSubtypes[editAccountForm.account_type]?.map(st => (
                        <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{display: 'flex', gap: 12}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: 4, fontWeight: 500}}>Normal Balance</label>
                    <select 
                      value={editAccountForm.normal_balance}
                      onChange={(e) => handleEditAccountChange('normal_balance', e.target.value)}
                      className="form-control"
                    >
                      <option value="debit">Debit</option>
                      <option value="credit">Credit</option>
                    </select>
                  </div>
                  <div style={{flex: 1, display: 'flex', alignItems: 'center', paddingTop: 20}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'}}>
                      <input 
                        type="checkbox" 
                        checked={editAccountForm.is_active}
                        onChange={(e) => handleEditAccountChange('is_active', e.target.checked)}
                      />
                      Active Account
                    </label>
                  </div>
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: 4, fontWeight: 500}}>Description</label>
                  <textarea 
                    value={editAccountForm.description}
                    onChange={(e) => handleEditAccountChange('description', e.target.value)}
                    className="form-control"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '16px 24px', borderTop: '1px solid #ddd'}}>
              <button className="btn btn-secondary" onClick={closeEditAccountModal}>Cancel</button>
              <button className="btn btn-primary" onClick={saveAccountChanges} disabled={editAccountLoading}>
                {editAccountLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .report-output { max-width: 900px; background: #fff; padding: 24px; border-radius: 8px; }
        .report-header-print { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #333; }
        .report-header-print h2 { margin: 0 0 8px; font-size: 24px; }
        .report-header-print p { margin: 0; color: #666; }
        .report-section { margin-bottom: 24px; background: #fff; }
        .report-section h3 { margin: 0 0 12px; font-size: 16px; }
        .report-table { width: 100%; border-collapse: collapse; background: #fff; }
        .report-table th, .report-table td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #eee; }
        .report-table th { background: #f5f5f5; font-weight: 600; font-size: 12px; text-transform: uppercase; }
        .subtotal-row { background: #fafafa; border-top: 2px solid #ddd; }
        .subtotal-row td { padding-top: 12px; padding-bottom: 12px; }
        
        .clickable-row { cursor: pointer; transition: background 0.15s; }
        .clickable-row:hover { background: #e3f2fd !important; }
        .clickable-row td:first-child::before { content: '→ '; opacity: 0; transition: opacity 0.15s; }
        .clickable-row:hover td:first-child::before { opacity: 0.5; }
        .clickable-cell { transition: background 0.15s; }
        .clickable-cell:hover { background: #e3f2fd !important; }
        .balance-cell:hover { background: #e8f5e9 !important; text-decoration: underline; }
        
        .form-control { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
        .form-control:focus { outline: none; border-color: #7A8B6E; }
        
        .drill-down-modal { width: 90%; max-width: 900px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; }
        .drill-down-modal .modal-body { overflow-y: auto; flex: 1; }
        
        .drill-down-summary { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
        .drill-down-summary .summary-item { background: #f5f5f5; padding: 12px 20px; border-radius: 8px; text-align: center; min-width: 120px; }
        .drill-down-summary .summary-item.highlight { background: #e3f2fd; }
        .drill-down-summary .label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
        .drill-down-summary .value { display: block; font-size: 18px; font-weight: 600; }
        
        .drill-down-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; }
        .drill-down-table th { position: sticky; top: 0; background: #f5f5f5; padding: 10px 8px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #ddd; }
        .drill-down-table td { padding: 8px; border-bottom: 1px solid #eee; background: #fff; }
        .drill-down-table tbody tr:hover { background: #fafafa; }
        
        @media print {
          .sidebar, .page-header, .card:first-of-type, .btn, .modal-overlay { display: none !important; }
          .main-content { margin: 0 !important; padding: 20px !important; }
          .card { box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// BANK FEED / TRANSACTION ACCEPTANCE VIEW
// ============================================================================
const BankFeedView = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ pending: { count: 0 }, accepted: { count: 0 }, excluded: { count: 0 } });
  const [loading, setLoading] = useState(true);
  const [chartOfAccounts, setChartOfAccounts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [acceptForm, setAcceptForm] = useState({
    account_id: '',
    class_id: '',
    description: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualForm, setManualForm] = useState({ date: '', description: '', amount: '', type: 'deposit' });

  useEffect(() => {
    loadData();
    loadChartOfAccounts();
    loadClasses();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, txnRes] = await Promise.all([
        transactionAcceptanceService.getSummary(),
        activeTab === 'pending' ? transactionAcceptanceService.getPending() :
        activeTab === 'accepted' ? transactionAcceptanceService.getAccepted() :
        transactionAcceptanceService.getExcluded()
      ]);
      setSummary(summaryRes);
      setTransactions(txnRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChartOfAccounts = async () => {
    try {
      const data = await accountingService.getAccounts();
      setChartOfAccounts(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Failed to load chart of accounts:', err);
    }
  };

  const loadClasses = async () => {
    try {
      const data = await classesService.getAll();
      setClasses(data);
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  // Group accounts by type for the dropdown
  const groupedAccounts = chartOfAccounts.reduce((groups, account) => {
    const type = account.account_type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(account);
    return groups;
  }, {});

  const handleAccept = async (txn) => {
    if (!acceptForm.account_id) {
      alert('Please select an account');
      return;
    }
    setActionLoading(true);
    try {
      // Backend derives bank GL account from transaction's plaid_account_id
      await transactionAcceptanceService.accept(txn.id, {
        account_id: acceptForm.account_id,
        class_id: acceptForm.class_id || null,
        description: acceptForm.description
      });
      setSelectedTransaction(null);
      setAcceptForm({
        account_id: '',
        class_id: '',
        description: ''
      });
      loadData();
    } catch (err) {
      alert('Failed to accept: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const openAcceptPanel = (txn) => {
    const isIncome = parseFloat(txn.total || txn.amount) > 0;
    setAcceptForm({
      account_id: '',
      class_id: '',
      description: txn.description || ''
    });
    setSelectedTransaction({ ...txn, isIncome });
  };

  const handleExclude = async (txn) => {
    const reason = prompt('Reason for excluding this transaction (optional):');
    setActionLoading(true);
    try {
      await transactionAcceptanceService.exclude(txn.id, reason);
      loadData();
    } catch (err) {
      alert('Failed to exclude: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnaccept = async (txn) => {
    if (!window.confirm('Unaccept this transaction? The journal entry will be voided.')) return;
    setActionLoading(true);
    try {
      await transactionAcceptanceService.unaccept(txn.id);
      loadData();
    } catch (err) {
      alert('Failed to unaccept: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (txn) => {
    setActionLoading(true);
    try {
      await transactionAcceptanceService.restore(txn.id);
      loadData();
    } catch (err) {
      alert('Failed to restore: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateManual = async (e) => {
    e.preventDefault();
    if (!manualForm.date || !manualForm.description || !manualForm.amount) {
      alert('Please fill in all required fields');
      return;
    }
    setActionLoading(true);
    try {
      await transactionAcceptanceService.createManual({
        date: manualForm.date,
        description: manualForm.description,
        amount: parseFloat(manualForm.amount),
        type: manualForm.type
      });
      setShowManualEntry(false);
      setManualForm({ date: '', description: '', amount: '', type: 'deposit' });
      loadData();
    } catch (err) {
      alert('Failed to create: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Bank Feed</h1>
        <p style={{color: '#666', marginTop: 4}}>Review and categorize transactions</p>
      </div>

      {/* Summary Cards */}
      <div style={{display: 'flex', gap: 16, marginBottom: 24}}>
        <div 
          className={`card ${activeTab === 'pending' ? 'active-tab' : ''}`}
          style={{flex: 1, cursor: 'pointer', background: activeTab === 'pending' ? '#fff3e0' : '#fff'}}
          onClick={() => setActiveTab('pending')}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <Icons.Inbox />
            <div>
              <div style={{fontSize: 24, fontWeight: 700, color: '#ef6c00'}}>{summary.pending?.count || 0}</div>
              <div style={{fontSize: 13, color: '#666'}}>Pending Review</div>
            </div>
          </div>
        </div>
        <div 
          className={`card ${activeTab === 'accepted' ? 'active-tab' : ''}`}
          style={{flex: 1, cursor: 'pointer', background: activeTab === 'accepted' ? '#e8f5e9' : '#fff'}}
          onClick={() => setActiveTab('accepted')}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <Icons.CheckCircle />
            <div>
              <div style={{fontSize: 24, fontWeight: 700, color: '#2e7d32'}}>{summary.accepted?.count || 0}</div>
              <div style={{fontSize: 13, color: '#666'}}>Accepted</div>
            </div>
          </div>
        </div>
        <div 
          className={`card ${activeTab === 'excluded' ? 'active-tab' : ''}`}
          style={{flex: 1, cursor: 'pointer', background: activeTab === 'excluded' ? '#fce4ec' : '#fff'}}
          onClick={() => setActiveTab('excluded')}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <Icons.XCircle />
            <div>
              <div style={{fontSize: 24, fontWeight: 700, color: '#c62828'}}>{summary.excluded?.count || 0}</div>
              <div style={{fontSize: 13, color: '#666'}}>Excluded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card" style={{marginBottom: 16}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3 style={{margin: 0}}>
            {activeTab === 'pending' ? 'Pending Transactions' : 
             activeTab === 'accepted' ? 'Accepted Transactions' : 'Excluded Transactions'}
          </h3>
          <div style={{display: 'flex', gap: 8}}>
            <button className="btn btn-secondary" onClick={loadData}>
              <Icons.RefreshCw /> Refresh
            </button>
            {activeTab === 'pending' && (
              <button className="btn btn-primary" onClick={() => setShowManualEntry(true)}>
                <Icons.Plus /> Add Manual Entry
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        {loading ? (
          <div style={{textAlign: 'center', padding: 40}}>
            <Icons.Loader /> Loading...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{textAlign: 'center', padding: 40, color: '#888'}}>
            No {activeTab} transactions
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th style={{textAlign: 'right'}}>Amount</th>
                {activeTab === 'accepted' && <th>Category</th>}
                {activeTab === 'accepted' && <th>Class</th>}
                {activeTab === 'excluded' && <th>Reason</th>}
                <th style={{width: 180}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(txn => (
                <React.Fragment key={txn.id}>
                  <tr style={{background: selectedTransaction?.id === txn.id ? '#e3f2fd' : undefined}}>
                    <td>{formatDate(txn.date)}</td>
                    <td>
                      <div>{txn.description}</div>
                      {txn.reference && <div style={{fontSize: 11, color: '#888'}}>Ref: {txn.reference}</div>}
                    </td>
                    <td style={{textAlign: 'right', fontWeight: 500}}>
                      {formatCurrency(txn.total)}
                    </td>
                    {activeTab === 'accepted' && (
                      <td>
                        <span style={{background: '#e8f5e9', padding: '2px 8px', borderRadius: 4, fontSize: 12}}>
                          {txn.category_name || txn.accepted_account_name || '-'}
                        </span>
                      </td>
                    )}
                    {activeTab === 'accepted' && (
                      <td style={{fontSize: 13, color: '#666'}}>
                        {txn.class_name || '-'}
                      </td>
                    )}
                    {activeTab === 'excluded' && (
                      <td style={{color: '#888', fontSize: 13}}>{txn.exclusion_reason || '-'}</td>
                    )}
                    <td>
                      {activeTab === 'pending' && (
                        <div style={{display: 'flex', gap: 4}}>
                          <button 
                            className="btn btn-primary" 
                            style={{padding: '4px 8px', fontSize: 12}}
                            onClick={() => {
                              if (selectedTransaction?.id === txn.id) {
                                setSelectedTransaction(null);
                              } else {
                                openAcceptPanel(txn);
                              }
                            }}
                          >
                            {selectedTransaction?.id === txn.id ? 'Cancel' : 'Categorize'}
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{padding: '4px 8px', fontSize: 12}}
                            onClick={() => handleExclude(txn)}
                          >
                            Exclude
                          </button>
                        </div>
                      )}
                      {activeTab === 'accepted' && (
                        <button 
                          className="btn btn-secondary" 
                          style={{padding: '4px 8px', fontSize: 12}}
                          onClick={() => handleUnaccept(txn)}
                        >
                          Unaccept
                        </button>
                      )}
                      {activeTab === 'excluded' && (
                        <button 
                          className="btn btn-secondary" 
                          style={{padding: '4px 8px', fontSize: 12}}
                          onClick={() => handleRestore(txn)}
                        >
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                  {/* Inline Categorization Panel - appears directly below selected transaction */}
                  {selectedTransaction?.id === txn.id && activeTab === 'pending' && (
                    <tr>
                      <td colSpan={4} style={{padding: 0, background: '#e3f2fd'}}>
                        <div style={{
                          padding: 16, 
                          borderLeft: '4px solid #1976d2',
                          background: '#e3f2fd'
                        }}>
                          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12}}>
                            {/* Account Selection (from Chart of Accounts) */}
                            <div>
                              <label style={{display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500}}>
                                Account *
                              </label>
                              <select 
                                className="form-control" 
                                value={acceptForm.account_id}
                                onChange={(e) => setAcceptForm({...acceptForm, account_id: e.target.value})}
                                style={{width: '100%', padding: '8px 12px'}}
                                autoFocus
                              >
                                <option value="">-- Select Account --</option>
                                {/* Show expense accounts first for withdrawals, income for deposits */}
                                {selectedTransaction?.isIncome ? (
                                  <>
                                    {groupedAccounts.revenue && groupedAccounts.revenue.length > 0 && (
                                      <optgroup label="Revenue">
                                        {groupedAccounts.revenue.map(a => (
                                          <option key={a.id} value={a.id}>{a.account_code} - {a.name}</option>
                                        ))}
                                      </optgroup>
                                    )}
                                    {groupedAccounts.expense && groupedAccounts.expense.length > 0 && (
                                      <optgroup label="Expense">
                                        {groupedAccounts.expense.map(a => (
                                          <option key={a.id} value={a.id}>{a.account_code} - {a.name}</option>
                                        ))}
                                      </optgroup>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {groupedAccounts.expense && groupedAccounts.expense.length > 0 && (
                                      <optgroup label="Expense">
                                        {groupedAccounts.expense.map(a => (
                                          <option key={a.id} value={a.id}>{a.account_code} - {a.name}</option>
                                        ))}
                                      </optgroup>
                                    )}
                                    {groupedAccounts.revenue && groupedAccounts.revenue.length > 0 && (
                                      <optgroup label="Revenue">
                                        {groupedAccounts.revenue.map(a => (
                                          <option key={a.id} value={a.id}>{a.account_code} - {a.name}</option>
                                        ))}
                                      </optgroup>
                                    )}
                                  </>
                                )}
                                {/* Also show asset/liability accounts for transfers */}
                                {groupedAccounts.asset && groupedAccounts.asset.length > 0 && (
                                  <optgroup label="Asset">
                                    {groupedAccounts.asset.map(a => (
                                      <option key={a.id} value={a.id}>{a.account_code} - {a.name}</option>
                                    ))}
                                  </optgroup>
                                )}
                                {groupedAccounts.liability && groupedAccounts.liability.length > 0 && (
                                  <optgroup label="Liability">
                                    {groupedAccounts.liability.map(a => (
                                      <option key={a.id} value={a.id}>{a.account_code} - {a.name}</option>
                                    ))}
                                  </optgroup>
                                )}
                                {groupedAccounts.equity && groupedAccounts.equity.length > 0 && (
                                  <optgroup label="Equity">
                                    {groupedAccounts.equity.map(a => (
                                      <option key={a.id} value={a.id}>{a.account_code} - {a.name}</option>
                                    ))}
                                  </optgroup>
                                )}
                              </select>
                            </div>

                            {/* Class Selection (optional) */}
                            <div>
                              <label style={{display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500}}>
                                Class (optional)
                              </label>
                              <select 
                                className="form-control" 
                                value={acceptForm.class_id}
                                onChange={(e) => setAcceptForm({...acceptForm, class_id: e.target.value})}
                                style={{width: '100%', padding: '8px 12px'}}
                              >
                                <option value="">-- No Class --</option>
                                {classes.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            </div>

                            {/* Bank Account Display (read-only) */}
                            <div>
                              <label style={{display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500}}>
                                Source Bank → GL Account
                              </label>
                              <div style={{
                                padding: '8px 12px', 
                                background: '#fff', 
                                border: '1px solid #ddd', 
                                borderRadius: 8,
                                fontSize: 14,
                                color: '#333'
                              }}>
                                <div>{txn.source_display || txn.plaid_account_name || 'Unknown Source'}</div>
                                {txn.bank_gl_account_name ? (
                                  <div style={{fontSize: 12, color: '#16a34a', marginTop: 4}}>→ {txn.bank_gl_account_name}</div>
                                ) : (
                                  <div style={{fontSize: 12, color: '#dc2626', marginTop: 4}}>⚠ Not linked to GL account</div>
                                )}
                              </div>
                            </div>

                            {/* Description Override */}
                            <div>
                              <label style={{display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500}}>
                                Description
                              </label>
                              <input 
                                type="text"
                                className="form-control"
                                value={acceptForm.description}
                                onChange={(e) => setAcceptForm({...acceptForm, description: e.target.value})}
                                placeholder="Edit description"
                                style={{width: '100%', padding: '8px 12px'}}
                              />
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end'}}>
                            <button 
                              className="btn btn-secondary"
                              onClick={() => setSelectedTransaction(null)}
                              style={{padding: '8px 16px'}}
                            >
                              Cancel
                            </button>
                            <button 
                              className="btn btn-primary"
                              onClick={() => handleAccept(selectedTransaction)}
                              disabled={!acceptForm.account_id || actionLoading}
                              style={{padding: '8px 16px'}}
                            >
                              {actionLoading ? 'Processing...' : 'Accept & Post'}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="modal-overlay" onClick={() => setShowManualEntry(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 400}}>
            <div className="modal-header">
              <h2>Add Manual Transaction</h2>
              <button className="modal-close" onClick={() => setShowManualEntry(false)}><Icons.X /></button>
            </div>
            <form onSubmit={handleCreateManual}>
              <div className="modal-body">
                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                  <div>
                    <label style={{display: 'block', marginBottom: 4}}>Date *</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={manualForm.date}
                      onChange={(e) => setManualForm({...manualForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: 4}}>Description *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={manualForm.description}
                      onChange={(e) => setManualForm({...manualForm, description: e.target.value})}
                      placeholder="Transaction description"
                      required
                    />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: 4}}>Amount *</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control"
                      value={manualForm.amount}
                      onChange={(e) => setManualForm({...manualForm, amount: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: 4}}>Type</label>
                    <select 
                      className="form-control"
                      value={manualForm.type}
                      onChange={(e) => setManualForm({...manualForm, type: e.target.value})}
                    >
                      <option value="deposit">Deposit (Income)</option>
                      <option value="payment">Payment (Expense)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{padding: 16, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 8}}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowManualEntry(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Creating...' : 'Create Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .active-tab { box-shadow: 0 0 0 2px #1976d2 !important; }
      `}</style>
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [accounts, setAccounts] = useState([]);
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [chartOfAccounts, setChartOfAccounts] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      loadData();
    }
    setLoading(false);
  }, []);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const [accountsRes, itemsRes, transactionsRes, zonesRes, coaRes] = await Promise.all([
        accountsService.getAll().catch(() => ({ data: [] })),
        itemsService.getAll().catch(() => ({ data: [] })),
        transactionsService.getAll().catch(() => ({ data: [] })),
        deliveryZonesService.getAll().catch(() => []),
        accountingService.getAccounts().catch(() => []),
      ]);
      setAccounts(accountsRes.data || []);
      setItems(itemsRes.data || []);
      setTransactions(transactionsRes.data || []);
      setDeliveryZones(Array.isArray(zonesRes) ? zonesRes : zonesRes.data || []);
      setChartOfAccounts(Array.isArray(coaRes) ? coaRes : coaRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogin = (user) => { setUser(user); loadData(); };
  const handleLogout = () => { authService.logout(); setUser(null); setAccounts([]); setItems([]); setTransactions([]); setDeliveryZones([]); setChartOfAccounts([]); };

  if (loading) {
    return (<div className="loading-screen"><Icons.Loader /><p>Loading...</p></div>);
  }

  if (!user) {
    return (<LoginPage onLogin={handleLogin} />);
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'accounts', label: 'Accounts', icon: Icons.Users },
    { id: 'items', label: 'Items', icon: Icons.Package },
    { id: 'bankFeed', label: 'Bank Feed', icon: Icons.Inbox },
    { id: 'bankConnections', label: 'Bank Connections', icon: Icons.Bank },
    { id: 'transactions', label: 'Bookkeeping', icon: Icons.DollarSign },
    { id: 'accountingCategories', label: 'Categories', icon: Icons.Tag },
    { id: 'chartOfAccounts', label: 'Chart of Accounts', icon: Icons.Book },
    { id: 'reports', label: 'Reports', icon: Icons.BarChart },
    { id: 'deliveryZones', label: 'Delivery Zones', icon: Icons.Truck },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView accounts={accounts} items={items} transactions={transactions} />;
      case 'accounts': return <AccountsView accounts={accounts} loading={dataLoading} onRefresh={loadData} />;
      case 'items': return <ItemsView items={items} loading={dataLoading} />;
      case 'bankFeed': return <BankFeedView />;
      case 'bankConnections': return <BankConnectionsView />;
      case 'transactions': return <TransactionsView />;
      case 'accountingCategories': return <AccountingCategoriesView />;
      case 'chartOfAccounts': return <ChartOfAccountsView accounts={chartOfAccounts} loading={dataLoading} onRefresh={loadData} />;
      case 'reports': return <ReportsView />;
      case 'deliveryZones': return <DeliveryZonesView zones={deliveryZones} loading={dataLoading} />;
      default: return <DashboardView accounts={accounts} items={items} transactions={transactions} />;
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header"><h1>🌱 Hood Family Farms</h1><p>Business Manager</p></div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button key={item.id} className={`nav-item ${currentView === item.id ? 'active' : ''}`} onClick={() => setCurrentView(item.id)}>
              <item.icon />{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user.name?.charAt(0) || 'U'}</div>
            <div className="user-details"><div className="user-name">{user.name}</div><div className="user-role">{user.role}</div></div>
          </div>
          <button className="logout-btn" onClick={handleLogout}><Icons.LogOut />Sign Out</button>
        </div>
      </aside>
      <main className="main-content">{renderView()}</main>
    </div>
  );
}

export default App;
