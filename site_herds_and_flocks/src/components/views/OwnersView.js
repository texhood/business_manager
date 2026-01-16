/**
 * OwnersView - Manage animal ownership records
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { lookupsService } from '../../services/api';

const OwnersView = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    contact_info: '',
    is_active: true
  });

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      setLoading(true);
      const data = await lookupsService.getOwners();
      setOwners(data);
    } catch (err) {
      setError('Failed to load owners');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await lookupsService.createOwner(form);
      setShowForm(false);
      setForm({ name: '', contact_info: '', is_active: true });
      loadOwners();
    } catch (err) {
      setError('Failed to save owner');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm({ name: '', contact_info: '', is_active: true });
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Icons.Loader className="animate-spin" />
        <p>Loading owners...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Owners</h1>
          <p className="subtitle">Track animal ownership for boarding or partnership arrangements</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Icons.Plus /> Add Owner
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <Icons.AlertCircle />
          {error}
          <button onClick={() => setError(null)}><Icons.X /></button>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2>Add Owner</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Person or business name"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Info</label>
                  <input
                    type="text"
                    value={form.contact_info}
                    onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
                    placeholder="Phone, email, or address"
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    Active
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          {owners.length === 0 ? (
            <div className="empty-state">
              <Icons.Users />
              <h3>No owners defined</h3>
              <p>Add owners to track livestock ownership</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <Icons.Plus /> Add First Owner
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact Info</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {owners.map((owner) => (
                    <tr key={owner.id}>
                      <td><strong>{owner.name}</strong></td>
                      <td>{owner.contact_info || '-'}</td>
                      <td>
                        <span className={`status-badge ${owner.is_active ? 'status-active' : 'status-inactive'}`}>
                          {owner.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnersView;
