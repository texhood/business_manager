/**
 * ReportsView Component
 * Financial reports - Balance Sheet, Income Statement, Trial Balance
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { formatCurrency } from '../../utils/formatters';
import { reportsService, accountingService } from '../../services/api';

const ReportsView = () => {
  const [activeReport, setActiveReport] = useState('balance-sheet');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadReport();
  }, [activeReport]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      switch (activeReport) {
        case 'balance-sheet':
          data = await reportsService.getBalanceSheet(dateRange.end_date);
          break;
        case 'income-statement':
          data = await reportsService.getIncomeStatement(dateRange.start_date, dateRange.end_date);
          break;
        case 'trial-balance':
          data = await accountingService.getTrialBalance(dateRange.end_date);
          break;
        default:
          data = null;
      }
      setReportData(data);
    } catch (err) {
      console.error('Error loading report:', err);
      setError(err.response?.data?.message || 'Failed to load report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    { id: 'balance-sheet', name: 'Balance Sheet', icon: Icons.BarChart },
    { id: 'income-statement', name: 'Income Statement', icon: Icons.TrendingUp },
    { id: 'trial-balance', name: 'Trial Balance', icon: Icons.Book },
  ];

  const renderBalanceSheet = () => {
    if (!reportData) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>No data available</div>;
    
    // Handle different response formats
    const assets = Array.isArray(reportData.assets) ? reportData.assets : [];
    const liabilities = Array.isArray(reportData.liabilities) ? reportData.liabilities : [];
    const equity = Array.isArray(reportData.equity) ? reportData.equity : [];
    
    const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.balance || a.current_balance || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + parseFloat(a.balance || a.current_balance || 0), 0);
    const totalEquity = equity.reduce((sum, a) => sum + parseFloat(a.balance || a.current_balance || 0), 0);

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-header"><h3>Assets</h3></div>
          <table style={{ width: '100%' }}>
            <tbody>
              {assets.length === 0 ? (
                <tr><td style={{ padding: 20, textAlign: 'center', color: '#888' }}>No asset accounts</td></tr>
              ) : (
                assets.map(a => (
                  <tr key={a.id || a.account_code}>
                    <td style={{ padding: '8px 16px' }}>{a.account_code} - {a.name}</td>
                    <td style={{ padding: '8px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{formatCurrency(a.balance || a.current_balance)}</td>
                  </tr>
                ))
              )}
              <tr style={{ fontWeight: 600, borderTop: '2px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px' }}>Total Assets</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{formatCurrency(totalAssets)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><h3>Liabilities</h3></div>
            <table style={{ width: '100%' }}>
              <tbody>
                {liabilities.length === 0 ? (
                  <tr><td style={{ padding: 20, textAlign: 'center', color: '#888' }}>No liability accounts</td></tr>
                ) : (
                  liabilities.map(a => (
                    <tr key={a.id || a.account_code}>
                      <td style={{ padding: '8px 16px' }}>{a.account_code} - {a.name}</td>
                      <td style={{ padding: '8px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{formatCurrency(a.balance || a.current_balance)}</td>
                    </tr>
                  ))
                )}
                <tr style={{ fontWeight: 600, borderTop: '2px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px' }}>Total Liabilities</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{formatCurrency(totalLiabilities)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="card-header"><h3>Equity</h3></div>
            <table style={{ width: '100%' }}>
              <tbody>
                {equity.length === 0 ? (
                  <tr><td style={{ padding: 20, textAlign: 'center', color: '#888' }}>No equity accounts</td></tr>
                ) : (
                  equity.map(a => (
                    <tr key={a.id || a.account_code}>
                      <td style={{ padding: '8px 16px' }}>{a.account_code} - {a.name}</td>
                      <td style={{ padding: '8px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{formatCurrency(a.balance || a.current_balance)}</td>
                    </tr>
                  ))
                )}
                <tr style={{ fontWeight: 600, borderTop: '2px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px' }}>Total Equity</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{formatCurrency(totalEquity)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderIncomeStatement = () => {
    if (!reportData) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>No data available</div>;
    
    // Handle different response formats
    const revenue = Array.isArray(reportData.revenue) ? reportData.revenue : 
                    Array.isArray(reportData.income) ? reportData.income : [];
    const expenses = Array.isArray(reportData.expenses) ? reportData.expenses : [];
    
    const totalRevenue = revenue.reduce((sum, a) => sum + parseFloat(a.balance || a.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, a) => sum + parseFloat(a.balance || a.total || 0), 0);
    const netIncome = totalRevenue - totalExpenses;

    return (
      <div className="card">
        <table style={{ width: '100%' }}>
          <tbody>
            <tr style={{ backgroundColor: '#d1fae5' }}>
              <td colSpan={2} style={{ padding: '12px 16px', fontWeight: 600, color: '#059669' }}>Revenue</td>
            </tr>
            {revenue.length === 0 ? (
              <tr><td colSpan={2} style={{ padding: '8px 32px', color: '#888' }}>No revenue recorded</td></tr>
            ) : (
              revenue.map(a => (
                <tr key={a.id || a.account_code || a.name}>
                  <td style={{ padding: '8px 16px 8px 32px' }}>{a.account_code ? `${a.account_code} - ` : ''}{a.name}</td>
                  <td style={{ padding: '8px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{formatCurrency(a.balance || a.total)}</td>
                </tr>
              ))
            )}
            <tr style={{ fontWeight: 600, borderTop: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px 16px' }}>Total Revenue</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', color: '#059669' }}>{formatCurrency(totalRevenue)}</td>
            </tr>
            <tr style={{ backgroundColor: '#fee2e2' }}>
              <td colSpan={2} style={{ padding: '12px 16px', fontWeight: 600, color: '#dc2626' }}>Expenses</td>
            </tr>
            {expenses.length === 0 ? (
              <tr><td colSpan={2} style={{ padding: '8px 32px', color: '#888' }}>No expenses recorded</td></tr>
            ) : (
              expenses.map(a => (
                <tr key={a.id || a.account_code || a.name}>
                  <td style={{ padding: '8px 16px 8px 32px' }}>{a.account_code ? `${a.account_code} - ` : ''}{a.name}</td>
                  <td style={{ padding: '8px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{formatCurrency(a.balance || a.total)}</td>
                </tr>
              ))
            )}
            <tr style={{ fontWeight: 600, borderTop: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px 16px' }}>Total Expenses</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', color: '#dc2626' }}>{formatCurrency(totalExpenses)}</td>
            </tr>
            <tr style={{ fontWeight: 700, backgroundColor: '#f3f4f6', borderTop: '2px solid #374151' }}>
              <td style={{ padding: '16px' }}>Net Income</td>
              <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'monospace', fontSize: 18, color: netIncome >= 0 ? '#059669' : '#dc2626' }}>{formatCurrency(netIncome)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderTrialBalance = () => {
    if (!reportData) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>No data available</div>;
    
    // Handle different response formats - could be array or object with data property
    const accounts = Array.isArray(reportData) ? reportData : 
                     Array.isArray(reportData.accounts) ? reportData.accounts :
                     Array.isArray(reportData.data) ? reportData.data : [];
    
    if (accounts.length === 0) {
      return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>No accounts with balances</div>;
    }
    
    const totalDebit = accounts.reduce((sum, a) => sum + parseFloat(a.debit_balance || a.debit || 0), 0);
    const totalCredit = accounts.reduce((sum, a) => sum + parseFloat(a.credit_balance || a.credit || 0), 0);

    return (
      <div className="card">
        <table style={{ width: '100%' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Account</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Debit</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Credit</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(a => {
              const debit = parseFloat(a.debit_balance || a.debit || 0);
              const credit = parseFloat(a.credit_balance || a.credit || 0);
              return (
                <tr key={a.account_code || a.id}>
                  <td style={{ padding: '8px 16px' }}>{a.account_code} - {a.name}</td>
                  <td style={{ padding: '8px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{debit > 0 ? formatCurrency(debit) : ''}</td>
                  <td style={{ padding: '8px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{credit > 0 ? formatCurrency(credit) : ''}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 600, borderTop: '2px solid #374151', backgroundColor: '#f9fafb' }}>
              <td style={{ padding: '12px 16px' }}>Totals</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{formatCurrency(totalDebit)}</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{formatCurrency(totalCredit)}</td>
            </tr>
            {Math.abs(totalDebit - totalCredit) > 0.01 && (
              <tr style={{ backgroundColor: '#fef2f2' }}>
                <td colSpan={3} style={{ padding: '12px 16px', color: '#dc2626', textAlign: 'center' }}>
                  ⚠ Out of balance by {formatCurrency(Math.abs(totalDebit - totalCredit))}
                </td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Financial Reports</h1>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {reports.map(report => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id)}
            style={{
              padding: '12px 20px',
              borderRadius: 6,
              border: activeReport === report.id ? '2px solid #2563eb' : '1px solid #d1d5db',
              backgroundColor: activeReport === report.id ? '#eff6ff' : 'white',
              color: activeReport === report.id ? '#2563eb' : '#374151',
              cursor: 'pointer',
              fontWeight: activeReport === report.id ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <report.icon /> {report.name}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 24, padding: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {activeReport !== 'balance-sheet' && (
            <div>
              <label style={{ marginRight: 8 }}>From:</label>
              <input type="date" value={dateRange.start_date} onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #d1d5db' }} />
            </div>
          )}
          <div>
            <label style={{ marginRight: 8 }}>{activeReport === 'balance-sheet' ? 'As of:' : 'To:'}</label>
            <input type="date" value={dateRange.end_date} onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #d1d5db' }} />
          </div>
          <button onClick={loadReport} className="btn btn-primary" style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icons.RefreshCw /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: 6, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Icons.Loader /> Loading report...</div>
      ) : (
        <>
          {activeReport === 'balance-sheet' && renderBalanceSheet()}
          {activeReport === 'income-statement' && renderIncomeStatement()}
          {activeReport === 'trial-balance' && renderTrialBalance()}
        </>
      )}
    </div>
  );
};

export default ReportsView;
