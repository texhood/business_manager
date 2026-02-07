/**
 * FixedAssetsView Component
 * Asset register with CRUD, depreciation schedule, posting, and disposal.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { fixedAssetsService, accountingService, classesService } from '../../services/api';
import api from '../../services/api';

// ============================================================================
// SHARED STYLES
// ============================================================================

const S = {
  card:       { backgroundColor: 'white', borderRadius: 8, border: '1px solid #e5e7eb', padding: 24, marginBottom: 24 },
  label:      { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 },
  input:      { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' },
  select:     { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' },
  btnPrimary: { padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500 },
  btnCancel:  { padding: '10px 20px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  btnSuccess: { padding: '6px 14px', fontSize: 12, border: 'none', borderRadius: 4, backgroundColor: '#059669', color: 'white', cursor: 'pointer' },
  btnDanger:  { padding: '6px 14px', fontSize: 12, border: '1px solid #fecaca', borderRadius: 4, backgroundColor: '#fef2f2', color: '#dc2626', cursor: 'pointer' },
  btnSmall:   { padding: '4px 10px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 4, backgroundColor: 'white', cursor: 'pointer' },
  thCell:     { padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: 12, fontWeight: 600 },
  tdCell:     { padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 14 },
  money:      { fontFamily: 'monospace', textAlign: 'right' },
  error:      { padding: '12px 16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: 6, marginBottom: 16 },
  success:    { padding: '12px 16px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: 6, marginBottom: 16 },
  overlay:    { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:      { backgroundColor: 'white', borderRadius: 8, padding: 24, maxWidth: 960, width: '95%', maxHeight: '90vh', overflow: 'auto' },
};

const fmt = (v) => `$${parseFloat(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusBadge = (status) => {
  const map = {
    active:             { bg: '#d1fae5', fg: '#059669' },
    fully_depreciated:  { bg: '#fef3c7', fg: '#d97706' },
    disposed:           { bg: '#fee2e2', fg: '#dc2626' },
    inactive:           { bg: '#f3f4f6', fg: '#6b7280' },
  };
  const c = map[status] || map.inactive;
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, backgroundColor: c.bg, color: c.fg }}>{label}</span>;
};

const methodLabel = (m) => (m || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

const CATEGORIES = [
  'Vehicles','Equipment','Buildings','Land','Livestock Infrastructure',
  'POS Hardware','Furniture','Trailers','Tools','Technology','Other',
];

// ============================================================================
// ASSET FORM
// ============================================================================

function AssetForm({ accounts, classes, vendors, onSave, onCancel, editAsset }) {
  const blankForm = {
    name: '', description: '', category: 'Equipment',
    serial_number: '', make: '', model: '', year: '', location: '', barcode: '',
    purchase_date: new Date().toISOString().split('T')[0],
    in_service_date: '', purchase_cost: '', vendor_id: '',
    depreciation_method: 'straight_line', useful_life_months: '',
    salvage_value: '0', declining_balance_rate: '',
    asset_account_id: '', accumulated_depreciation_account_id: '', depreciation_expense_account_id: '',
    class_id: '', notes: '',
  };

  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editAsset) {
      setForm({
        name: editAsset.name || '',
        description: editAsset.description || '',
        category: editAsset.category || 'Equipment',
        serial_number: editAsset.serial_number || '',
        make: editAsset.make || '',
        model: editAsset.model || '',
        year: editAsset.year || '',
        location: editAsset.location || '',
        barcode: editAsset.barcode || '',
        purchase_date: editAsset.purchase_date?.split('T')[0] || '',
        in_service_date: editAsset.in_service_date?.split('T')[0] || '',
        purchase_cost: editAsset.purchase_cost || '',
        vendor_id: editAsset.vendor_id || '',
        depreciation_method: editAsset.depreciation_method || 'straight_line',
        useful_life_months: editAsset.useful_life_months || '',
        salvage_value: editAsset.salvage_value || '0',
        declining_balance_rate: editAsset.declining_balance_rate || '',
        asset_account_id: editAsset.asset_account_id || '',
        accumulated_depreciation_account_id: editAsset.accumulated_depreciation_account_id || '',
        depreciation_expense_account_id: editAsset.depreciation_expense_account_id || '',
        class_id: editAsset.class_id || '',
        notes: editAsset.notes || '',
      });
    }
  }, [editAsset]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const assetAccounts = accounts.filter(a => a.account_type === 'Asset' || parseInt(a.account_code) >= 1000 && parseInt(a.account_code) < 2000);
  const expenseAccounts = accounts.filter(a => a.account_type === 'Expense' || parseInt(a.account_code) >= 5000);
  const allAccounts = accounts; // for contra-asset which is also "Asset" type

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.category || !form.purchase_date || !form.purchase_cost) {
      setError('Name, category, purchase date, and purchase cost are required'); return;
    }
    if (!form.asset_account_id || !form.accumulated_depreciation_account_id || !form.depreciation_expense_account_id) {
      setError('All three GL account mappings are required'); return;
    }
    if (form.depreciation_method !== 'none' && !form.useful_life_months) {
      setError('Useful life (months) is required for depreciable assets'); return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        purchase_cost: parseFloat(form.purchase_cost),
        salvage_value: parseFloat(form.salvage_value) || 0,
        useful_life_months: form.useful_life_months ? parseInt(form.useful_life_months, 10) : null,
        year: form.year ? parseInt(form.year, 10) : null,
        declining_balance_rate: form.declining_balance_rate ? parseFloat(form.declining_balance_rate) : null,
        asset_account_id: parseInt(form.asset_account_id, 10),
        accumulated_depreciation_account_id: parseInt(form.accumulated_depreciation_account_id, 10),
        depreciation_expense_account_id: parseInt(form.depreciation_expense_account_id, 10),
        class_id: form.class_id ? parseInt(form.class_id, 10) : null,
        vendor_id: form.vendor_id ? parseInt(form.vendor_id, 10) : null,
        in_service_date: form.in_service_date || null,
      };

      if (editAsset) await fixedAssetsService.update(editAsset.id, payload);
      else await fixedAssetsService.create(payload);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const needsRate = form.depreciation_method === 'declining_balance';
  const isNone = form.depreciation_method === 'none';

  return (
    <div style={S.card}>
      <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600 }}>
        {editAsset ? 'Edit Asset' : 'New Fixed Asset'}
      </h2>

      {error && <div style={S.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={S.label}>Name *</label>
            <input style={S.input} value={form.name} onChange={set('name')} placeholder="2022 Ford F-150" required />
          </div>
          <div>
            <label style={S.label}>Category *</label>
            <select style={S.select} value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Class</label>
            <select style={S.select} value={form.class_id} onChange={set('class_id')}>
              <option value="">No Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Identification */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          <div><label style={S.label}>Serial #</label><input style={S.input} value={form.serial_number} onChange={set('serial_number')} /></div>
          <div><label style={S.label}>Make</label><input style={S.input} value={form.make} onChange={set('make')} placeholder="Ford" /></div>
          <div><label style={S.label}>Model</label><input style={S.input} value={form.model} onChange={set('model')} placeholder="F-150" /></div>
          <div><label style={S.label}>Year</label><input style={S.input} type="number" value={form.year} onChange={set('year')} placeholder="2022" /></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          <div><label style={S.label}>Location</label><input style={S.input} value={form.location} onChange={set('location')} placeholder="Main barn" /></div>
          <div><label style={S.label}>Barcode</label><input style={S.input} value={form.barcode} onChange={set('barcode')} /></div>
          <div>
            <label style={S.label}>Vendor</label>
            <select style={S.select} value={form.vendor_id} onChange={set('vendor_id')}>
              <option value="">— Select —</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
        </div>

        {/* Acquisition */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          <div><label style={S.label}>Purchase Date *</label><input style={S.input} type="date" value={form.purchase_date} onChange={set('purchase_date')} required /></div>
          <div><label style={S.label}>In-Service Date</label><input style={S.input} type="date" value={form.in_service_date} onChange={set('in_service_date')} /></div>
          <div><label style={S.label}>Purchase Cost *</label><input style={S.input} type="number" step="0.01" min="0" value={form.purchase_cost} onChange={set('purchase_cost')} required /></div>
          <div><label style={S.label}>Salvage Value</label><input style={S.input} type="number" step="0.01" min="0" value={form.salvage_value} onChange={set('salvage_value')} /></div>
        </div>

        {/* Depreciation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={S.label}>Depreciation Method *</label>
            <select style={S.select} value={form.depreciation_method} onChange={set('depreciation_method')}>
              <option value="straight_line">Straight Line</option>
              <option value="declining_balance">Declining Balance</option>
              <option value="double_declining">Double Declining</option>
              <option value="sum_of_years_digits">Sum of Years' Digits</option>
              <option value="none">None (Land, etc.)</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Useful Life (Months){!isNone ? ' *' : ''}</label>
            <input style={S.input} type="number" min="1" value={form.useful_life_months} onChange={set('useful_life_months')} disabled={isNone} required={!isNone} />
          </div>
          {needsRate && (
            <div>
              <label style={S.label}>Annual Rate %</label>
              <input style={S.input} type="number" step="0.01" min="0" max="100" value={form.declining_balance_rate} onChange={set('declining_balance_rate')} />
            </div>
          )}
        </div>

        {/* GL Accounts */}
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px', color: '#374151' }}>GL Account Mapping</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={S.label}>Asset Account *</label>
            <select style={S.select} value={form.asset_account_id} onChange={set('asset_account_id')} required>
              <option value="">Select Account</option>
              {allAccounts.map(a => <option key={a.id} value={a.id}>{a.account_code} - {a.name}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Accum. Depreciation Account *</label>
            <select style={S.select} value={form.accumulated_depreciation_account_id} onChange={set('accumulated_depreciation_account_id')} required>
              <option value="">Select Account</option>
              {allAccounts.map(a => <option key={a.id} value={a.id}>{a.account_code} - {a.name}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Depreciation Expense Account *</label>
            <select style={S.select} value={form.depreciation_expense_account_id} onChange={set('depreciation_expense_account_id')} required>
              <option value="">Select Account</option>
              {allAccounts.map(a => <option key={a.id} value={a.id}>{a.account_code} - {a.name}</option>)}
            </select>
          </div>
        </div>

        {/* Description / Notes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div><label style={S.label}>Description</label><textarea style={{ ...S.input, resize: 'vertical' }} rows={2} value={form.description} onChange={set('description')} /></div>
          <div><label style={S.label}>Notes</label><textarea style={{ ...S.input, resize: 'vertical' }} rows={2} value={form.notes} onChange={set('notes')} /></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" onClick={onCancel} style={S.btnCancel}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...S.btnPrimary, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : editAsset ? 'Update Asset' : 'Create Asset'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// DISPOSAL MODAL
// ============================================================================

function DisposalModal({ asset, accounts, onDispose, onClose }) {
  const [form, setForm] = useState({
    disposal_date: new Date().toISOString().split('T')[0],
    disposal_method: 'sold',
    disposal_amount: '0',
    disposal_notes: '',
    proceeds_account_id: '',
    loss_gain_account_id: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }));

  const proceeds = parseFloat(form.disposal_amount) || 0;
  const bookValue = parseFloat(asset.current_book_value) || 0;
  const gainLoss = proceeds - bookValue;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.proceeds_account_id || !form.loss_gain_account_id) {
      setError('Both GL accounts are required for the disposal journal entry'); return;
    }
    setSaving(true);
    try {
      await onDispose({
        ...form,
        disposal_amount: proceeds,
        proceeds_account_id: parseInt(form.proceeds_account_id, 10),
        loss_gain_account_id: parseInt(form.loss_gain_account_id, 10),
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to dispose');
      setSaving(false);
    }
  };

  return (
    <div style={S.overlay}>
      <div style={{ ...S.modal, maxWidth: 640 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Dispose Asset: {asset.asset_number}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ padding: 12, backgroundColor: '#f9fafb', borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
          <strong>{asset.name}</strong> — Current book value: <strong>{fmt(asset.current_book_value)}</strong>
        </div>

        {error && <div style={S.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label style={S.label}>Disposal Date *</label><input style={S.input} type="date" value={form.disposal_date} onChange={set('disposal_date')} required /></div>
            <div>
              <label style={S.label}>Method *</label>
              <select style={S.select} value={form.disposal_method} onChange={set('disposal_method')}>
                {['sold','scrapped','traded_in','donated','lost','stolen','written_off'].map(m =>
                  <option key={m} value={m}>{m.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>
                )}
              </select>
            </div>
            <div><label style={S.label}>Proceeds</label><input style={S.input} type="number" step="0.01" min="0" value={form.disposal_amount} onChange={set('disposal_amount')} /></div>
          </div>

          <div style={{ padding: 12, borderRadius: 6, marginBottom: 16, backgroundColor: gainLoss >= 0 ? '#f0fdf4' : '#fef2f2', fontSize: 14 }}>
            {gainLoss >= 0
              ? <span style={{ color: '#059669' }}>Gain on disposal: {fmt(gainLoss)}</span>
              : <span style={{ color: '#dc2626' }}>Loss on disposal: ({fmt(Math.abs(gainLoss))})</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={S.label}>Proceeds Account (Debit) *</label>
              <select style={S.select} value={form.proceeds_account_id} onChange={set('proceeds_account_id')} required>
                <option value="">Select Account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.account_code} - {a.name}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Gain/Loss Account *</label>
              <select style={S.select} value={form.loss_gain_account_id} onChange={set('loss_gain_account_id')} required>
                <option value="">Select Account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.account_code} - {a.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Notes</label>
            <textarea style={{ ...S.input, resize: 'vertical' }} rows={2} value={form.disposal_notes} onChange={set('disposal_notes')} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={onClose} style={S.btnCancel}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...S.btnPrimary, backgroundColor: '#dc2626', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Processing…' : 'Record Disposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// ASSET DETAIL MODAL
// ============================================================================

function AssetDetail({ asset, onClose, onPostDepreciation, onDispose, onEdit }) {
  const schedule = asset.schedule || [];
  const nextUnposted = schedule.find(r => !r.is_posted);
  const postedCount = schedule.filter(r => r.is_posted).length;
  const totalPeriods = schedule.length;

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>{asset.asset_number} — {asset.name}</h2>
            <div style={{ marginTop: 4, fontSize: 13, color: '#6b7280' }}>
              {asset.category} · {methodLabel(asset.depreciation_method)}
              {asset.useful_life_months ? ` · ${asset.useful_life_months} months` : ''}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {[
            ['Purchase Cost', fmt(asset.purchase_cost)],
            ['Salvage Value', fmt(asset.salvage_value)],
            ['Accum. Depr.', fmt(asset.accumulated_depreciation)],
            ['Book Value', fmt(asset.current_book_value)],
            ['Purchase Date', asset.purchase_date?.split('T')[0]],
            ['In-Service', asset.in_service_date?.split('T')[0] || '—'],
            ['Status', null, statusBadge(asset.status)],
            ['Class', asset.class_name || '—'],
          ].map(([label, val, el], i) => (
            <div key={i} style={{ padding: 12, backgroundColor: '#f9fafb', borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{el || val}</div>
            </div>
          ))}
        </div>

        {/* Identification details */}
        {(asset.serial_number || asset.make || asset.model || asset.location || asset.vendor_name) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20, fontSize: 13 }}>
            {asset.serial_number && <div><span style={{ color: '#6b7280' }}>Serial:</span> {asset.serial_number}</div>}
            {asset.make && <div><span style={{ color: '#6b7280' }}>Make:</span> {asset.make}</div>}
            {asset.model && <div><span style={{ color: '#6b7280' }}>Model:</span> {asset.model}</div>}
            {asset.location && <div><span style={{ color: '#6b7280' }}>Location:</span> {asset.location}</div>}
            {asset.vendor_name && <div><span style={{ color: '#6b7280' }}>Vendor:</span> {asset.vendor_name}</div>}
          </div>
        )}

        {/* GL Mapping */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20, fontSize: 13 }}>
          <div style={{ padding: 8, backgroundColor: '#eff6ff', borderRadius: 4 }}>
            <div style={{ color: '#6b7280', fontSize: 11 }}>Asset Account</div>
            <div>{asset.asset_account_code} - {asset.asset_account_name}</div>
          </div>
          <div style={{ padding: 8, backgroundColor: '#eff6ff', borderRadius: 4 }}>
            <div style={{ color: '#6b7280', fontSize: 11 }}>Accum. Depr. Account</div>
            <div>{asset.accum_depr_account_code} - {asset.accum_depr_account_name}</div>
          </div>
          <div style={{ padding: 8, backgroundColor: '#eff6ff', borderRadius: 4 }}>
            <div style={{ color: '#6b7280', fontSize: 11 }}>Expense Account</div>
            <div>{asset.depr_expense_account_code} - {asset.depr_expense_account_name}</div>
          </div>
        </div>

        {/* Actions */}
        {asset.status !== 'disposed' && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button onClick={onEdit} style={S.btnSmall}>✏️ Edit</button>
            {nextUnposted && (
              <button onClick={() => onPostDepreciation(nextUnposted.period_number)} style={S.btnSuccess}>
                📋 Post Period {nextUnposted.period_number} ({nextUnposted.period_date})
              </button>
            )}
            {nextUnposted && totalPeriods > 1 && (
              <button onClick={() => onPostDepreciation(null)} style={{ ...S.btnSuccess, backgroundColor: '#0284c7' }}>
                📋 Post All Remaining ({totalPeriods - postedCount})
              </button>
            )}
            <button onClick={onDispose} style={S.btnDanger}>🗑️ Dispose</button>
          </div>
        )}

        {/* Disposal info */}
        {asset.status === 'disposed' && (
          <div style={{ padding: 12, backgroundColor: '#fef2f2', borderRadius: 6, marginBottom: 20, fontSize: 14 }}>
            <strong>Disposed</strong> on {asset.disposal_date?.split('T')[0]} via {(asset.disposal_method || '').replace(/_/g,' ')}
            {parseFloat(asset.disposal_amount) > 0 && <span> — Proceeds: {fmt(asset.disposal_amount)}</span>}
            {asset.disposal_notes && <div style={{ marginTop: 4, color: '#6b7280' }}>{asset.disposal_notes}</div>}
          </div>
        )}

        {/* Depreciation Schedule */}
        {schedule.length > 0 && (
          <>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>
              Depreciation Schedule ({postedCount}/{totalPeriods} posted)
            </h3>
            <div style={{ maxHeight: 320, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 6 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', position: 'sticky', top: 0 }}>
                    <th style={{ ...S.thCell, padding: '8px 12px' }}>#</th>
                    <th style={{ ...S.thCell, padding: '8px 12px' }}>Period Date</th>
                    <th style={{ ...S.thCell, padding: '8px 12px', textAlign: 'right' }}>Amount</th>
                    <th style={{ ...S.thCell, padding: '8px 12px', textAlign: 'right' }}>Accumulated</th>
                    <th style={{ ...S.thCell, padding: '8px 12px', textAlign: 'right' }}>Book Value</th>
                    <th style={{ ...S.thCell, padding: '8px 12px', textAlign: 'center' }}>Status</th>
                    <th style={{ ...S.thCell, padding: '8px 12px' }}>JE</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map(row => (
                    <tr key={row.id} style={{ backgroundColor: row.is_posted ? '#f0fdf4' : 'white' }}>
                      <td style={{ ...S.tdCell, padding: '6px 12px' }}>{row.period_number}</td>
                      <td style={{ ...S.tdCell, padding: '6px 12px' }}>{row.period_date?.split('T')[0]}</td>
                      <td style={{ ...S.tdCell, padding: '6px 12px', ...S.money }}>{fmt(row.depreciation_amount)}</td>
                      <td style={{ ...S.tdCell, padding: '6px 12px', ...S.money }}>{fmt(row.accumulated_total)}</td>
                      <td style={{ ...S.tdCell, padding: '6px 12px', ...S.money }}>{fmt(row.book_value_after)}</td>
                      <td style={{ ...S.tdCell, padding: '6px 12px', textAlign: 'center' }}>
                        {row.is_posted
                          ? <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, backgroundColor: '#d1fae5', color: '#059669' }}>Posted</span>
                          : <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, backgroundColor: '#f3f4f6', color: '#6b7280' }}>Pending</span>}
                      </td>
                      <td style={{ ...S.tdCell, padding: '6px 12px', fontSize: 12 }}>{row.journal_entry_number || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {schedule.length === 0 && asset.depreciation_method !== 'none' && (
          <div style={{ textAlign: 'center', padding: 24, color: '#6b7280', fontSize: 14 }}>
            No depreciation schedule generated.
          </div>
        )}

        {asset.notes && (
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f9fafb', borderRadius: 6, fontSize: 13 }}>
            <strong>Notes:</strong> {asset.notes}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN VIEW
// ============================================================================

export default function FixedAssetsView() {
  const [assets, setAssets] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [viewAsset, setViewAsset] = useState(null);
  const [showDisposal, setShowDisposal] = useState(null);
  const [message, setMessage] = useState(null);
  const [filters, setFilters] = useState({ status: '', category: '', search: '' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [assetsData, accountsData, classesData, vendorsData, summaryData] = await Promise.all([
        fixedAssetsService.getAll({ ...filters, limit: 200 }),
        accountingService.getAccounts(),
        classesService.getAll(),
        api.get('/vendors').then(r => r.data),
        fixedAssetsService.getSummary(),
      ]);
      setAssets(assetsData.data || []);
      setAccounts(Array.isArray(accountsData) ? accountsData : accountsData.data || []);
      setClasses(Array.isArray(classesData) ? classesData : classesData.data || []);
      setVendors(vendorsData.data || []);
      setSummary(summaryData.data || null);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (message) { const t = setTimeout(() => setMessage(null), 5000); return () => clearTimeout(t); }
  }, [message]);

  const handleView = async (id) => {
    try {
      const result = await fixedAssetsService.getById(id);
      setViewAsset(result.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load asset details' });
    }
  };

  const handleEdit = (asset) => {
    setEditAsset(asset || viewAsset);
    setViewAsset(null);
    setShowForm(true);
  };

  const handlePostDepreciation = async (throughPeriod) => {
    const label = throughPeriod ? `period ${throughPeriod}` : 'all remaining periods';
    if (!window.confirm(`Post depreciation through ${label}? This creates journal entries that affect GL balances.`)) return;
    try {
      const result = await fixedAssetsService.postDepreciation(viewAsset.id, throughPeriod);
      setMessage({ type: 'success', text: `Posted ${result.data.periods_posted} depreciation period(s)` });
      // Reload the detail
      const fresh = await fixedAssetsService.getById(viewAsset.id);
      setViewAsset(fresh.data);
      loadData(); // refresh list + summary
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to post depreciation' });
    }
  };

  const handleDispose = async (disposeData) => {
    await fixedAssetsService.dispose(showDisposal.id, disposeData);
    setShowDisposal(null);
    setViewAsset(null);
    setMessage({ type: 'success', text: 'Asset disposed successfully' });
    loadData();
  };

  const handleDelete = async (asset) => {
    if (!window.confirm(`Permanently delete ${asset.asset_number}? This cannot be undone.`)) return;
    try {
      await fixedAssetsService.delete(asset.id);
      setMessage({ type: 'success', text: `${asset.asset_number} deleted` });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Cannot delete' });
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Fixed Asset Register</h1>
        <button onClick={() => { setShowForm(true); setEditAsset(null); }} style={S.btnPrimary}>+ New Asset</button>
      </div>

      {message && <div style={message.type === 'error' ? S.error : S.success}>{message.text}</div>}

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            ['Total Assets', summary.total_assets, '#2563eb'],
            ['Active', summary.active_count, '#059669'],
            ['Total Cost', fmt(summary.total_cost), '#7c3aed'],
            ['Accum. Depr.', fmt(summary.total_accumulated), '#d97706'],
            ['Book Value', fmt(summary.total_book_value), '#0284c7'],
          ].map(([label, val, color], i) => (
            <div key={i} style={{ ...S.card, padding: 16, marginBottom: 0 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <AssetForm
          accounts={accounts} classes={classes} vendors={vendors}
          editAsset={editAsset}
          onSave={() => { setShowForm(false); setEditAsset(null); setMessage({ type: 'success', text: editAsset ? 'Asset updated' : 'Asset created with depreciation schedule' }); loadData(); }}
          onCancel={() => { setShowForm(false); setEditAsset(null); }}
        />
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <select value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="fully_depreciated">Fully Depreciated</option>
          <option value="disposed">Disposed</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={filters.category} onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="text" placeholder="Search name, number, serial…" value={filters.search}
          onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, width: 260 }} />
      </div>

      {/* Asset Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading…</div>
      ) : assets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, backgroundColor: '#f9fafb', borderRadius: 8, border: '2px dashed #e5e7eb' }}>
          <h3 style={{ margin: '0 0 8px' }}>No Fixed Assets</h3>
          <p style={{ margin: 0, color: '#6b7280' }}>Add your first asset — vehicles, equipment, buildings, and more.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={S.thCell}>Asset #</th>
                <th style={S.thCell}>Name</th>
                <th style={S.thCell}>Category</th>
                <th style={{ ...S.thCell, textAlign: 'right' }}>Cost</th>
                <th style={{ ...S.thCell, textAlign: 'right' }}>Book Value</th>
                <th style={{ ...S.thCell, textAlign: 'center' }}>Status</th>
                <th style={{ ...S.thCell, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={S.tdCell}>
                    <button onClick={() => handleView(a.id)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 500, textDecoration: 'underline', fontSize: 14 }}>
                      {a.asset_number}
                    </button>
                  </td>
                  <td style={S.tdCell}>{a.name}</td>
                  <td style={S.tdCell}>{a.category}</td>
                  <td style={{ ...S.tdCell, ...S.money }}>{fmt(a.purchase_cost)}</td>
                  <td style={{ ...S.tdCell, ...S.money }}>{fmt(a.current_book_value)}</td>
                  <td style={{ ...S.tdCell, textAlign: 'center' }}>{statusBadge(a.status)}</td>
                  <td style={{ ...S.tdCell, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button onClick={() => handleView(a.id)} style={S.btnSmall}>View</button>
                      {a.status !== 'disposed' && (
                        <>
                          <button onClick={() => handleEdit(a)} style={S.btnSmall}>Edit</button>
                          <button onClick={() => handleDelete(a)} style={S.btnDanger}>Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {viewAsset && (
        <AssetDetail
          asset={viewAsset}
          onClose={() => setViewAsset(null)}
          onPostDepreciation={handlePostDepreciation}
          onDispose={() => { setShowDisposal(viewAsset); }}
          onEdit={() => handleEdit(viewAsset)}
        />
      )}

      {/* Disposal Modal */}
      {showDisposal && (
        <DisposalModal
          asset={showDisposal}
          accounts={accounts}
          onDispose={handleDispose}
          onClose={() => setShowDisposal(null)}
        />
      )}
    </div>
  );
}
