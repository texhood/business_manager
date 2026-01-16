/**
 * Pasture Treatments View Component
 * Aggregate view of all treatments (fertilizer, herbicide, etc.) across all pastures
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { pasturesService } from '../../services/api';

// ============================================================================
// TREATMENT MODAL
// ============================================================================

const TreatmentModal = ({ treatment, pastures, onSave, onClose }) => {
  const [form, setForm] = useState(treatment || { treatment_type: 'fertilizer' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pasture_id) {
      alert('Please select a pasture');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{treatment ? 'Edit Treatment' : 'Add Treatment'}</h2>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>Pasture <span className="required">*</span></label>
                <select
                  required
                  value={form.pasture_id || ''}
                  onChange={(e) => setForm({ ...form, pasture_id: e.target.value })}
                  disabled={!!treatment}
                >
                  <option value="">Select pasture...</option>
                  {pastures.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Treatment Date <span className="required">*</span></label>
                <input
                  type="date"
                  required
                  value={form.treatment_date ? form.treatment_date.split('T')[0] : ''}
                  onChange={(e) => setForm({ ...form, treatment_date: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Treatment Type <span className="required">*</span></label>
                <select
                  required
                  value={form.treatment_type || 'fertilizer'}
                  onChange={(e) => setForm({ ...form, treatment_type: e.target.value })}
                >
                  <option value="fertilizer">Fertilizer</option>
                  <option value="herbicide">Herbicide</option>
                  <option value="pesticide">Pesticide</option>
                  <option value="lime">Lime</option>
                  <option value="seeding">Seeding</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={form.product_name || ''}
                  onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                  placeholder="Brand/product used"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Application Rate</label>
                <input
                  type="text"
                  value={form.application_rate || ''}
                  onChange={(e) => setForm({ ...form, application_rate: e.target.value })}
                  placeholder="e.g., 200 lbs/acre"
                />
              </div>
              <div className="form-group">
                <label>Total Amount</label>
                <input
                  type="text"
                  value={form.total_amount || ''}
                  onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                  placeholder="e.g., 2000 lbs"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.cost || ''}
                  onChange={(e) => setForm({ ...form, cost: e.target.value || null })}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Applied By</label>
                <input
                  type="text"
                  value={form.applied_by || ''}
                  onChange={(e) => setForm({ ...form, applied_by: e.target.value })}
                  placeholder="Person or company"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                rows="3"
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Weather conditions, observations, etc."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN TREATMENTS VIEW
// ============================================================================

const PastureTreatmentsView = () => {
  const [treatments, setTreatments] = useState([]);
  const [pastures, setPastures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    pasture_id: '',
    treatment_type: '',
    year: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const pasturesData = await pasturesService.getAll({ active_only: true });
      const pasturesList = pasturesData || [];
      setPastures(pasturesList);

      const allTreatments = [];
      for (const pasture of pasturesList) {
        try {
          const treatmentsData = await pasturesService.getTreatments(pasture.id);
          if (treatmentsData && treatmentsData.length > 0) {
            const treatmentsWithPasture = treatmentsData.map(t => ({
              ...t,
              pasture_name: pasture.name,
              pasture_id: pasture.id
            }));
            allTreatments.push(...treatmentsWithPasture);
          }
        } catch (err) {
          // Skip pastures with no treatments
        }
      }
      
      allTreatments.sort((a, b) => new Date(b.treatment_date) - new Date(a.treatment_date));
      setTreatments(allTreatments);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Get unique years for filter
  const years = [...new Set(treatments.map(t => new Date(t.treatment_date).getFullYear()))].sort((a, b) => b - a);

  const filteredTreatments = treatments.filter(t => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        t.pasture_name?.toLowerCase().includes(searchLower) ||
        t.product_name?.toLowerCase().includes(searchLower) ||
        t.applied_by?.toLowerCase().includes(searchLower) ||
        t.notes?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (filters.pasture_id && t.pasture_id !== parseInt(filters.pasture_id)) return false;
    if (filters.treatment_type && t.treatment_type !== filters.treatment_type) return false;
    if (filters.year && new Date(t.treatment_date).getFullYear() !== parseInt(filters.year)) return false;
    return true;
  });

  // Calculate totals
  const totalCost = treatments.filter(t => t.cost).reduce((sum, t) => sum + parseFloat(t.cost), 0);
  const fertilizerCount = treatments.filter(t => t.treatment_type === 'fertilizer').length;
  const herbicideCount = treatments.filter(t => t.treatment_type === 'herbicide').length;

  const handleSave = async (data) => {
    try {
      if (editingTreatment) {
        await pasturesService.updateTreatment(editingTreatment.id, data);
      } else {
        await pasturesService.createTreatment(data.pasture_id, data);
      }
      setShowModal(false);
      setEditingTreatment(null);
      loadData();
    } catch (err) {
      console.error('Failed to save treatment:', err);
      alert('Failed to save treatment');
    }
  };

  const handleDelete = async (treatment) => {
    if (!window.confirm('Are you sure you want to delete this treatment record?')) return;
    try {
      await pasturesService.deleteTreatment(treatment.id);
      loadData();
    } catch (err) {
      console.error('Failed to delete treatment:', err);
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'fertilizer': return 'badge-green';
      case 'herbicide': return 'badge-yellow';
      case 'pesticide': return 'badge-red';
      case 'lime': return 'badge-blue';
      case 'seeding': return 'badge-purple';
      default: return 'badge-gray';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Pasture Treatments</h1>
        <p className="subtitle">Track fertilizer, herbicide, and other pasture applications</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon"><Icons.Spray /></div>
          <div className="stat-content">
            <span className="stat-label">Total Treatments</span>
            <span className="stat-value">{treatments.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#059669' }}><Icons.TreeDeciduous /></div>
          <div className="stat-content">
            <span className="stat-label">Fertilizer</span>
            <span className="stat-value">{fertilizerCount}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#d97706' }}><Icons.Spray /></div>
          <div className="stat-content">
            <span className="stat-label">Herbicide</span>
            <span className="stat-value">{herbicideCount}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icons.DollarSign /></div>
          <div className="stat-content">
            <span className="stat-label">Total Cost</span>
            <span className="stat-value">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Icons.Search />
          <input
            type="text"
            placeholder="Search treatments..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="filter-select"
          value={filters.pasture_id}
          onChange={(e) => setFilters({ ...filters, pasture_id: e.target.value })}
        >
          <option value="">All Pastures</option>
          {pastures.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filters.treatment_type}
          onChange={(e) => setFilters({ ...filters, treatment_type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="fertilizer">Fertilizer</option>
          <option value="herbicide">Herbicide</option>
          <option value="pesticide">Pesticide</option>
          <option value="lime">Lime</option>
          <option value="seeding">Seeding</option>
          <option value="other">Other</option>
        </select>
        <select
          className="filter-select"
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={() => { setEditingTreatment(null); setShowModal(true); }}>
          <Icons.Plus /> Add Treatment
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-state">
            <Icons.Loader className="animate-spin" />
            <p>Loading treatments...</p>
          </div>
        ) : filteredTreatments.length === 0 ? (
          <div className="empty-state">
            <Icons.Spray />
            <h3>No treatments found</h3>
            <p>{filters.search || filters.pasture_id || filters.treatment_type || filters.year ? 'Try adjusting your filters' : 'Add your first treatment record'}</p>
            <button className="btn btn-primary" onClick={() => { setEditingTreatment(null); setShowModal(true); }}>
              <Icons.Plus /> Add Treatment
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Pasture</th>
                  <th>Type</th>
                  <th>Product</th>
                  <th>Rate</th>
                  <th>Cost</th>
                  <th>Applied By</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTreatments.map((treatment) => (
                  <tr key={treatment.id}>
                    <td>{formatDate(treatment.treatment_date)}</td>
                    <td><strong style={{ color: '#7A8B6E' }}>{treatment.pasture_name}</strong></td>
                    <td>
                      <span className={`badge ${getTypeBadgeClass(treatment.treatment_type)}`}>
                        {treatment.treatment_type}
                      </span>
                    </td>
                    <td>{treatment.product_name || '—'}</td>
                    <td>{treatment.application_rate || '—'}</td>
                    <td>{formatCurrency(treatment.cost)}</td>
                    <td>{treatment.applied_by || '—'}</td>
                    <td className="actions-col">
                      <button className="btn btn-icon btn-sm" onClick={() => { setEditingTreatment(treatment); setShowModal(true); }} title="Edit">
                        <Icons.Edit />
                      </button>
                      <button className="btn btn-icon btn-sm" onClick={() => handleDelete(treatment)} title="Delete">
                        <Icons.Trash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <TreatmentModal
          treatment={editingTreatment}
          pastures={pastures}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingTreatment(null); }}
        />
      )}
    </div>
  );
};

export default PastureTreatmentsView;
