/**
 * Health Records View Component
 * Aggregate view of all health records across all animals
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { animalsService } from '../../services/api';

// ============================================================================
// HEALTH RECORD MODAL
// ============================================================================

const HealthRecordModal = ({ record, animals, onSave, onClose }) => {
  const [form, setForm] = useState(record || { record_type: 'vaccination' });
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
          <h2>{record ? 'Edit Health Record' : 'Add Health Record'}</h2>
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
                  value={form.record_date ? form.record_date.split('T')[0] : ''}
                  onChange={(e) => setForm({ ...form, record_date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Type <span className="required">*</span></label>
                <select
                  required
                  value={form.record_type || ''}
                  onChange={(e) => setForm({ ...form, record_type: e.target.value })}
                >
                  <option value="">Select type...</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="treatment">Treatment</option>
                  <option value="illness">Illness</option>
                  <option value="checkup">Checkup</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description <span className="required">*</span></label>
              <textarea
                rows="3"
                required
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the health event, medication given, symptoms observed, etc."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Administered By</label>
                <input
                  type="text"
                  value={form.administered_by || ''}
                  onChange={(e) => setForm({ ...form, administered_by: e.target.value })}
                  placeholder="Vet name or self"
                />
              </div>
              <div className="form-group">
                <label>Next Due Date</label>
                <input
                  type="date"
                  value={form.next_due_date ? form.next_due_date.split('T')[0] : ''}
                  onChange={(e) => setForm({ ...form, next_due_date: e.target.value || null })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                rows="2"
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes..."
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
// MAIN HEALTH RECORDS VIEW
// ============================================================================

const HealthRecordsView = () => {
  const [records, setRecords] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    animal_id: '',
    dateFrom: '',
    dateTo: '',
    showOverdue: false
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all animals
      const animalsData = await animalsService.getAll({ limit: 1000, status: 'Active' });
      const animalsList = animalsData.data || [];
      setAnimals(animalsList);

      // Load health records for all animals
      const allRecords = [];
      for (const animal of animalsList) {
        try {
          const healthData = await animalsService.getHealthRecords(animal.id);
          if (healthData && healthData.length > 0) {
            // Add animal info to each record
            const recordsWithAnimal = healthData.map(r => ({
              ...r,
              animal_ear_tag: animal.ear_tag,
              animal_name: animal.name,
              animal_id: animal.id
            }));
            allRecords.push(...recordsWithAnimal);
          }
        } catch (err) {
          // Skip animals with no health records
        }
      }
      
      // Sort by date descending
      allRecords.sort((a, b) => new Date(b.record_date) - new Date(a.record_date));
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

  const isOverdue = (nextDueDate) => {
    if (!nextDueDate) return false;
    return new Date(nextDueDate) < new Date();
  };

  // Filter records
  const filteredRecords = records.filter(r => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        r.animal_ear_tag?.toLowerCase().includes(searchLower) ||
        r.animal_name?.toLowerCase().includes(searchLower) ||
        r.description?.toLowerCase().includes(searchLower) ||
        r.administered_by?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    
    // Type filter
    if (filters.type && r.record_type !== filters.type) return false;
    
    // Animal filter
    if (filters.animal_id && r.animal_id !== parseInt(filters.animal_id)) return false;
    
    // Date range filter
    if (filters.dateFrom && new Date(r.record_date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(r.record_date) > new Date(filters.dateTo)) return false;
    
    // Overdue filter
    if (filters.showOverdue && !isOverdue(r.next_due_date)) return false;
    
    return true;
  });

  // Count overdue records
  const overdueCount = records.filter(r => isOverdue(r.next_due_date)).length;

  const handleSave = async (data) => {
    try {
      if (editingRecord) {
        await animalsService.updateHealthRecord(editingRecord.id, data);
      } else {
        await animalsService.createHealthRecord(data.animal_id, data);
      }
      setShowModal(false);
      setEditingRecord(null);
      loadData();
    } catch (err) {
      console.error('Failed to save health record:', err);
      alert('Failed to save health record');
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm('Are you sure you want to delete this health record?')) return;
    
    try {
      await animalsService.deleteHealthRecord(record.id);
      loadData();
    } catch (err) {
      console.error('Failed to delete health record:', err);
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

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'vaccination': return 'badge-green';
      case 'treatment': return 'badge-yellow';
      case 'illness': return 'badge-red';
      case 'checkup': return 'badge-blue';
      default: return 'badge-gray';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Health Records</h1>
        <p className="subtitle">Track vaccinations, treatments, and health events across all animals</p>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon"><Icons.Stethoscope /></div>
          <div className="stat-content">
            <span className="stat-label">Total Records</span>
            <span className="stat-value">{records.length}</span>
          </div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilters({ ...filters, showOverdue: !filters.showOverdue })}>
          <div className="stat-icon" style={{ color: overdueCount > 0 ? '#dc2626' : '#6b7280' }}>
            <Icons.AlertTriangle />
          </div>
          <div className="stat-content">
            <span className="stat-label">Overdue</span>
            <span className="stat-value" style={{ color: overdueCount > 0 ? '#dc2626' : 'inherit' }}>
              {overdueCount}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#059669' }}><Icons.CheckSquare /></div>
          <div className="stat-content">
            <span className="stat-label">Vaccinations</span>
            <span className="stat-value">{records.filter(r => r.record_type === 'vaccination').length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#d97706' }}><Icons.Activity /></div>
          <div className="stat-content">
            <span className="stat-label">Treatments</span>
            <span className="stat-value">{records.filter(r => r.record_type === 'treatment').length}</span>
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
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="vaccination">Vaccination</option>
          <option value="treatment">Treatment</option>
          <option value="illness">Illness</option>
          <option value="checkup">Checkup</option>
        </select>
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
          <Icons.Plus /> Add Record
        </button>
      </div>

      {/* Overdue Alert */}
      {filters.showOverdue && (
        <div className="alert alert-warning" style={{ margin: '0 0 16px 0' }}>
          <Icons.AlertTriangle />
          <span>Showing only overdue records</span>
          <button 
            className="btn btn-sm btn-secondary" 
            style={{ marginLeft: 'auto' }}
            onClick={() => setFilters({ ...filters, showOverdue: false })}
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Records Table */}
      <div className="card">
        {loading ? (
          <div className="loading-state">
            <Icons.Loader className="animate-spin" />
            <p>Loading health records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state">
            <Icons.Stethoscope />
            <h3>No health records found</h3>
            <p>{filters.search || filters.type || filters.animal_id ? 'Try adjusting your filters' : 'Add your first health record'}</p>
            <button className="btn btn-primary" onClick={openAddModal}>
              <Icons.Plus /> Add Health Record
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Animal</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Administered By</th>
                  <th>Next Due</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.record_date)}</td>
                    <td>
                      <strong style={{ color: '#7A8B6E' }}>{record.animal_ear_tag}</strong>
                      {record.animal_name && <span style={{ color: '#6b7280' }}> ({record.animal_name})</span>}
                    </td>
                    <td>
                      <span className={`badge ${getTypeBadgeClass(record.record_type)}`}>
                        {record.record_type}
                      </span>
                    </td>
                    <td style={{ maxWidth: '250px' }}>
                      {record.description?.length > 50 
                        ? record.description.substring(0, 50) + '...' 
                        : record.description}
                    </td>
                    <td>{record.administered_by || '—'}</td>
                    <td>
                      {record.next_due_date ? (
                        <span className={isOverdue(record.next_due_date) ? 'overdue' : ''}>
                          {formatDate(record.next_due_date)}
                          {isOverdue(record.next_due_date) && (
                            <Icons.AlertTriangle style={{ width: '14px', marginLeft: '4px', color: '#dc2626' }} />
                          )}
                        </span>
                      ) : '—'}
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
        <HealthRecordModal
          record={editingRecord}
          animals={animals}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingRecord(null); }}
        />
      )}
    </div>
  );
};

export default HealthRecordsView;
