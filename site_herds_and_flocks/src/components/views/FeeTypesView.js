/**
 * FeeTypesView - Manage sale fee type definitions
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { saleFeeTypesService } from '../../services/api';

const FeeTypesView = () => {
  const [feeTypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    default_amount: '',
    is_percentage: false,
    percentage_rate: '',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    loadFeeTypes();
  }, []);

  const loadFeeTypes = async () => {
    try {
      setLoading(true);
      const data = await saleFeeTypesService.getAll();
      setFeeTypes(data);
    } catch (err) {
      setError('Failed to load fee types');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saleFeeTypesService.create({
        ...form,
        default_amount: form.default_amount ? parseFloat(form.default_amount) : null,
        percentage_rate: form.percentage_rate ? parseFloat(form.percentage_rate) : null,
        sort_order: parseInt(form.sort_order) || 0
      });
      setShowForm(false);
      setForm({ name: '', description: '', default_amount: '', is_percentage: false, percentage_rate: '', sort_order: 0, is_active: true });
      loadFeeTypes();
    } catch (err) {
      setError('Failed to save fee type');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm({ name: '', description: '', default_amount: '', is_percentage: false, percentage_rate: '', sort_order: 0, is_active: true });
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Icons.Loader className="animate-spin" />
        <p>Loading fee types...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Fee Types</h1>
          <p className="subtitle">Define fee types for sale tickets (e.g., Commission, Hauling, Processing)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Icons.Plus /> Add Fee Type
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
            <h2>Add Fee Type</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Fee Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Commission, Hauling, Check-off"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description"
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.is_percentage}
                      onChange={(e) => setForm({ ...form, is_percentage: e.target.checked })}
                    />
                    Calculate as percentage of sale
                  </label>
                </div>
                {form.is_percentage ? (
                  <div className="form-group">
                    <label>Percentage Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.percentage_rate}
                      onChange={(e) => setForm({ ...form, percentage_rate: e.target.value })}
                      placeholder="e.g., 3.5"
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Default Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.default_amount}
                      onChange={(e) => setForm({ ...form, default_amount: e.target.value })}
                      placeholder="e.g., 50.00"
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Sort Order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Fee Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          {feeTypes.length === 0 ? (
            <div className="empty-state">
              <Icons.DollarSign />
              <h3>No fee types defined</h3>
              <p>Add fee types to track deductions on sale tickets</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <Icons.Plus /> Add First Fee Type
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Default Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {feeTypes.map((feeType) => (
                    <tr key={feeType.id}>
                      <td><strong>{feeType.name}</strong></td>
                      <td>{feeType.description || '-'}</td>
                      <td>
                        <span className={`fee-type-badge ${feeType.is_percentage ? 'percentage' : 'fixed'}`}>
                          {feeType.is_percentage ? 'Percentage' : 'Fixed Amount'}
                        </span>
                      </td>
                      <td>
                        {feeType.is_percentage 
                          ? `${feeType.percentage_rate || 0}%`
                          : feeType.default_amount 
                            ? `$${parseFloat(feeType.default_amount).toFixed(2)}`
                            : '-'
                        }
                      </td>
                      <td>
                        <span className={`status-badge ${feeType.is_active ? 'status-active' : 'status-inactive'}`}>
                          {feeType.is_active ? 'Active' : 'Inactive'}
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

      <style>{`
        .fee-type-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .fee-type-badge.percentage {
          background: #e0f2fe;
          color: #0369a1;
        }
        .fee-type-badge.fixed {
          background: #f0fdf4;
          color: #15803d;
        }
      `}</style>
    </div>
  );
};

export default FeeTypesView;
