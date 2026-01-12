/**
 * TransactionsView Component
 * Bookkeeping and transaction management
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { transactionsService } from '../../services/api';

const TransactionsView = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({ gl_accounts: [], classes: [], vendors: [] });
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState('');
  const [glAccountFilter, setGlAccountFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadData();
    loadFilterOptions();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await transactionsService.getAll();
      setTransactions(response.data || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const options = await transactionsService.getFilterOptions();
      setFilterOptions(options || { gl_accounts: [], classes: [], vendors: [] });
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  const filtered = transactions.filter(txn => {
    const matchSearch = !search || 
      txn.description?.toLowerCase().includes(search.toLowerCase()) ||
      txn.vendor?.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || txn.type === typeFilter;
    const matchGlAccount = !glAccountFilter || String(txn.accepted_gl_account_id) === glAccountFilter;
    const matchClass = !classFilter || String(txn.class_id) === classFilter;
    const matchVendor = !vendorFilter || txn.vendor === vendorFilter;
    const matchStartDate = !startDate || txn.date >= startDate;
    const matchEndDate = !endDate || txn.date <= endDate;
    return matchSearch && matchType && matchGlAccount && matchClass && matchVendor && matchStartDate && matchEndDate;
  });

  const totalIncome = filtered
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  
  const totalExpense = filtered
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const incomeCount = filtered.filter(t => t.type === 'income').length;
  const expenseCount = filtered.filter(t => t.type === 'expense').length;

  const hasFilters = search || typeFilter || glAccountFilter || classFilter || vendorFilter || startDate || endDate;

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setGlAccountFilter('');
    setClassFilter('');
    setVendorFilter('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div>
      <div className="page-header">
        <h1>Bookkeeping</h1>
        <p className="subtitle">View and manage financial transactions</p>
      </div>

      {/* Summary Cards */}
      <div style={{display: 'flex', gap: 16, marginBottom: 24}}>
        <div style={{
          flex: 1,
          background: '#e8f5e9',
          padding: 20,
          borderRadius: 8
        }}>
          <div style={{fontSize: 12, color: '#2e7d32', textTransform: 'uppercase', marginBottom: 4}}>
            Total Income
          </div>
          <div style={{fontSize: 28, fontWeight: 600, color: '#2e7d32'}}>
            {formatCurrency(totalIncome)}
          </div>
          <div style={{fontSize: 12, color: '#666', marginTop: 4}}>
            {incomeCount} transaction{incomeCount !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{
          flex: 1,
          background: '#ffebee',
          padding: 20,
          borderRadius: 8
        }}>
          <div style={{fontSize: 12, color: '#c62828', textTransform: 'uppercase', marginBottom: 4}}>
            Total Expenses
          </div>
          <div style={{fontSize: 28, fontWeight: 600, color: '#c62828'}}>
            {formatCurrency(totalExpense)}
          </div>
          <div style={{fontSize: 12, color: '#666', marginTop: 4}}>
            {expenseCount} transaction{expenseCount !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{
          flex: 1,
          background: totalIncome - totalExpense >= 0 ? '#e3f2fd' : '#fff3e0',
          padding: 20,
          borderRadius: 8
        }}>
          <div style={{fontSize: 12, color: '#1565c0', textTransform: 'uppercase', marginBottom: 4}}>
            Net
          </div>
          <div style={{fontSize: 28, fontWeight: 600, color: totalIncome - totalExpense >= 0 ? '#1565c0' : '#e65100'}}>
            {formatCurrency(totalIncome - totalExpense)}
          </div>
          <div style={{fontSize: 12, color: '#666', marginTop: 4}}>
            {filtered.length} total transaction{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Filters - Row 1: Search and Date Range */}
      <div className="toolbar" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
        <div className="search-box">
          <Icons.Search />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 14, color: '#666' }}>From:</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: 150, padding: '8px 12px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 14, color: '#666' }}>To:</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: 150, padding: '8px 12px' }}
          />
        </div>

        {hasFilters && (
          <button 
            className="btn btn-secondary" 
            onClick={clearFilters}
            style={{ marginLeft: 'auto' }}
          >
            <Icons.X /> Clear Filters
          </button>
        )}
      </div>

      {/* Filters - Row 2: Dropdowns */}
      <div className="toolbar" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <select 
          className="filter-select" 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ minWidth: 120 }}
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select 
          className="filter-select" 
          value={glAccountFilter} 
          onChange={(e) => setGlAccountFilter(e.target.value)}
          style={{ minWidth: 200 }}
        >
          <option value="">All GL Accounts</option>
          {filterOptions.gl_accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.account_code} - {acc.name}
            </option>
          ))}
        </select>

        <select 
          className="filter-select" 
          value={classFilter} 
          onChange={(e) => setClassFilter(e.target.value)}
          style={{ minWidth: 150 }}
        >
          <option value="">All Classes</option>
          {filterOptions.classes.map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>

        <select 
          className="filter-select" 
          value={vendorFilter} 
          onChange={(e) => setVendorFilter(e.target.value)}
          style={{ minWidth: 150 }}
        >
          <option value="">All Vendors</option>
          {filterOptions.vendors.map(vendor => (
            <option key={vendor} value={vendor}>
              {vendor}
            </option>
          ))}
        </select>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>GL Account</th>
                <th>Class</th>
                <th>Vendor</th>
                <th>Type</th>
                <th style={{textAlign: 'right'}}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '40px'}}>
                    <Icons.Loader /> Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#888'}}>
                    {hasFilters ? 'No transactions match your filters' : 'No transactions found'}
                  </td>
                </tr>
              ) : (
                filtered.map(txn => (
                  <tr key={txn.id}>
                    <td>{formatDate(txn.date)}</td>
                    <td>{txn.description}</td>
                    <td>
                      {txn.gl_account_name ? (
                        <span style={{ fontSize: 13 }}>
                          <span style={{ color: '#666' }}>{txn.gl_account_code}</span>
                          {' '}{txn.gl_account_name}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      {txn.class_name ? (
                        <span className="badge badge-blue">{txn.class_name}</span>
                      ) : '—'}
                    </td>
                    <td>{txn.vendor || '—'}</td>
                    <td>
                      <span className={`badge ${txn.type === 'income' ? 'badge-green' : 'badge-red'}`}>
                        {txn.type}
                      </span>
                    </td>
                    <td style={{
                      textAlign: 'right', 
                      fontWeight: 600,
                      color: txn.type === 'income' ? '#2e7d32' : '#c62828'
                    }}>
                      {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </td>
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

export default TransactionsView;
