/**
 * BankFeedView Component
 * Transaction acceptance workflow for bank-imported transactions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../common/Icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { transactionAcceptanceService, accountingService, classesService, vendorsService } from '../../services/api';

const BankFeedView = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [summary, setSummary] = useState({ pending: { count: 0 }, accepted: { count: 0 }, excluded: { count: 0 } });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [acceptForm, setAcceptForm] = useState({ account_id: '', class_id: '', vendor_id: '', description: '' });
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualForm, setManualForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '', type: 'payment' });
  const [message, setMessage] = useState(null);
  const [newVendorName, setNewVendorName] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [txnData, accountsData, classesData, vendorsData, summaryData] = await Promise.all([
        activeTab === 'pending' ? transactionAcceptanceService.getPending() :
        activeTab === 'accepted' ? transactionAcceptanceService.getAccepted() :
        transactionAcceptanceService.getExcluded(),
        accountingService.getAccounts(),
        classesService.getAll(),
        vendorsService.getAll(),
        transactionAcceptanceService.getSummary(),
      ]);
      setTransactions(txnData.data || []);
      setAccounts(Array.isArray(accountsData) ? accountsData : accountsData.data || []);
      setClasses(Array.isArray(classesData) ? classesData : classesData.data || []);
      setVendors(Array.isArray(vendorsData) ? vendorsData : vendorsData.data || []);
      setSummary(summaryData || { pending: { count: 0 }, accepted: { count: 0 }, excluded: { count: 0 } });
    } catch (err) {
      console.error('Error loading data:', err);
      setMessage({ type: 'error', text: 'Failed to load transactions' });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const openAcceptPanel = (txn) => {
    setSelectedTransaction(txn);
    setAcceptForm({ account_id: '', class_id: '', vendor_id: txn.vendor_id || '', description: txn.description || '' });
    setNewVendorName('');
  };

  const handleAccept = async (txn) => {
    if (!acceptForm.account_id) {
      setMessage({ type: 'error', text: 'Please select an account' });
      return;
    }
    try {
      setActionLoading(true);
      await transactionAcceptanceService.accept(txn.id, {
        account_id: parseInt(acceptForm.account_id),
        class_id: acceptForm.class_id ? parseInt(acceptForm.class_id) : null,
        vendor_id: acceptForm.vendor_id ? parseInt(acceptForm.vendor_id) : null,
        description: acceptForm.description || txn.description,
      });
      setMessage({ type: 'success', text: 'Transaction accepted and journal entry created' });
      setSelectedTransaction(null);
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to accept transaction' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExclude = async (txn) => {
    const reason = window.prompt('Reason for excluding this transaction:');
    if (reason === null) return;
    try {
      setActionLoading(true);
      await transactionAcceptanceService.exclude(txn.id, reason);
      setMessage({ type: 'success', text: 'Transaction excluded' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to exclude transaction' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnaccept = async (txn) => {
    if (!window.confirm('Unaccept this transaction? The journal entry will be voided.')) return;
    try {
      setActionLoading(true);
      await transactionAcceptanceService.unaccept(txn.id);
      setMessage({ type: 'success', text: 'Transaction returned to pending' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to unaccept transaction' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (txn) => {
    try {
      setActionLoading(true);
      await transactionAcceptanceService.restore(txn.id);
      setMessage({ type: 'success', text: 'Transaction restored to pending' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to restore transaction' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateManual = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await transactionAcceptanceService.createManual(manualForm);
      setMessage({ type: 'success', text: 'Manual transaction created' });
      setShowManualEntry(false);
      setManualForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', type: 'payment' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create transaction' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickCreateVendor = async () => {
    if (!newVendorName.trim()) return;
    try {
      const result = await vendorsService.quickCreate(newVendorName.trim());
      if (result.data) {
        // Add to vendors list if new
        if (!vendors.find(v => v.id === result.data.id)) {
          setVendors([...vendors, result.data]);
        }
        setAcceptForm({ ...acceptForm, vendor_id: result.data.id.toString() });
        setNewVendorName('');
        setMessage({ type: 'success', text: result.message || 'Vendor created' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create vendor' });
    }
  };

  // Group accounts by type for the dropdown
  const groupedAccounts = accounts.reduce((acc, account) => {
    const type = account.account_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(account);
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="page-header">
        <h1>Bank Feed</h1>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', borderRadius: 6, marginBottom: 20, backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4', color: message.type === 'error' ? '#dc2626' : '#16a34a' }}>
          {message.text}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className={`card ${activeTab === 'pending' ? 'active-tab' : ''}`} style={{ cursor: 'pointer', background: activeTab === 'pending' ? '#fef3c7' : '#fff' }} onClick={() => setActiveTab('pending')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icons.Inbox />
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706' }}>{summary.pending?.count || 0}</div>
              <div style={{ fontSize: 13, color: '#666' }}>Pending</div>
            </div>
          </div>
        </div>
        <div className={`card ${activeTab === 'accepted' ? 'active-tab' : ''}`} style={{ cursor: 'pointer', background: activeTab === 'accepted' ? '#d1fae5' : '#fff' }} onClick={() => setActiveTab('accepted')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icons.CheckCircle />
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>{summary.accepted?.count || 0}</div>
              <div style={{ fontSize: 13, color: '#666' }}>Accepted</div>
            </div>
          </div>
        </div>
        <div className={`card ${activeTab === 'excluded' ? 'active-tab' : ''}`} style={{ cursor: 'pointer', background: activeTab === 'excluded' ? '#fee2e2' : '#fff' }} onClick={() => setActiveTab('excluded')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icons.XCircle />
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626' }}>{summary.excluded?.count || 0}</div>
              <div style={{ fontSize: 13, color: '#666' }}>Excluded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{activeTab === 'pending' ? 'Pending' : activeTab === 'accepted' ? 'Accepted' : 'Excluded'} Transactions</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={loadData}><Icons.RefreshCw /> Refresh</button>
            {activeTab === 'pending' && <button className="btn btn-primary" onClick={() => setShowManualEntry(true)}><Icons.Plus /> Add Manual</button>}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Icons.Loader /> Loading...</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>No {activeTab} transactions</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                {activeTab === 'accepted' && <th>Category</th>}
                {activeTab === 'excluded' && <th>Reason</th>}
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(txn => (
                <React.Fragment key={txn.id}>
                  <tr style={{ background: selectedTransaction?.id === txn.id ? '#e3f2fd' : undefined }}>
                    <td>{formatDate(txn.date)}</td>
                    <td>
                      <div>{txn.description}</div>
                      {txn.reference && <div style={{ fontSize: 11, color: '#888' }}>Ref: {txn.reference}</div>}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(txn.total || txn.amount)}</td>
                    {activeTab === 'accepted' && <td><span style={{ background: '#e8f5e9', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{txn.accepted_account_name || '-'}</span></td>}
                    {activeTab === 'excluded' && <td style={{ color: '#888', fontSize: 13 }}>{txn.exclusion_reason || '-'}</td>}
                    <td>
                      {activeTab === 'pending' && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => selectedTransaction?.id === txn.id ? setSelectedTransaction(null) : openAcceptPanel(txn)}>
                            {selectedTransaction?.id === txn.id ? 'Cancel' : 'Categorize'}
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => handleExclude(txn)}>Exclude</button>
                        </div>
                      )}
                      {activeTab === 'accepted' && <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => handleUnaccept(txn)}>Unaccept</button>}
                      {activeTab === 'excluded' && <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => handleRestore(txn)}>Restore</button>}
                    </td>
                  </tr>
                  {selectedTransaction?.id === txn.id && activeTab === 'pending' && (
                    <tr>
                      <td colSpan={4} style={{ padding: 0, background: '#e3f2fd' }}>
                        <div style={{ padding: 16, borderLeft: '4px solid #1976d2' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Account *</label>
                              <select className="form-control" value={acceptForm.account_id} onChange={(e) => setAcceptForm({ ...acceptForm, account_id: e.target.value })} style={{ width: '100%', padding: '8px 12px' }} autoFocus>
                                <option value="">-- Select Account --</option>
                                {Object.entries(groupedAccounts).map(([type, accts]) => (
                                  <optgroup key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
                                    {accts.map(a => <option key={a.id} value={a.id}>{a.account_code} - {a.name}</option>)}
                                  </optgroup>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Vendor (optional)</label>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <select className="form-control" value={acceptForm.vendor_id} onChange={(e) => setAcceptForm({ ...acceptForm, vendor_id: e.target.value })} style={{ flex: 1, padding: '8px 12px' }}>
                                  <option value="">-- No Vendor --</option>
                                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                              </div>
                              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                                <input type="text" className="form-control" placeholder="New vendor name" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} style={{ flex: 1, padding: '6px 8px', fontSize: 12 }} />
                                <button type="button" className="btn btn-secondary" onClick={handleQuickCreateVendor} disabled={!newVendorName.trim()} style={{ padding: '6px 10px', fontSize: 12 }}>+ Add</button>
                              </div>
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Class (optional)</label>
                              <select className="form-control" value={acceptForm.class_id} onChange={(e) => setAcceptForm({ ...acceptForm, class_id: e.target.value })} style={{ width: '100%', padding: '8px 12px' }}>
                                <option value="">-- No Class --</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Source → GL</label>
                              <div style={{ padding: '8px 12px', background: '#fff', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}>
                                <div>{txn.source_display || txn.plaid_account_name || 'Unknown'}</div>
                                {txn.bank_gl_account_name ? <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>→ {txn.bank_gl_account_name}</div> : <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>⚠ Not linked</div>}
                              </div>
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Description</label>
                              <input type="text" className="form-control" value={acceptForm.description} onChange={(e) => setAcceptForm({ ...acceptForm, description: e.target.value })} placeholder="Edit description" style={{ width: '100%', padding: '8px 12px' }} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setSelectedTransaction(null)} style={{ padding: '8px 16px' }}>Cancel</button>
                            <button className="btn btn-primary" onClick={() => handleAccept(selectedTransaction)} disabled={!acceptForm.account_id || actionLoading} style={{ padding: '8px 16px' }}>{actionLoading ? 'Processing...' : 'Accept & Post'}</button>
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
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2>Add Manual Transaction</h2>
              <button className="modal-close" onClick={() => setShowManualEntry(false)}><Icons.X /></button>
            </div>
            <form onSubmit={handleCreateManual}>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4 }}>Date *</label>
                    <input type="date" className="form-control" value={manualForm.date} onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4 }}>Description *</label>
                    <input type="text" className="form-control" value={manualForm.description} onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4 }}>Amount *</label>
                    <input type="number" step="0.01" className="form-control" value={manualForm.amount} onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4 }}>Type</label>
                    <select className="form-control" value={manualForm.type} onChange={(e) => setManualForm({ ...manualForm, type: e.target.value })}>
                      <option value="deposit">Deposit (Income)</option>
                      <option value="payment">Payment (Expense)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ padding: 16, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowManualEntry(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>{actionLoading ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`.active-tab { box-shadow: 0 0 0 2px #1976d2 !important; }`}</style>
    </div>
  );
};

export default BankFeedView;
