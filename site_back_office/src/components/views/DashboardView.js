/**
 * DashboardView Component
 * Main dashboard with stats and recent activity
 */

import React from 'react';
import { Icons } from '../common/Icons';
import { formatCurrency, formatDate } from '../../utils/formatters';

const DashboardView = ({ accounts, items, transactions, tenant }) => {
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
        <p className="subtitle">Welcome back{tenant?.name ? ` to ${tenant.name}` : ''}</p>
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

export default DashboardView;
