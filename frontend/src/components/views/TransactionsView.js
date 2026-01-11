/**
 * TransactionsView Component
 * Bookkeeping and transaction management (old style - for legacy bookkeeping)
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { transactionsService, accountingCategoriesService } from '../../services/api';

const TransactionsView = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
    loadCategories();
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

  const loadCategories = async () => {
    try {
      const data = await accountingCategoriesService.getGrouped();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const filtered = transactions.filter(txn => {
    const matchSearch = !search || 
      txn.description?.toLowerCase().includes(search.toLowerCase()) ||
      txn.vendor?.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || txn.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalIncome = filtered
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  
  const totalExpense = filtered
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

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
        </div>
      </div>

      {/* Filters */}
      <div className="toolbar">
        <div className="search-box">
          <Icons.Search />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <select 
          className="filter-select" 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
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
                <th>Vendor</th>
                <th>Category</th>
                <th>Type</th>
                <th style={{textAlign: 'right'}}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>
                    <Icons.Loader /> Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#888'}}>
                    No transactions found
                  </td>
                </tr>
              ) : (
                filtered.map(txn => (
                  <tr key={txn.id}>
                    <td>{formatDate(txn.date)}</td>
                    <td>{txn.description}</td>
                    <td>{txn.vendor || '—'}</td>
                    <td>
                      {txn.category_name ? (
                        <span className={`badge ${txn.type === 'income' ? 'badge-green' : 'badge-red'}`}>
                          {txn.category_name}
                        </span>
                      ) : '—'}
                    </td>
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
