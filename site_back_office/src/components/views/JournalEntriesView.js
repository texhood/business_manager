/**
 * JournalEntriesView Component
 * Manual journal entry creation, viewing, and management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { journalEntriesService, accountingService, classesService } from '../../services/api';

// ============================================================================
// JOURNAL ENTRY FORM COMPONENT
// ============================================================================

function JournalEntryForm({ accounts, classes, onSave, onCancel, editEntry }) {
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    notes: '',
    post_immediately: false,
  });
  
  const [lines, setLines] = useState([
    { account_id: '', description: '', debit: '', credit: '', class_id: '' },
    { account_id: '', description: '', debit: '', credit: '', class_id: '' },
  ]);
  
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editEntry) {
      setFormData({
        entry_date: editEntry.entry_date?.split('T')[0] || '',
        reference: editEntry.reference || '',
        description: editEntry.description || '',
        notes: editEntry.notes || '',
        post_immediately: false,
      });
      
      if (editEntry.lines && editEntry.lines.length > 0) {
        setLines(editEntry.lines.map(line => ({
          account_id: line.account_id || '',
          description: line.description || '',
          debit: line.debit > 0 ? line.debit.toString() : '',
          credit: line.credit > 0 ? line.credit.toString() : '',
          class_id: line.class_id || '',
        })));
      }
    }
  }, [editEntry]);

  const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleAddLine = () => {
    setLines([...lines, { account_id: '', description: '', debit: '', credit: '', class_id: '' }]);
  };

  const handleRemoveLine = (index) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    if (field === 'debit' && value) newLines[index].credit = '';
    else if (field === 'credit' && value) newLines[index].debit = '';
    setLines(newLines);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.entry_date) { setError('Entry date is required'); return; }
    if (!formData.description) { setError('Description is required'); return; }
    
    const validLines = lines.filter(line => 
      line.account_id && (parseFloat(line.debit) > 0 || parseFloat(line.credit) > 0)
    );
    
    if (validLines.length < 2) { setError('At least two valid lines are required'); return; }
    if (!isBalanced) { setError(`Entry not balanced. Debits: $${totalDebit.toFixed(2)}, Credits: $${totalCredit.toFixed(2)}`); return; }
    
    setSaving(true);
    try {
      const payload = {
        ...formData,
        lines: validLines.map(line => ({
          account_id: parseInt(line.account_id),
          description: line.description || null,
          debit: parseFloat(line.debit) || 0,
          credit: parseFloat(line.credit) || 0,
          class_id: line.class_id ? parseInt(line.class_id) : null,
        })),
      };
      
      if (editEntry) await journalEntriesService.update(editEntry.id, payload);
      else await journalEntriesService.create(payload);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 8, border: '1px solid #e5e7eb', padding: 24, marginBottom: 24 }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600 }}>
        {editEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
      </h2>
      
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Date *</label>
            <input type="date" value={formData.entry_date} onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Reference</label>
            <input type="text" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="Check #, Invoice #" style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Description *</label>
            <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="January depreciation, Year-end adjustment" style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }} required />
          </div>
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 500 }}>Entry Lines</label>
            <button type="button" onClick={handleAddLine} style={{ padding: '6px 12px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}>+ Add Line</button>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, borderBottom: '1px solid #e5e7eb' }}>Account</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, borderBottom: '1px solid #e5e7eb', width: '20%' }}>Description</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, borderBottom: '1px solid #e5e7eb', width: '12%' }}>Debit</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, borderBottom: '1px solid #e5e7eb', width: '12%' }}>Credit</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, borderBottom: '1px solid #e5e7eb', width: '15%' }}>Class</th>
                <th style={{ padding: '10px 12px', width: 40, borderBottom: '1px solid #e5e7eb' }}></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={index}>
                  <td style={{ padding: '6px 4px' }}>
                    <select value={line.account_id} onChange={(e) => handleLineChange(index, 'account_id', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 13 }}>
                      <option value="">Select Account</option>
                      {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.account_code} - {acc.name}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    <input type="text" value={line.description} onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                      placeholder="Line memo" style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 13 }} />
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    <input type="number" step="0.01" min="0" value={line.debit} onChange={(e) => handleLineChange(index, 'debit', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 13, textAlign: 'right' }} />
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    <input type="number" step="0.01" min="0" value={line.credit} onChange={(e) => handleLineChange(index, 'credit', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 13, textAlign: 'right' }} />
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    <select value={line.class_id} onChange={(e) => handleLineChange(index, 'class_id', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 13 }}>
                      <option value="">No Class</option>
                      {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                    <button type="button" onClick={() => handleRemoveLine(index)} disabled={lines.length <= 2}
                      style={{ padding: '4px 8px', backgroundColor: lines.length <= 2 ? '#f3f4f6' : '#fef2f2', color: lines.length <= 2 ? '#9ca3af' : '#dc2626', border: 'none', borderRadius: 4, cursor: lines.length <= 2 ? 'not-allowed' : 'pointer', fontSize: 16 }}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f9fafb', fontWeight: 600 }}>
                <td colSpan={2} style={{ padding: '10px 12px', textAlign: 'right' }}>Totals:</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace' }}>${totalDebit.toFixed(2)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace' }}>${totalCredit.toFixed(2)}</td>
                <td colSpan={2} style={{ padding: '10px 12px' }}>
                  {isBalanced ? <span style={{ color: '#16a34a' }}>✓ Balanced</span> : <span style={{ color: '#dc2626' }}>✗ Diff: ${Math.abs(totalDebit - totalCredit).toFixed(2)}</span>}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Notes</label>
          <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical' }} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={formData.post_immediately} onChange={(e) => setFormData({ ...formData, post_immediately: e.target.checked })} />
            Post immediately
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={onCancel} style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
            <button type="submit" disabled={saving || !isBalanced}
              style={{ padding: '10px 20px', backgroundColor: saving || !isBalanced ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: saving || !isBalanced ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 500 }}>
              {saving ? 'Saving...' : editEntry ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function JournalEntriesView() {
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [viewEntry, setViewEntry] = useState(null);
  const [message, setMessage] = useState(null);
  const [filters, setFilters] = useState({ status: '', search: '' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [entriesData, accountsData, classesData] = await Promise.all([
        journalEntriesService.getAll({ ...filters, limit: 100 }),
        accountingService.getAccounts(),
        classesService.getAll(),
      ]);
      setEntries(entriesData.data || []);
      setAccounts(Array.isArray(accountsData) ? accountsData : accountsData.data || []);
      setClasses(Array.isArray(classesData) ? classesData : classesData.data || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load journal entries' });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleViewEntry = async (id) => {
    try {
      const result = await journalEntriesService.getById(id);
      setViewEntry(result.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load entry details' });
    }
  };

  const handleEditEntry = async (entry) => {
    if (entry.status !== 'draft') { setMessage({ type: 'error', text: 'Only draft entries can be edited' }); return; }
    try {
      const result = await journalEntriesService.getById(entry.id);
      setEditEntry(result.data);
      setShowForm(true);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load entry for editing' });
    }
  };

  const handlePostEntry = async (entry) => {
    if (!window.confirm(`Post entry ${entry.entry_number}?`)) return;
    try {
      await journalEntriesService.post(entry.id);
      setMessage({ type: 'success', text: `Entry ${entry.entry_number} posted` });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to post entry' });
    }
  };

  const handleVoidEntry = async (entry) => {
    const reason = window.prompt(`Void entry ${entry.entry_number}? Enter reason:`);
    if (reason === null) return;
    try {
      await journalEntriesService.void(entry.id, reason);
      setMessage({ type: 'success', text: `Entry ${entry.entry_number} voided` });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to void entry' });
    }
  };

  const handleDeleteEntry = async (entry) => {
    if (!window.confirm(`Delete draft entry ${entry.entry_number}?`)) return;
    try {
      await journalEntriesService.delete(entry.id);
      setMessage({ type: 'success', text: `Entry ${entry.entry_number} deleted` });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete entry' });
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: { backgroundColor: '#fef3c7', color: '#d97706' },
      posted: { backgroundColor: '#d1fae5', color: '#059669' },
      voided: { backgroundColor: '#fee2e2', color: '#dc2626' },
    };
    return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, ...styles[status] }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Journal Entries</h1>
        <button onClick={() => { setShowForm(true); setEditEntry(null); }}
          style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
          + New Journal Entry
        </button>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', borderRadius: 6, marginBottom: 20, backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4', color: message.type === 'error' ? '#dc2626' : '#16a34a' }}>
          {message.text}
        </div>
      )}

      {showForm && <JournalEntryForm accounts={accounts} classes={classes} onSave={() => { setShowForm(false); setEditEntry(null); setMessage({ type: 'success', text: 'Journal entry saved' }); loadData(); }} onCancel={() => { setShowForm(false); setEditEntry(null); }} editEntry={editEntry} />}

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}>
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="posted">Posted</option>
          <option value="voided">Voided</option>
        </select>
        <input type="text" placeholder="Search entries..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, width: 250 }} />
      </div>

      {viewEntry && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: 8, padding: 24, maxWidth: 800, width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>{viewEntry.entry_number}</h2>
              <button onClick={() => setViewEntry(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div><strong>Date:</strong> {viewEntry.entry_date?.split('T')[0]}</div>
              <div><strong>Status:</strong> {getStatusBadge(viewEntry.status)}</div>
              <div><strong>Reference:</strong> {viewEntry.reference || '—'}</div>
              <div><strong>Source:</strong> {viewEntry.source_type || 'manual'}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Description:</strong> {viewEntry.description}</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Account</th>
                  <th style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Debit</th>
                  <th style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Credit</th>
                  <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Class</th>
                </tr>
              </thead>
              <tbody>
                {viewEntry.lines?.map((line, i) => (
                  <tr key={i}>
                    <td style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>{line.account_code} - {line.account_name}</td>
                    <td style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace' }}>{parseFloat(line.debit) > 0 ? `$${parseFloat(line.debit).toFixed(2)}` : ''}</td>
                    <td style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace' }}>{parseFloat(line.credit) > 0 ? `$${parseFloat(line.credit).toFixed(2)}` : ''}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>{line.class_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 600, backgroundColor: '#f9fafb' }}>
                  <td style={{ padding: 10, textAlign: 'right' }}>Totals:</td>
                  <td style={{ padding: 10, textAlign: 'right', fontFamily: 'monospace' }}>${parseFloat(viewEntry.total_debit).toFixed(2)}</td>
                  <td style={{ padding: 10, textAlign: 'right', fontFamily: 'monospace' }}>${parseFloat(viewEntry.total_credit).toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, backgroundColor: '#f9fafb', borderRadius: 8, border: '2px dashed #e5e7eb' }}>
          <h3 style={{ margin: '0 0 8px' }}>No Journal Entries</h3>
          <p style={{ margin: 0, color: '#6b7280' }}>Create your first journal entry for depreciation, adjustments, or other transactions.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Entry #</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Description</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Amount</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleViewEntry(entry.id)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 500, textDecoration: 'underline' }}>{entry.entry_number}</button>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{entry.entry_date?.split('T')[0]}</td>
                  <td style={{ padding: '12px 16px' }}>{entry.description?.substring(0, 50)}{entry.description?.length > 50 ? '...' : ''}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace' }}>${parseFloat(entry.total_debit).toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{getStatusBadge(entry.status)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      {entry.status === 'draft' && (
                        <>
                          <button onClick={() => handleEditEntry(entry)} style={{ padding: '4px 10px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 4, backgroundColor: 'white', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handlePostEntry(entry)} style={{ padding: '4px 10px', fontSize: 12, border: 'none', borderRadius: 4, backgroundColor: '#059669', color: 'white', cursor: 'pointer' }}>Post</button>
                          <button onClick={() => handleDeleteEntry(entry)} style={{ padding: '4px 10px', fontSize: 12, border: '1px solid #fecaca', borderRadius: 4, backgroundColor: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}>Delete</button>
                        </>
                      )}
                      {entry.status === 'posted' && (
                        <button onClick={() => handleVoidEntry(entry)} style={{ padding: '4px 10px', fontSize: 12, border: '1px solid #fecaca', borderRadius: 4, backgroundColor: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}>Void</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
