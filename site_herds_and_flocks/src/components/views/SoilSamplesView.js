/**
 * Soil Samples View Component
 * Aggregate view of all soil samples across all pastures
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { pasturesService } from '../../services/api';

// ============================================================================
// SOIL SAMPLE MODAL
// ============================================================================

const SoilSampleModal = ({ sample, pastures, onSave, onClose }) => {
  const [form, setForm] = useState(sample || {});
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
          <h2>{sample ? 'Edit Soil Sample' : 'Add Soil Sample'}</h2>
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
                  disabled={!!sample}
                >
                  <option value="">Select pasture...</option>
                  {pastures.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Sample Date <span className="required">*</span></label>
                <input
                  type="date"
                  required
                  value={form.sample_date ? form.sample_date.split('T')[0] : ''}
                  onChange={(e) => setForm({ ...form, sample_date: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>pH Level</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  value={form.ph_level || ''}
                  onChange={(e) => setForm({ ...form, ph_level: e.target.value || null })}
                  placeholder="e.g., 6.5"
                />
              </div>
              <div className="form-group">
                <label>Organic Matter (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.organic_matter || ''}
                  onChange={(e) => setForm({ ...form, organic_matter: e.target.value || null })}
                  placeholder="e.g., 3.5"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Lab Name</label>
                <input
                  type="text"
                  value={form.lab_name || ''}
                  onChange={(e) => setForm({ ...form, lab_name: e.target.value })}
                  placeholder="Testing laboratory"
                />
              </div>
              <div className="form-group">
                <label>Sample Location</label>
                <input
                  type="text"
                  value={form.sample_location || ''}
                  onChange={(e) => setForm({ ...form, sample_location: e.target.value })}
                  placeholder="e.g., NE corner"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                rows="3"
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional observations or recommendations..."
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
// MAIN SOIL SAMPLES VIEW
// ============================================================================

const SoilSamplesView = () => {
  const [samples, setSamples] = useState([]);
  const [pastures, setPastures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSample, setEditingSample] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    pasture_id: '',
    year: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const pasturesData = await pasturesService.getAll({ active_only: true });
      const pasturesList = pasturesData || [];
      setPastures(pasturesList);

      const allSamples = [];
      for (const pasture of pasturesList) {
        try {
          const samplesData = await pasturesService.getSoilSamples(pasture.id);
          if (samplesData && samplesData.length > 0) {
            const samplesWithPasture = samplesData.map(s => ({
              ...s,
              pasture_name: pasture.name,
              pasture_id: pasture.id
            }));
            allSamples.push(...samplesWithPasture);
          }
        } catch (err) {
          // Skip pastures with no samples
        }
      }
      
      allSamples.sort((a, b) => new Date(b.sample_date) - new Date(a.sample_date));
      setSamples(allSamples);
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

  // Get unique years for filter
  const years = [...new Set(samples.map(s => new Date(s.sample_date).getFullYear()))].sort((a, b) => b - a);

  const filteredSamples = samples.filter(s => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        s.pasture_name?.toLowerCase().includes(searchLower) ||
        s.lab_name?.toLowerCase().includes(searchLower) ||
        s.sample_location?.toLowerCase().includes(searchLower) ||
        s.notes?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (filters.pasture_id && s.pasture_id !== parseInt(filters.pasture_id)) return false;
    if (filters.year && new Date(s.sample_date).getFullYear() !== parseInt(filters.year)) return false;
    return true;
  });

  // Calculate averages
  const avgPh = samples.filter(s => s.ph_level).length > 0
    ? (samples.filter(s => s.ph_level).reduce((sum, s) => sum + parseFloat(s.ph_level), 0) / samples.filter(s => s.ph_level).length).toFixed(1)
    : '—';
  const avgOm = samples.filter(s => s.organic_matter).length > 0
    ? (samples.filter(s => s.organic_matter).reduce((sum, s) => sum + parseFloat(s.organic_matter), 0) / samples.filter(s => s.organic_matter).length).toFixed(1)
    : '—';

  const handleSave = async (data) => {
    try {
      if (editingSample) {
        await pasturesService.updateSoilSample(editingSample.id, data);
      } else {
        await pasturesService.createSoilSample(data.pasture_id, data);
      }
      setShowModal(false);
      setEditingSample(null);
      loadData();
    } catch (err) {
      console.error('Failed to save soil sample:', err);
      alert('Failed to save soil sample');
    }
  };

  const handleDelete = async (sample) => {
    if (!window.confirm('Are you sure you want to delete this soil sample?')) return;
    try {
      await pasturesService.deleteSoilSample(sample.id);
      loadData();
    } catch (err) {
      console.error('Failed to delete soil sample:', err);
    }
  };

  const getPhClass = (ph) => {
    if (!ph) return '';
    if (ph < 5.5) return 'text-red';
    if (ph > 7.5) return 'text-red';
    if (ph >= 6.0 && ph <= 7.0) return 'text-green';
    return 'text-yellow';
  };

  return (
    <div>
      <div className="page-header">
        <h1>Soil Samples</h1>
        <p className="subtitle">Track soil health and nutrient levels across pastures</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon"><Icons.Clipboard /></div>
          <div className="stat-content">
            <span className="stat-label">Total Samples</span>
            <span className="stat-value">{samples.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icons.Activity /></div>
          <div className="stat-content">
            <span className="stat-label">Avg pH</span>
            <span className="stat-value">{avgPh}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icons.TreeDeciduous /></div>
          <div className="stat-content">
            <span className="stat-label">Avg Organic Matter</span>
            <span className="stat-value">{avgOm}%</span>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Icons.Search />
          <input
            type="text"
            placeholder="Search samples..."
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
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={() => { setEditingSample(null); setShowModal(true); }}>
          <Icons.Plus /> Add Sample
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-state">
            <Icons.Loader className="animate-spin" />
            <p>Loading soil samples...</p>
          </div>
        ) : filteredSamples.length === 0 ? (
          <div className="empty-state">
            <Icons.Clipboard />
            <h3>No soil samples found</h3>
            <p>{filters.search || filters.pasture_id || filters.year ? 'Try adjusting your filters' : 'Add your first soil sample'}</p>
            <button className="btn btn-primary" onClick={() => { setEditingSample(null); setShowModal(true); }}>
              <Icons.Plus /> Add Soil Sample
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Pasture</th>
                  <th>pH</th>
                  <th>Organic Matter</th>
                  <th>Lab</th>
                  <th>Location</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSamples.map((sample) => (
                  <tr key={sample.id}>
                    <td>{formatDate(sample.sample_date)}</td>
                    <td><strong style={{ color: '#7A8B6E' }}>{sample.pasture_name}</strong></td>
                    <td className={getPhClass(sample.ph_level)}>
                      {sample.ph_level ? <strong>{sample.ph_level}</strong> : '—'}
                    </td>
                    <td>{sample.organic_matter ? `${sample.organic_matter}%` : '—'}</td>
                    <td>{sample.lab_name || '—'}</td>
                    <td>{sample.sample_location || '—'}</td>
                    <td className="actions-col">
                      <button className="btn btn-icon btn-sm" onClick={() => { setEditingSample(sample); setShowModal(true); }} title="Edit">
                        <Icons.Edit />
                      </button>
                      <button className="btn btn-icon btn-sm" onClick={() => handleDelete(sample)} title="Delete">
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
        <SoilSampleModal
          sample={editingSample}
          pastures={pastures}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingSample(null); }}
        />
      )}
    </div>
  );
};

export default SoilSamplesView;
