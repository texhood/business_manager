/**
 * DeliveryZonesView Component
 * Manage delivery zones with full CRUD operations
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { deliveryZonesService } from '../../services/api';

const DeliveryZonesView = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editZone, setEditZone] = useState(null);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    base_city: '',
    schedule: '',
    radius: 20,
    is_active: true,
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await deliveryZonesService.getAll(true); // Include inactive
      setZones(Array.isArray(result) ? result : result.data || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load delivery zones' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      base_city: '',
      schedule: '',
      radius: 20,
      is_active: true,
    });
    setEditZone(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editZone) {
        // Don't send the id field when updating - it's the primary key
        const { id, ...updateData } = formData;
        await deliveryZonesService.update(editZone.id, updateData);
        setMessage({ type: 'success', text: 'Delivery zone updated' });
      } else {
        await deliveryZonesService.create(formData);
        setMessage({ type: 'success', text: 'Delivery zone created' });
      }
      resetForm();
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save delivery zone' });
    }
  };

  const handleEdit = (zone) => {
    setEditZone(zone);
    setFormData({
      id: zone.id,
      name: zone.name,
      base_city: zone.base_city || '',
      schedule: zone.schedule || '',
      radius: zone.radius || 20,
      is_active: zone.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (zone) => {
    if (!window.confirm(`Delete delivery zone "${zone.name}"? This cannot be undone.`)) return;
    try {
      await deliveryZonesService.delete(zone.id);
      setMessage({ type: 'success', text: 'Delivery zone deleted' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete delivery zone' });
    }
  };

  const handleToggleActive = async (zone) => {
    try {
      await deliveryZonesService.update(zone.id, { is_active: !zone.is_active });
      setMessage({ type: 'success', text: `Delivery zone ${zone.is_active ? 'deactivated' : 'activated'}` });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update delivery zone status' });
    }
  };

  // Auto-clear messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const activeZones = zones.filter(z => z.is_active);
  const inactiveZones = zones.filter(z => !z.is_active);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Delivery Zones</h1>
          <p className="subtitle">Manage delivery areas and schedules</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => { setShowForm(true); setEditZone(null); resetForm(); setShowForm(true); }}
        >
          <Icons.Plus /> Add Zone
        </button>
      </div>

      {message && (
        <div style={{ 
          padding: '12px 16px', 
          borderRadius: 6, 
          marginBottom: 20, 
          backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4', 
          color: message.type === 'error' ? '#dc2626' : '#16a34a',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          {message.type === 'error' ? <Icons.AlertCircle size={18} /> : <Icons.Check size={18} />}
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h2>{editZone ? 'Edit Delivery Zone' : 'New Delivery Zone'}</h2>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
              {!editZone && (
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                    Zone ID *
                    <span style={{ fontWeight: 400, color: '#666', marginLeft: 4 }}>(e.g., "north", "east")</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.id} 
                    onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })} 
                    placeholder="zone-id"
                    required 
                  />
                </div>
              )}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Zone Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="North Dallas"
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Base City *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.base_city} 
                  onChange={(e) => setFormData({ ...formData, base_city: e.target.value })} 
                  placeholder="Dallas, TX"
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Delivery Schedule *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.schedule} 
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} 
                  placeholder="Every Tuesday"
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Radius (miles)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={formData.radius} 
                  onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) || 20 })} 
                  min="1"
                  max="100"
                />
              </div>
              {editZone && (
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Status</label>
                  <select 
                    className="form-control" 
                    value={formData.is_active ? 'active' : 'inactive'} 
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <button type="submit" className="btn btn-primary">
                {editZone ? 'Update Zone' : 'Create Zone'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Icons.Loader /> Loading...
        </div>
      ) : (
        <>
          {/* Active Zones */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header" style={{ backgroundColor: '#d1fae5' }}>
              <h2 style={{ color: '#059669', margin: 0 }}>
                <Icons.Truck style={{ marginRight: 8 }} />
                Active Zones ({activeZones.length})
              </h2>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Zone</th>
                    <th>Base City</th>
                    <th>Schedule</th>
                    <th>Radius</th>
                    <th style={{ width: 140 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeZones.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#888' }}>
                        No active delivery zones. Click "Add Zone" to create one.
                      </td>
                    </tr>
                  ) : (
                    activeZones.map(zone => (
                      <tr key={zone.id}>
                        <td>
                          <div>
                            <strong>{zone.name}</strong>
                            <div style={{ fontSize: 12, color: '#888' }}>ID: {zone.id}</div>
                          </div>
                        </td>
                        <td>{zone.base_city}</td>
                        <td>{zone.schedule}</td>
                        <td>{zone.radius} miles</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button 
                              className="btn btn-sm" 
                              onClick={() => handleEdit(zone)}
                              title="Edit zone"
                            >
                              <Icons.Edit />
                            </button>
                            <button 
                              className="btn btn-sm" 
                              onClick={() => handleToggleActive(zone)}
                              title="Deactivate zone"
                              style={{ color: '#f59e0b' }}
                            >
                              <Icons.Pause />
                            </button>
                            <button 
                              className="btn btn-sm btn-danger" 
                              onClick={() => handleDelete(zone)}
                              title="Delete zone"
                            >
                              <Icons.Trash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inactive Zones */}
          {inactiveZones.length > 0 && (
            <div className="card">
              <div className="card-header" style={{ backgroundColor: '#f3f4f6' }}>
                <h2 style={{ color: '#6b7280', margin: 0 }}>
                  Inactive Zones ({inactiveZones.length})
                </h2>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Zone</th>
                      <th>Base City</th>
                      <th>Schedule</th>
                      <th>Radius</th>
                      <th style={{ width: 140 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inactiveZones.map(zone => (
                      <tr key={zone.id} style={{ opacity: 0.7 }}>
                        <td>
                          <div>
                            <strong>{zone.name}</strong>
                            <div style={{ fontSize: 12, color: '#888' }}>ID: {zone.id}</div>
                          </div>
                        </td>
                        <td>{zone.base_city}</td>
                        <td>{zone.schedule}</td>
                        <td>{zone.radius} miles</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button 
                              className="btn btn-sm" 
                              onClick={() => handleEdit(zone)}
                              title="Edit zone"
                            >
                              <Icons.Edit />
                            </button>
                            <button 
                              className="btn btn-sm" 
                              onClick={() => handleToggleActive(zone)}
                              title="Activate zone"
                              style={{ color: '#10b981' }}
                            >
                              <Icons.Play />
                            </button>
                            <button 
                              className="btn btn-sm btn-danger" 
                              onClick={() => handleDelete(zone)}
                              title="Delete zone"
                            >
                              <Icons.Trash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DeliveryZonesView;
