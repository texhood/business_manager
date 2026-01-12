/**
 * EventsView Component
 * CRUD for food trailer events
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../common/Icons';
import Modal from '../common/Modal';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

const EVENT_STATUSES = [
  { value: 'draft', label: 'Draft', color: '#6b7280' },
  { value: 'scheduled', label: 'Scheduled', color: '#3b82f6' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
  { value: 'completed', label: 'Completed', color: '#10b981' },
];

const EventsView = () => {
  const [events, setEvents] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showPast, setShowPast] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location_name: '',
    address: '',
    city: '',
    state: 'TX',
    zip_code: '',
    map_url: '',
    menu_id: '',
    featured_image: '',
    is_featured: false,
    status: 'scheduled',
    ticket_url: '',
    facebook_event_url: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Load events
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('upcoming', showPast ? 'false' : 'true');
      params.append('past', showPast ? 'true' : 'false');
      params.append('limit', '50');
      
      const eventsRes = await fetch(`${API_URL}/events?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const eventsData = await eventsRes.json();
      setEvents(eventsData.data || []);
      
      // Load menus for dropdown
      const menusRes = await fetch(`${API_URL}/menus?status=active`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const menusData = await menusRes.json();
      setMenus(menusData.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setMessage({ type: 'error', text: 'Failed to load events' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showPast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      event_date: '',
      start_time: '',
      end_time: '',
      location_name: '',
      address: '',
      city: '',
      state: 'TX',
      zip_code: '',
      map_url: '',
      menu_id: '',
      featured_image: '',
      is_featured: false,
      status: 'scheduled',
      ticket_url: '',
      facebook_event_url: '',
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingEvent(null);
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setForm({
      title: event.title || '',
      description: event.description || '',
      event_date: event.event_date?.split('T')[0] || '',
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      location_name: event.location_name || '',
      address: event.address || '',
      city: event.city || '',
      state: event.state || 'TX',
      zip_code: event.zip_code || '',
      map_url: event.map_url || '',
      menu_id: event.menu_id || '',
      featured_image: event.featured_image || '',
      is_featured: event.is_featured || false,
      status: event.status || 'scheduled',
      ticket_url: event.ticket_url || '',
      facebook_event_url: event.facebook_event_url || '',
    });
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingEvent 
        ? `${API_URL}/events/${editingEvent.id}`
        : `${API_URL}/events`;
      
      const payload = { ...form };
      if (!payload.menu_id) delete payload.menu_id;
      
      const response = await fetch(url, {
        method: editingEvent ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save event');
      }
      
      setMessage({ type: 'success', text: `Event ${editingEvent ? 'updated' : 'created'} successfully` });
      setShowModal(false);
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (event) => {
    const newDate = prompt('Enter date for duplicated event (YYYY-MM-DD):', '');
    if (!newDate) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/events/${event.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_date: newDate }),
      });
      
      if (!response.ok) throw new Error('Failed to duplicate event');
      
      setMessage({ type: 'success', text: 'Event duplicated successfully' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleCancel = async (event) => {
    if (!window.confirm(`Cancel "${event.title}" on ${formatDate(event.event_date)}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/events/${event.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to cancel event');
      
      setMessage({ type: 'success', text: 'Event cancelled' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleComplete = async (event) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/events/${event.id}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to mark complete');
      
      setMessage({ type: 'success', text: 'Event marked as completed' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    const statusInfo = EVENT_STATUSES.find(s => s.value === status) || EVENT_STATUSES[0];
    return (
      <span className="status-badge" style={{ backgroundColor: statusInfo.color }}>
        {statusInfo.label}
      </span>
    );
  };

  const isEventPast = (event) => {
    const eventDate = new Date(event.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <h2>Events</h2>
          <p>Schedule and manage food trailer events</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Icons.Plus /> New Event
        </button>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.type === 'success' ? <Icons.CheckCircle /> : <Icons.AlertCircle />}
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          {EVENT_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        
        <label className="checkbox-filter">
          <input
            type="checkbox"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
          />
          Show past events
        </label>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="loading-state">
          <Icons.Loader />
          <p>Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <Icons.Calendar />
          <h3>No events yet</h3>
          <p>Create your first event to get started</p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Icons.Plus /> Create Event
          </button>
        </div>
      ) : (
        <div className="events-list">
          {events.map(event => (
            <div 
              key={event.id} 
              className={`event-card ${isEventPast(event) ? 'past' : ''} ${event.status === 'cancelled' ? 'cancelled' : ''}`}
            >
              <div className="event-date-box">
                <span className="month">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}</span>
                <span className="day">{new Date(event.event_date).getDate()}</span>
              </div>
              
              <div className="event-details">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  {getStatusBadge(event.status)}
                </div>
                
                <div className="event-meta">
                  <span className="event-time">
                    <Icons.Calendar />
                    {formatDate(event.event_date)}
                    {event.start_time && (
                      <> • {formatTime(event.start_time)}{event.end_time && ` - ${formatTime(event.end_time)}`}</>
                    )}
                  </span>
                  
                  {event.location_name && (
                    <span className="event-location">
                      <Icons.MapPin />
                      {event.location_name}
                      {event.city && `, ${event.city}`}
                    </span>
                  )}
                  
                  {event.menu_name && (
                    <span className="event-menu">
                      <Icons.Menu />
                      {event.menu_name}
                    </span>
                  )}
                </div>
                
                {event.description && (
                  <p className="event-description">{event.description}</p>
                )}
              </div>
              
              <div className="event-actions">
                <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(event)}>
                  <Icons.Edit />
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => handleDuplicate(event)} title="Duplicate">
                  <Icons.Copy />
                </button>
                {event.status === 'scheduled' && !isEventPast(event) && (
                  <button className="btn btn-sm btn-danger" onClick={() => handleCancel(event)} title="Cancel">
                    <Icons.X />
                  </button>
                )}
                {event.status === 'scheduled' && isEventPast(event) && (
                  <button className="btn btn-sm btn-success" onClick={() => handleComplete(event)} title="Mark Complete">
                    <Icons.Check />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingEvent ? 'Edit Event' : 'Create Event'}>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Event Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Tyler Farmers Market"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Additional details about the event"
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="form-section-title">Location</div>
            
            <div className="form-group">
              <label>Location Name</label>
              <input
                type="text"
                value={form.location_name}
                onChange={(e) => setForm({ ...form, location_name: e.target.value })}
                placeholder="e.g., Tyler Farmers Market"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Zip</label>
                <input
                  type="text"
                  value={form.zip_code}
                  onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
                />
              </div>
            </div>

            <div className="form-section-title">Options</div>

            <div className="form-row">
              <div className="form-group">
                <label>Menu</label>
                <select
                  value={form.menu_id}
                  onChange={(e) => setForm({ ...form, menu_id: e.target.value })}
                >
                  <option value="">No menu assigned</option>
                  {menus.map(menu => (
                    <option key={menu.id} value={menu.id}>{menu.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {EVENT_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
              </button>
            </div>
          </form>
      </Modal>
    </div>
  );
};

export default EventsView;
