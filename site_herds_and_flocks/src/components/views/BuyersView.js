/**
 * BuyersView - Manage buyer contacts
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { buyersService } from '../../services/api';

const BuyersView = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [form, setForm] = useState({
    name: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    is_active: true
  });

  useEffect(() => {
    loadBuyers();
  }, []);

  const loadBuyers = async () => {
    try {
      setLoading(true);
      const data = await buyersService.getAll();
      setBuyers(data);
    } catch (err) {
      setError('Failed to load buyers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBuyer) {
        await buyersService.update(editingBuyer.id, form);
      } else {
        await buyersService.create(form);
      }
      setShowForm(false);
      setEditingBuyer(null);
      setForm({ name: '', contact_name: '', phone: '', email: '', address: '', notes: '', is_active: true });
      loadBuyers();
    } catch (err) {
      setError('Failed to save buyer');
      console.error(err);
    }
  };

  const handleEdit = (buyer) => {
    setEditingBuyer(buyer);
    setForm({
      name: buyer.name || '',
      contact_name: buyer.contact_name || '',
      phone: buyer.phone || '',
      email: buyer.email || '',
      address: buyer.address || '',
      notes: buyer.notes || '',
      is_active: buyer.is_active !== false
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBuyer(null);
    setForm({ name: '', contact_name: '', phone: '', email: '', address: '', notes: '', is_active: true });
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Icons.Loader className="animate-spin" />
        <p>Loading buyers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Buyers</h1>
          <p className="subtitle">Manage buyer contacts for livestock sales</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Icons.Plus /> Add Buyer
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
            <h2>{editingBuyer ? 'Edit Buyer' : 'Add Buyer'}</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Business/Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Business or individual name"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Name</label>
                  <input
                    type="text"
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    placeholder="Primary contact person"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(555) 555-5555"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Full mailing address"
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Additional notes about this buyer"
                    rows={3}
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
                  {editingBuyer ? 'Update Buyer' : 'Add Buyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          {buyers.length === 0 ? (
            <div className="empty-state">
              <Icons.Users />
              <h3>No buyers yet</h3>
              <p>Add buyers to track your livestock sales contacts</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <Icons.Plus /> Add First Buyer
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {buyers.map((buyer) => (
                    <tr key={buyer.id}>
                      <td>
                        <strong>{buyer.name}</strong>
                        {buyer.address && <div className="text-muted small">{buyer.address}</div>}
                      </td>
                      <td>{buyer.contact_name || '-'}</td>
                      <td>{buyer.phone || '-'}</td>
                      <td>{buyer.email || '-'}</td>
                      <td>
                        <span className={`status-badge ${buyer.is_active ? 'status-active' : 'status-inactive'}`}>
                          {buyer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(buyer)}>
                          <Icons.Edit2 /> Edit
                        </button>
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

export default BuyersView;
