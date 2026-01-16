/**
 * Weight Tracking View Component
 * Aggregate view of all weight records across all animals
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { animalsService } from '../../services/api';

// ============================================================================
// WEIGHT RECORD MODAL
// ============================================================================

const WeightRecordModal = ({ record, animals, onSave, onClose }) => {
  const [form, setForm] = useState(record || {});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.animal_id) {
      alert('Please select an animal');
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
          <h2>{record ? 'Edit Weight Record' : 'Add Weight Record'}</h2>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Animal <span className="required">*</span></label>
              <select
                required
                value={form.animal_id || ''}
                onChange={(e) => setForm({ ...form, animal_id: e.target.value })}
                disabled={!!record}
              >
                <option value="">Select animal...</option>
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.ear_tag} {a.name ? `(${a.name})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date <span className="required">*</span></label>
                <input
                  type="date"
                  required
                  value={form.weight_date ? form.weight_date.split('T')[0] : ''}
                  onChange={(e) => setForm({ ...form, weight_date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Weight (lbs) <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={form.weight_lbs || ''}
                  onChange={(e) => setForm({ ...form, weight_lbs: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                rows="3"
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any observations about condition, circumstances of weighing, etc."
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
// MAIN WEIGHT TRACKING VIEW
// ============================================================================

const WeightTrackingView = () => {
  const [records, setRecords] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    animal_id: '',
    dateFrom: '',
    dateTo: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all animals
      const animalsData = await animalsService.getAll({ limit: 1000, status: 'Active' });
      const animalsList = animalsData.data || [];
      setAnimals(animalsList);

      // Load weight records for all animals
      const allRecords = [];
      for (const animal of animalsList) {
        try {
          const weightData = await animalsService.getWeights(animal.id);
          if (weightData && weightData.length > 0) {
            // Add animal info and calculate change from previous
            const recordsWithAnimal = weightData.map((r, idx) => {
              const prevWeight = weightData[idx + 1]?.weight_lbs;
              const change = prevWeight ? (r.weight_lbs - prevWeight) : null;
              return {
                ...r,
                animal_ear_tag: animal.ear_tag,
                animal_name: animal.name,
                animal_id: animal.id,
                weight_change: change
              };
            });
            allRecords.push(...recordsWithAnimal);
          }
        } catch (err) {
          // Skip animals with no weight records
        }
      }
      
      // Sort by date descending
      allRecords.sort((a, b) => new Date(b.weight_date) - new Date(a.weight_date));
      setRecords(allRecords);
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

  // Filter records
  const filteredRecords = records.filter(r => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        r.animal_ear_tag?.toLowerCase().includes(searchLower) ||
        r.animal_name?.toLowerCase().includes(searchLower) ||
        r.notes?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    
    // Animal filter
    if (filters.animal_id && r.animal_id !== parseInt(filters.animal_id)) return false;
    
    // Date range filter
    if (filters.dateFrom && new Date(r.weight_date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(r.weight_date) > new Date(filters.dateTo)) return false;
    
    return true;
  });

  // Calculate statistics
  const avgWeight = records.length > 0 
    ? (records.reduce((sum, r) => sum + parseFloat(r.weight_lbs), 0) / records.length).toFixed(1)
    : 0;
  
  const recentGains = records.filter(r => r.weight_change && r.weight_change > 0).length;
  const recentLosses = records.filter(r => r.weight_change && r.weight_change < 0).length;

  const handleSave = async (data) => {
    try {
      if (editingRecord) {
        await animalsService.updateWeight(editingRecord.id, data);
      } else {
        await animalsService.createWeight(data.animal_id, data);
      }
      setShowModal(false);
      setEditingRecord(null);
      loadData();
    } catch (err) {
      console.error('Failed to save weight record:', err);
      alert('Failed to save weight record');
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm('Are you sure you want to delete this weight record?')) return;
    
    try {
      await animalsService.deleteWeight(record.id);
      loadData();
    } catch (err) {
      console.error('Failed to delete weight record:', err);
    }
  };

  const openAddModal = () => {
    setEditingRecord(null);
    setShowModal(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Weight Tracking</h1>
        <p className="subtitle">Monitor weight gain and loss across all animals</p>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon"><Icons.Scale /></div>
          <div className="stat-content">
            <span className="stat-label">Total Records</span>
            <span className="stat-value">{records.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icons.Activity /></div>
          <div className="stat-content">
            <span className="stat-label">Avg Weight</span>
            <span className="stat-value">{avgWeight} lbs</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#059669' }}><Icons.TrendingUp /></div>
          <div className="stat-content">
            <span className="stat-label">Weight Gains</span>
            <span className="stat-value" style={{ color: '#059669' }}>{recentGains}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#dc2626' }}><Icons.TrendingDown /></div>
          <div className="stat-content">
            <span className="stat-label">Weight Losses</span>
            <span className="stat-value" style={{ color: '#dc2626' }}>{recentLosses}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Icons.Search />
          <input
            type="text"
            placeholder="Search records..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="filter-select"
          value={filters.animal_id}
          onChange={(e) => setFilters({ ...filters, animal_id: e.target.value })}
        >
          <option value="">All Animals</option>
          {animals.map((a) => (
            <option key={a.id} value={a.id}>{a.ear_tag} {a.name ? `(${a.name})` : ''}</option>
          ))}
        </select>
        <input
          type="date"
          className="filter-input"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          title="From date"
        />
        <input
          type="date"
          className="filter-input"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          title="To date"
        />
        <button className="btn btn-primary" onClick={openAddModal}>
          <Icons.Plus /> Add Weight
        </button>
      </div>

      {/* Records Table */}
      <div className="card">
        {loading ? (
          <div className="loading-state">
            <Icons.Loader className="animate-spin" />
            <p>Loading weight records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state">
            <Icons.Scale />
            <h3>No weight records found</h3>
            <p>{filters.search || filters.animal_id ? 'Try adjusting your filters' : 'Add your first weight record'}</p>
            <button className="btn btn-primary" onClick={openAddModal}>
              <Icons.Plus /> Add Weight Record
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Animal</th>
                  <th>Weight</th>
                  <th>Change</th>
                  <th>Notes</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.weight_date)}</td>
                    <td>
                      <strong style={{ color: '#7A8B6E' }}>{record.animal_ear_tag}</strong>
                      {record.animal_name && <span style={{ color: '#6b7280' }}> ({record.animal_name})</span>}
                    </td>
                    <td><strong>{record.weight_lbs} lbs</strong></td>
                    <td>
                      {record.weight_change !== null ? (
                        <span className={`weight-change ${record.weight_change >= 0 ? 'gain' : 'loss'}`}>
                          {record.weight_change >= 0 ? '+' : ''}{record.weight_change.toFixed(1)} lbs
                          {record.weight_change >= 0 ? (
                            <Icons.TrendingUp style={{ width: '14px', marginLeft: '4px' }} />
                          ) : (
                            <Icons.TrendingDown style={{ width: '14px', marginLeft: '4px' }} />
                          )}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      {record.notes?.length > 40 
                        ? record.notes.substring(0, 40) + '...' 
                        : record.notes || '—'}
                    </td>
                    <td className="actions-col">
                      <button 
                        className="btn btn-icon btn-sm" 
                        onClick={() => openEditModal(record)}
                        title="Edit"
                      >
                        <Icons.Edit />
                      </button>
                      <button 
                        className="btn btn-icon btn-sm" 
                        onClick={() => handleDelete(record)}
                        title="Delete"
                      >
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

      {/* Modal */}
      {showModal && (
        <WeightRecordModal
          record={editingRecord}
          animals={animals}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingRecord(null); }}
        />
      )}
    </div>
  );
};

export default WeightTrackingView;
