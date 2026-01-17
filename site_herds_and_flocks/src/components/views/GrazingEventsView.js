/**
 * Grazing Events View Component
 * Aggregate view of all grazing events across all pastures
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { pasturesService, herdsService } from '../../services/api';

// ============================================================================
// GRAZING EVENT MODAL
// ============================================================================

const GrazingEventModal = ({ event, pastures, herds, onSave, onClose }) => {
  const [form, setForm] = useState(event || { status: 'planned' });
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
          <h2>{event ? 'Edit Grazing Event' : 'Add Grazing Event'}</h2>
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
                  disabled={!!event}
                >
                  <option value="">Select pasture...</option>
                  {pastures.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Herd/Flock</label>
                <select
                  value={form.herd_id || ''}
                  onChange={(e) => setForm({ ...form, herd_id: e.target.value || null })}
                >
                  <option value="">Select herd...</option>
                  {herds.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date <span className="required">*</span></label>
                <input
                  type="date"
                  required
                  value={form.start_date ? form.start_date.split('T')[0] : ''}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={form.end_date ? form.end_date.split('T')[0] : ''}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value || null })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Animal Count</label>
                <input
                  type="number"
                  min="0"
                  value={form.animal_count || ''}
                  onChange={(e) => setForm({ ...form, animal_count: e.target.value || null })}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={form.status || 'planned'}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                rows="3"
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Observations, conditions, etc."
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
// MAIN GRAZING EVENTS VIEW
// ============================================================================

const GrazingEventsView = () => {
  const [events, setEvents] = useState([]);
  const [pastures, setPastures] = useState([]);
  const [herds, setHerds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    pasture_id: '',
    status: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pasturesData, herdsData] = await Promise.all([
        pasturesService.getAll({ active_only: true }),
        herdsService.getAll()
      ]);
      const pasturesList = pasturesData || [];
      const herdsList = herdsData || [];
      setPastures(pasturesList);
      setHerds(herdsList);

      const allEvents = [];
      for (const pasture of pasturesList) {
        try {
          const eventsData = await pasturesService.getGrazingEvents(pasture.id);
          if (eventsData && eventsData.length > 0) {
            const eventsWithPasture = eventsData.map(e => ({
              ...e,
              pasture_name: pasture.name,
              pasture_id: pasture.id
            }));
            allEvents.push(...eventsWithPasture);
          }
        } catch (err) {
          // Skip pastures with no events
        }
      }
      
      allEvents.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
      setEvents(allEvents);
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

  const filteredEvents = events.filter(e => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        e.pasture_name?.toLowerCase().includes(searchLower) ||
        e.herd_name?.toLowerCase().includes(searchLower) ||
        e.notes?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (filters.pasture_id && e.pasture_id !== parseInt(filters.pasture_id)) return false;
    if (filters.status && e.status !== filters.status) return false;
    return true;
  });

  const activeCount = events.filter(e => e.status === 'active').length;
  const plannedCount = events.filter(e => e.status === 'planned').length;

  const handleSave = async (data) => {
    try {
      if (editingEvent) {
        await pasturesService.updateGrazingEvent(editingEvent.id, data);
      } else {
        await pasturesService.createGrazingEvent(data.pasture_id, data);
      }
      setShowModal(false);
      setEditingEvent(null);
      loadData();
    } catch (err) {
      console.error('Failed to save grazing event:', err);
      alert('Failed to save grazing event');
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm('Are you sure you want to delete this grazing event?')) return;
    try {
      await pasturesService.deleteGrazingEvent(event.id);
      loadData();
    } catch (err) {
      console.error('Failed to delete grazing event:', err);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'badge-green';
      case 'planned': return 'badge-blue';
      case 'completed': return 'badge-gray';
      default: return 'badge-gray';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Grazing Events</h1>
        <p className="subtitle">Track rotational grazing and pasture usage</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon"><Icons.Calendar /></div>
          <div className="stat-content">
            <span className="stat-label">Total Events</span>
            <span className="stat-value">{events.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#059669' }}><Icons.Activity /></div>
          <div className="stat-content">
            <span className="stat-label">Active</span>
            <span className="stat-value" style={{ color: '#059669' }}>{activeCount}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#3b82f6' }}><Icons.Calendar /></div>
          <div className="stat-content">
            <span className="stat-label">Planned</span>
            <span className="stat-value" style={{ color: '#3b82f6' }}>{plannedCount}</span>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Icons.Search />
          <input
            type="text"
            placeholder="Search events..."
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
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="planned">Planned</option>
          <option value="completed">Completed</option>
        </select>
        <button className="btn btn-primary" onClick={() => { setEditingEvent(null); setShowModal(true); }}>
          <Icons.Plus /> Add Event
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-state">
            <Icons.Loader className="animate-spin" />
            <p>Loading grazing events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <Icons.Calendar />
            <h3>No grazing events found</h3>
            <p>{filters.search || filters.pasture_id || filters.status ? 'Try adjusting your filters' : 'Add your first grazing event'}</p>
            <button className="btn btn-primary" onClick={() => { setEditingEvent(null); setShowModal(true); }}>
              <Icons.Plus /> Add Grazing Event
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Pasture</th>
                  <th>Herd/Flock</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Animals</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td><strong style={{ color: '#7A8B6E' }}>{event.pasture_name}</strong></td>
                    <td>{event.herd_name || '—'}</td>
                    <td>{formatDate(event.start_date)}</td>
                    <td>{formatDate(event.end_date)}</td>
                    <td>{event.animal_count || '—'}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="notes-cell">{event.notes ? (event.notes.length > 50 ? event.notes.substring(0, 50) + '...' : event.notes) : '—'}</td>
                    <td className="actions-col">
                      <button className="btn btn-icon btn-sm" onClick={() => { setEditingEvent(event); setShowModal(true); }} title="Edit">
                        <Icons.Edit />
                      </button>
                      <button className="btn btn-icon btn-sm" onClick={() => handleDelete(event)} title="Delete">
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
        <GrazingEventModal
          event={editingEvent}
          pastures={pastures}
          herds={herds}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingEvent(null); }}
        />
      )}
    </div>
  );
};

export default GrazingEventsView;
