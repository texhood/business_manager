/**
 * AccountsView Component
 * Manage user accounts and customers
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { accountsService, deliveryZonesService } from '../../services/api';

const AccountsView = ({ accounts, loading, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    role: 'customer',
    delivery_zone_id: '',
    is_farm_member: false,
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    const loadZones = async () => {
      try {
        const zones = await deliveryZonesService.getAll();
        setDeliveryZones(Array.isArray(zones) ? zones : zones.data || []);
      } catch (err) {
        console.error('Failed to load delivery zones:', err);
      }
    };
    loadZones();
  }, []);

  const filtered = accounts.filter(a => {
    const matchSearch = a.name?.toLowerCase().includes(search.toLowerCase()) || 
                        a.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || a.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openEditModal = (account) => {
    setEditForm({
      name: account.name || '',
      email: account.email || '',
      phone: account.phone || '',
      address: account.address || '',
      city: account.city || '',
      state: account.state || '',
      zip_code: account.zip_code || '',
      role: account.role || 'customer',
      delivery_zone_id: account.delivery_zone_id || '',
      is_farm_member: account.is_farm_member || false,
      is_active: account.is_active !== false,
      notes: account.notes || ''
    });
    setEditModal(account);
  };

  const closeEditModal = () => {
    setEditModal(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const saveChanges = async () => {
    setEditLoading(true);
    try {
      await accountsService.update(editModal.id, editForm);
      closeEditModal();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to update account: ' + (err.response?.data?.message || err.message));
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Accounts</h1>
        <p className="subtitle">Manage customers and staff</p>
      </div>
      
      <div className="toolbar">
        <div className="search-box">
          <Icons.Search />
          <input 
            type="text" 
            placeholder="Search accounts..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <select 
          className="filter-select" 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="customer">Customer</option>
        </select>
      </div>
      
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Member</th>
                <th>Zone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>
                    <Icons.Loader /> Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#888'}}>
                    No accounts found
                  </td>
                </tr>
              ) : (
                filtered.map(account => (
                  <tr key={account.id}>
                    <td>
                      <strong 
                        style={{cursor: 'pointer', color: '#1976d2'}} 
                        onClick={() => openEditModal(account)}
                      >
                        {account.name}
                      </strong>
                    </td>
                    <td>{account.email}</td>
                    <td>
                      <span className={`badge ${
                        account.role === 'admin' ? 'badge-blue' : 
                        account.role === 'staff' ? 'badge-yellow' : 'badge-gray'
                      }`}>
                        {account.role}
                      </span>
                    </td>
                    <td>
                      {account.is_farm_member && <span className="badge badge-green">Member</span>}
                    </td>
                    <td>{account.delivery_zone_name || '—'}</td>
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        style={{padding: '6px 12px', fontSize: 13}}
                        onClick={() => openEditModal(account)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Account Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" style={{maxWidth: 600}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Account</h2>
              <button className="modal-close" onClick={closeEditModal}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input 
                    type="email" 
                    value={editForm.email}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="text" 
                    value={editForm.phone}
                    onChange={(e) => handleEditChange('phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select 
                    value={editForm.role}
                    onChange={(e) => handleEditChange('role', e.target.value)}
                  >
                    <option value="customer">Customer</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input 
                  type="text" 
                  value={editForm.address}
                  onChange={(e) => handleEditChange('address', e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    value={editForm.city}
                    onChange={(e) => handleEditChange('city', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input 
                    type="text" 
                    value={editForm.state}
                    onChange={(e) => handleEditChange('state', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input 
                    type="text" 
                    value={editForm.zip_code}
                    onChange={(e) => handleEditChange('zip_code', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Delivery Zone</label>
                  <select 
                    value={editForm.delivery_zone_id}
                    onChange={(e) => handleEditChange('delivery_zone_id', e.target.value || null)}
                  >
                    <option value="">No Zone</option>
                    {deliveryZones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8}}>
                    <input 
                      type="checkbox" 
                      checked={editForm.is_farm_member}
                      onChange={(e) => handleEditChange('is_farm_member', e.target.checked)}
                    />
                    Farm Member
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'}}>
                    <input 
                      type="checkbox" 
                      checked={editForm.is_active}
                      onChange={(e) => handleEditChange('is_active', e.target.checked)}
                    />
                    Active Account
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea 
                  value={editForm.notes}
                  onChange={(e) => handleEditChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeEditModal}>Cancel</button>
              <button className="btn btn-primary" onClick={saveChanges} disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsView;
