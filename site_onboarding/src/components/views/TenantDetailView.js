/**
 * Tenant Detail View
 * View and manage individual tenant configuration
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icons } from '../common/Icons';
import { tenantsService } from '../../services/api';
import { formatDate, formatCurrency, formatNumber, getInitials } from '../../utils/formatters';

const TenantDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  
  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'staff'
  });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState(null);

  useEffect(() => {
    loadTenantData();
  }, [id]);

  const loadTenantData = async () => {
    try {
      setLoading(true);
      const [tenantData, usersData, statsData] = await Promise.all([
        tenantsService.getById(id).catch(() => null),
        tenantsService.getUsers(id).catch(() => ({ data: [] })),
        tenantsService.getStats(id).catch(() => null)
      ]);

      if (tenantData) {
        setTenant(tenantData.data || tenantData);
      } else {
        // Demo fallback
        setTenant({
          id,
          name: 'Hood Family Farms',
          slug: 'hood-family-farms',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          settings: {
            business_name: 'Hood Family Farms',
            business_type: 'Farm',
            tax_rate: 8.25,
            timezone: 'America/Chicago'
          }
        });
      }

      setUsers(usersData.data || []);
      setStats(statsData?.data || {
        userCount: 1,
        transactionCount: 0,
        accountCount: 0,
        lastActivity: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to load tenant:', err);
      setError('Failed to load tenant details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserError(null);
    setAddUserLoading(true);

    try {
      await tenantsService.addUser(id, addUserForm);
      setShowAddUserModal(false);
      setAddUserForm({ email: '', password: '', name: '', role: 'staff' });
      // Reload users list
      const usersData = await tenantsService.getUsers(id);
      setUsers(usersData.data || []);
    } catch (err) {
      console.error('Failed to add user:', err);
      setAddUserError(err.response?.data?.message || 'Failed to add user. Please try again.');
    } finally {
      setAddUserLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Icons.Home },
    { id: 'users', label: 'Users', icon: Icons.Users },
    { id: 'settings', label: 'Settings', icon: Icons.Settings },
    { id: 'integrations', label: 'Integrations', icon: Icons.Link },
  ];

  if (loading) {
    return (
      <div className="empty-state">
        <Icons.Loader size={48} className="spin" />
        <p>Loading tenant details...</p>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="empty-state">
        <Icons.AlertCircle size={64} />
        <h3>Tenant not found</h3>
        <p>The requested tenant could not be found.</p>
        <button className="btn btn-primary mt-2" onClick={() => navigate('/tenants')}>
          Back to Tenants
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Tenant Header */}
      <div className="card mb-3">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div 
            className="tenant-avatar"
            style={{ 
              width: '64px', 
              height: '64px', 
              fontSize: '24px',
              background: tenant.primary_color || (tenant.is_active ? 'var(--accent-primary)' : 'var(--text-muted)')
            }}
          >
            {getInitials(tenant.name)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <h2 style={{ margin: 0, fontSize: '24px' }}>{tenant.name}</h2>
              <span className={`badge badge-${tenant.is_active ? 'success' : 'neutral'}`}>
                {tenant.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              ID: {tenant.id} • Created {formatDate(tenant.created_at)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/tenants')}>
              <Icons.ChevronLeft size={18} />
              Back
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                // Open the main back office app with tenant context
                const backOfficeUrl = `http://localhost:3006?tenant=${tenant.id}`;
                window.open(backOfficeUrl, '_blank');
              }}
            >
              <Icons.ExternalLink size={18} />
              Open Back Office
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '4px', 
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '-1px'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Stats */}
          <div className="stats-grid mb-3">
            <div className="stat-card">
              <div className="stat-icon primary"><Icons.Users size={24} /></div>
              <div className="stat-content">
                <div className="stat-value">{formatNumber(stats?.userCount || 0)}</div>
                <div className="stat-label">Users</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon success"><Icons.Activity size={24} /></div>
              <div className="stat-content">
                <div className="stat-value">{formatNumber(stats?.transactionCount || 0)}</div>
                <div className="stat-label">Transactions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning"><Icons.BookOpen size={24} /></div>
              <div className="stat-content">
                <div className="stat-value">{formatNumber(stats?.accountCount || 0)}</div>
                <div className="stat-label">GL Accounts</div>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="card">
              <h3 className="card-title mb-2">Business Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Business Name</div>
                  <div>{tenant.settings?.business_name || tenant.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Business Type</div>
                  <div>{tenant.settings?.business_type || 'Not set'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Tax Rate</div>
                  <div>{tenant.settings?.tax_rate ? `${tenant.settings.tax_rate}%` : 'Not set'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Timezone</div>
                  <div>{tenant.settings?.timezone || 'Not set'}</div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title mb-2">Integration Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icons.CreditCard size={18} />
                    <span>Stripe</span>
                  </div>
                  <span className="badge badge-neutral">Not Connected</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icons.Database size={18} />
                    <span>Plaid</span>
                  </div>
                  <span className="badge badge-neutral">Not Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Tenant Users</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddUserModal(true)}>
              <Icons.Plus size={16} />
              Add User
            </button>
          </div>

          {users.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px' }}>
              <Icons.Users size={48} />
              <h3>No users found</h3>
              <p>Add users to this tenant to grant access</p>
              <button className="btn btn-primary mt-2" onClick={() => setShowAddUserModal(true)}>
                <Icons.Plus size={16} />
                Add First User
              </button>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                          {getInitials(user.name || user.email)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{user.name || 'No name'}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{user.role}</span></td>
                    <td>
                      <span className={`badge badge-${user.is_active ? 'success' : 'neutral'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{user.last_login ? formatDate(user.last_login) : 'Never'}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm">
                        <Icons.Edit size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card">
          <h3 className="card-title mb-3">Tenant Settings</h3>
          
          <div className="form-group">
            <label className="form-label">Brand Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: tenant.primary_color || '#2d5016',
                  border: '1px solid var(--border-color)'
                }}
              />
              <div>
                <div style={{ fontWeight: 500 }}>{tenant.primary_color || '#2d5016'}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Used for branding throughout the Back Office</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Additional settings can be configured in the Back Office application.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="card">
          <h3 className="card-title mb-3">Integrations</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Integration management coming soon.
          </p>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Add User to {tenant.name}</h3>
              <button className="btn-close" onClick={() => setShowAddUserModal(false)}>
                <Icons.X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                {addUserError && (
                  <div className="alert alert-error mb-2">
                    <Icons.AlertCircle size={18} />
                    {addUserError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={addUserForm.name}
                    onChange={e => setAddUserForm({ ...addUserForm, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={addUserForm.email}
                    onChange={e => setAddUserForm({ ...addUserForm, email: e.target.value })}
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    value={addUserForm.password}
                    onChange={e => setAddUserForm({ ...addUserForm, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-control"
                    value={addUserForm.role}
                    onChange={e => setAddUserForm({ ...addUserForm, role: e.target.value })}
                  >
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddUserModal(false)}
                  disabled={addUserLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={addUserLoading}
                >
                  {addUserLoading ? (
                    <>
                      <Icons.Loader size={16} className="spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Icons.Plus size={16} />
                      Add User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDetailView;
