/**
 * AccountsView Component
 * Manage user accounts and customers
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { accountsService, deliveryZonesService } from '../../services/api';

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  role: 'customer',
  delivery_zone_id: '',
  is_farm_member: false,
  is_active: true,
  email_verified: false,
  notes: ''
};

const AccountsView = ({ accounts, loading, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalMode, setModalMode] = useState(null); // null | 'create' | 'edit'
  const [editingAccount, setEditingAccount] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });

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

  const openCreateModal = () => {
    setForm({ ...EMPTY_FORM });
    setEditingAccount(null);
    setModalMode('create');
  };

  const openEditModal = (account) => {
    setForm({
      name: account.name || '',
      email: account.email || '',
      password: '',
      phone: account.phone || '',
      address: account.address || '',
      city: account.city || '',
      state: account.state || '',
      zip_code: account.zip_code || '',
      role: account.role || 'customer',
      delivery_zone_id: account.delivery_zone_id || '',
      is_farm_member: account.is_farm_member || false,
      is_active: account.is_active !== false,
      email_verified: account.email_verified || false,
      notes: account.notes || ''
    });
    setEditingAccount(account);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingAccount(null);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      alert('Name and email are required.');
      return;
    }
    if (modalMode === 'create' && !form.password.trim()) {
      alert('Password is required for new accounts.');
      return;
    }

    setSaveLoading(true);
    try {
      if (modalMode === 'create') {
        await accountsService.create(form);
      } else {
        // Don't send password field on edit unless it was filled in
        const updateData = { ...form };
        if (!updateData.password) {
          delete updateData.password;
        }
        await accountsService.update(editingAccount.id, updateData);
      }
      closeModal();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Failed to ${modalMode === 'create' ? 'create' : 'update'} account: ` + (err.response?.data?.message || err.message));
    } finally {
      setSaveLoading(false);
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
          <option value="tenant_admin">Tenant Admin</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="accountant">Accountant</option>
          <option value="customer">Customer</option>
        </select>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Icons.Plus /> Add Account
        </button>
      </div>
      
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Member</th>
                <th>Zone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '40px'}}>
                    <Icons.Loader /> Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#888'}}>
                    No accounts found
                  </td>
                </tr>
              ) : (
                filtered.map(account => (
                  <tr key={account.id} style={account.is_active === false ? {opacity: 0.5} : {}}>
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
                        account.role === 'super_admin' ? 'badge-red' :
                        account.role === 'tenant_admin' ? 'badge-purple' :
                        account.role === 'admin' ? 'badge-blue' : 
                        account.role === 'accountant' ? 'badge-teal' :
                        account.role === 'staff' ? 'badge-yellow' : 'badge-gray'
                      }`}>
                        {account.role === 'tenant_admin' ? 'Tenant Admin' :
                         account.role === 'super_admin' ? 'Super Admin' :
                         account.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${account.is_active !== false ? 'badge-green' : 'badge-gray'}`}>
                        {account.is_active !== false ? 'Active' : 'Inactive'}
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

      {/* Create / Edit Account Modal */}
      {modalMode && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" style={{maxWidth: 600}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Add Account' : 'Edit Account'}</h2>
              <button className="modal-close" onClick={closeModal}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input 
                    type="text" 
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input 
                    type="email" 
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{modalMode === 'create' ? 'Password *' : 'New Password'}</label>
                  <input 
                    type="password" 
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder={modalMode === 'edit' ? 'Leave blank to keep current' : ''}
                    required={modalMode === 'create'}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select 
                    value={form.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                  >
                    <option value="customer">Customer</option>
                    <option value="accountant">Accountant</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="tenant_admin">Tenant Admin</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="text" 
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Delivery Zone</label>
                  <select 
                    value={form.delivery_zone_id}
                    onChange={(e) => handleChange('delivery_zone_id', e.target.value || null)}
                  >
                    <option value="">No Zone</option>
                    {deliveryZones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input 
                  type="text" 
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    value={form.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input 
                    type="text" 
                    value={form.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input 
                    type="text" 
                    value={form.zip_code}
                    onChange={(e) => handleChange('zip_code', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8}}>
                    <input 
                      type="checkbox" 
                      checked={form.is_farm_member}
                      onChange={(e) => handleChange('is_farm_member', e.target.checked)}
                    />
                    Farm Member
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8}}>
                    <input 
                      type="checkbox" 
                      checked={form.is_active}
                      onChange={(e) => handleChange('is_active', e.target.checked)}
                    />
                    Active Account
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'}}>
                    <input 
                      type="checkbox" 
                      checked={form.email_verified}
                      onChange={(e) => handleChange('email_verified', e.target.checked)}
                    />
                    Email Verified
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea 
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saveLoading}>
                {saveLoading ? 'Saving...' : (modalMode === 'create' ? 'Create Account' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsView;
