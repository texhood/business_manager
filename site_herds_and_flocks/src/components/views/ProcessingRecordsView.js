/**
 * Processing Records View Component
 * Track animals and herds sent for processing (butchering)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../common/Icons';
import { processingService, animalsService, herdsService } from '../../services/api';
import './ProcessingRecordsView.css';

// ============================================================================
// STATUS BADGE
// ============================================================================

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Pending': { label: 'Pending', className: 'status-pending' },
    'At Processor': { label: 'At Processor', className: 'status-at-processor' },
    'Complete': { label: 'Complete', className: 'status-complete' }
  };
  
  const config = statusConfig[status] || statusConfig['Pending'];
  return <span className={`status-badge ${config.className}`}>{config.label}</span>;
};

// ============================================================================
// PROCESSING RECORD MODAL
// ============================================================================

const ProcessingRecordModal = ({ record, animals, herds, onSave, onClose }) => {
  const [form, setForm] = useState(record || {
    animal_id: '',
    herd_id: '',
    processing_date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    processor_name: '',
    processor_contact: '',
    hanging_weight_lbs: '',
    packaged_weight_lbs: '',
    cost: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [selectionType, setSelectionType] = useState(
    record?.herd_id ? 'herd' : 'animal'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        animal_id: selectionType === 'animal' ? (form.animal_id || null) : null,
        herd_id: selectionType === 'herd' ? (form.herd_id || null) : null,
        hanging_weight_lbs: form.hanging_weight_lbs || null,
        packaged_weight_lbs: form.packaged_weight_lbs || null,
        cost: form.cost || null
      };
      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectionTypeChange = (type) => {
    setSelectionType(type);
    setForm(prev => ({
      ...prev,
      animal_id: '',
      herd_id: ''
    }));
  };

  // Filter active animals only
  const activeAnimals = animals.filter(a => a.status === 'Active');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{record ? 'Edit Processing Record' : 'Add Processing Record'}</h2>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Selection Type Toggle */}
            <div className="form-group">
              <label>Processing Type *</label>
              <div className="selection-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${selectionType === 'animal' ? 'active' : ''}`}
                  onClick={() => handleSelectionTypeChange('animal')}
                  disabled={!!record}
                >
                  Individual Animal
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${selectionType === 'herd' ? 'active' : ''}`}
                  onClick={() => handleSelectionTypeChange('herd')}
                  disabled={!!record}
                >
                  Herd/Flock
                </button>
              </div>
            </div>

            {/* Animal Selection */}
            {selectionType === 'animal' && (
              <div className="form-group">
                <label>Animal *</label>
                <select
                  required
                  value={form.animal_id || ''}
                  onChange={(e) => setForm({ ...form, animal_id: e.target.value })}
                  disabled={!!record}
                >
                  <option value="">Select Animal...</option>
                  {activeAnimals.map(animal => (
                    <option key={animal.id} value={animal.id}>
                      {animal.ear_tag} {animal.name ? `- ${animal.name}` : ''} ({animal.animal_type_name || 'Unknown'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Herd Selection */}
            {selectionType === 'herd' && (
              <div className="form-group">
                <label>Herd/Flock *</label>
                <select
                  required
                  value={form.herd_id || ''}
                  onChange={(e) => setForm({ ...form, herd_id: e.target.value })}
                  disabled={!!record}
                >
                  <option value="">Select Herd/Flock...</option>
                  {herds.filter(h => h.is_active).map(herd => (
                    <option key={herd.id} value={herd.id}>
                      {herd.name} ({herd.current_count || herd.animal_count || 0} head)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Processing Date *</label>
                <input
                  type="date"
                  required
                  value={form.processing_date || ''}
                  onChange={(e) => setForm({ ...form, processing_date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  required
                  value={form.status || 'Pending'}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="At Processor">At Processor</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Processor Name</label>
                <input
                  type="text"
                  value={form.processor_name || ''}
                  onChange={(e) => setForm({ ...form, processor_name: e.target.value })}
                  placeholder="e.g., Smith's Processing"
                />
              </div>
              <div className="form-group">
                <label>Processor Contact</label>
                <input
                  type="text"
                  value={form.processor_contact || ''}
                  onChange={(e) => setForm({ ...form, processor_contact: e.target.value })}
                  placeholder="Phone or email"
                />
              </div>
            </div>

            <div className="form-section-header">
              <h4>Results (fill in when complete)</h4>
            </div>

            <div className="form-row form-row-3">
              <div className="form-group">
                <label>Hanging Weight (lbs)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.hanging_weight_lbs || ''}
                  onChange={(e) => setForm({ ...form, hanging_weight_lbs: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Packaged Weight (lbs)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.packaged_weight_lbs || ''}
                  onChange={(e) => setForm({ ...form, packaged_weight_lbs: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.cost || ''}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="Cut instructions, special requests, etc."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (record ? 'Update' : 'Add Record')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// CALENDAR VIEW
// ============================================================================

const CalendarView = ({ records, onRecordClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  
  // Group records by date
  const recordsByDate = {};
  records.forEach(record => {
    const dateStr = record.processing_date?.split('T')[0];
    if (dateStr) {
      if (!recordsByDate[dateStr]) recordsByDate[dateStr] = [];
      recordsByDate[dateStr].push(record);
    }
  });
  
  const renderCalendarDays = () => {
    const days = [];
    
    // Padding for start of month
    for (let i = 0; i < startPadding; i++) {
      days.push(<div key={`pad-${i}`} className="calendar-day empty" />);
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayRecords = recordsByDate[dateStr] || [];
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      
      days.push(
        <div key={day} className={`calendar-day ${isToday ? 'today' : ''} ${dayRecords.length > 0 ? 'has-records' : ''}`}>
          <div className="day-number">{day}</div>
          <div className="day-records">
            {dayRecords.slice(0, 3).map(record => (
              <div
                key={record.id}
                className={`calendar-record status-${record.status}`}
                onClick={() => onRecordClick(record)}
                title={record.display_name || record.herd_name || record.animal_ear_tag}
              >
                {(record.display_name || record.herd_name || record.animal_ear_tag || '').substring(0, 15)}
              </div>
            ))}
            {dayRecords.length > 3 && (
              <div className="more-records">+{dayRecords.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button className="btn btn-icon" onClick={prevMonth}>
          <Icons.ChevronLeft />
        </button>
        <h3>{monthNames[month]} {year}</h3>
        <button className="btn btn-icon" onClick={nextMonth}>
          <Icons.ChevronRight />
        </button>
      </div>
      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN VIEW
// ============================================================================

const ProcessingRecordsView = () => {
  const [records, setRecords] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [herds, setHerds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterHerd, setFilterHerd] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [recordsData, animalsData, herdsData] = await Promise.all([
        processingService.getAll({
          status: filterStatus || undefined,
          herd_id: filterHerd || undefined,
          species: filterSpecies || undefined
        }),
        animalsService.getAll({ limit: 1000 }),
        herdsService.getAll()
      ]);
      
      setRecords(recordsData || []);
      setAnimals(animalsData?.data || []);
      setHerds(herdsData || []);
    } catch (error) {
      console.error('Failed to load processing records:', error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterHerd, filterSpecies]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (data) => {
    try {
      if (selectedRecord) {
        await processingService.update(selectedRecord.id, data);
      } else {
        await processingService.create(data);
      }
      setShowModal(false);
      setSelectedRecord(null);
      loadData();
    } catch (error) {
      console.error('Failed to save processing record:', error);
      alert('Failed to save: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this processing record?')) return;
    
    try {
      await processingService.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete processing record:', error);
      alert('Failed to delete: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedRecord(null);
    setShowModal(true);
  };

  // Filter records by search term
  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (record.display_name || '').toLowerCase().includes(search) ||
      (record.herd_name || '').toLowerCase().includes(search) ||
      (record.animal_ear_tag || '').toLowerCase().includes(search) ||
      (record.processor_name || '').toLowerCase().includes(search)
    );
  });

  // Calculate statistics
  const stats = {
    total: records.length,
    pending: records.filter(r => r.status === 'Pending').length,
    atProcessor: records.filter(r => r.status === 'At Processor').length,
    complete: records.filter(r => r.status === 'Complete').length
  };

  // Get unique species from records
  const speciesList = [...new Set(records.map(r => r.species).filter(Boolean))];

  if (loading) {
    return (
      <div className="view-container">
        <div className="loading-spinner">
          <Icons.Loader className="spin" />
          <span>Loading processing records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container processing-records-view">
      {/* Header */}
      <div className="view-header">
        <div>
          <h1>Processing Records</h1>
          <p className="subtitle">Track animals and herds sent for butchering</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Icons.Plus /> Add Record
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon"><Icons.FileText /></div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Records</div>
          </div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-icon"><Icons.Clock /></div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card stat-at-processor">
          <div className="stat-icon"><Icons.Truck /></div>
          <div className="stat-content">
            <div className="stat-value">{stats.atProcessor}</div>
            <div className="stat-label">At Processor</div>
          </div>
        </div>
        <div className="stat-card stat-complete">
          <div className="stat-icon"><Icons.CheckCircle /></div>
          <div className="stat-content">
            <div className="stat-value">{stats.complete}</div>
            <div className="stat-label">Complete</div>
          </div>
        </div>
      </div>

      {/* View Toggle and Filters */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <Icons.List /> List
            </button>
            <button
              className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              <Icons.Calendar /> Calendar
            </button>
          </div>
          
          <div className="search-box">
            <Icons.Search />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="toolbar-right">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="At Processor">At Processor</option>
            <option value="Complete">Complete</option>
          </select>
          
          <select
            value={filterHerd}
            onChange={(e) => setFilterHerd(e.target.value)}
            className="filter-select"
          >
            <option value="">All Herds</option>
            {herds.map(herd => (
              <option key={herd.id} value={herd.id}>{herd.name}</option>
            ))}
          </select>
          
          <select
            value={filterSpecies}
            onChange={(e) => setFilterSpecies(e.target.value)}
            className="filter-select"
          >
            <option value="">All Species</option>
            {speciesList.map(species => (
              <option key={species} value={species}>
                {species.charAt(0).toUpperCase() + species.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'list' ? (
        <div className="card">
          {filteredRecords.length === 0 ? (
            <div className="empty-state">
              <Icons.FileText size={48} />
              <h3>No Processing Records</h3>
              <p>Create your first processing record to track animals sent for butchering.</p>
              <button className="btn btn-primary" onClick={handleAdd}>
                <Icons.Plus /> Add Record
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Animal/Herd</th>
                  <th>Species</th>
                  <th>Status</th>
                  <th>Processor</th>
                  <th>Hanging Wt</th>
                  <th>Pkg Wt</th>
                  <th>Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => (
                  <tr key={record.id}>
                    <td>{record.processing_date ? new Date(record.processing_date).toLocaleDateString() : '-'}</td>
                    <td>
                      <div className="record-name">
                        {record.animal_id ? (
                          <>
                            <Icons.Tag size={14} />
                            {record.animal_ear_tag} {record.animal_name && `- ${record.animal_name}`}
                          </>
                        ) : (
                          <>
                            <Icons.Users size={14} />
                            {record.herd_name}
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      {record.species ? (
                        <span className="species-tag">
                          {record.species.charAt(0).toUpperCase() + record.species.slice(1)}
                        </span>
                      ) : '-'}
                    </td>
                    <td><StatusBadge status={record.status} /></td>
                    <td>{record.processor_name || '-'}</td>
                    <td>{record.hanging_weight_lbs ? `${record.hanging_weight_lbs} lbs` : '-'}</td>
                    <td>{record.packaged_weight_lbs ? `${record.packaged_weight_lbs} lbs` : '-'}</td>
                    <td>{record.cost ? `$${parseFloat(record.cost).toFixed(2)}` : '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-icon" onClick={() => handleEdit(record)} title="Edit">
                          <Icons.Edit2 size={16} />
                        </button>
                        <button className="btn btn-icon btn-danger" onClick={() => handleDelete(record.id)} title="Delete">
                          <Icons.Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <CalendarView records={filteredRecords} onRecordClick={handleEdit} />
      )}

      {/* Modal */}
      {showModal && (
        <ProcessingRecordModal
          record={selectedRecord}
          animals={animals}
          herds={herds}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setSelectedRecord(null);
          }}
        />
      )}
    </div>
  );
};

export default ProcessingRecordsView;
