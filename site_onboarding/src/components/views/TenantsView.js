/**
 * Tenants View
 * List and manage all tenants
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../common/Icons';
import { tenantsService } from '../../services/api';
import { formatDate, formatRelativeTime, getInitials } from '../../utils/formatters';

const TenantsView = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const response = await tenantsService.getAll();
      setTenants(response.data || []);
    } catch (err) {
      console.error('Failed to load tenants:', err);
      setError('Failed to load tenants');
      // Show default tenant for demo
      setTenants([
        {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Hood Family Farms',
          slug: 'hood-family-farms',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          user_count: 1,
          onboarding_complete: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = !searchTerm || 
      tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && tenant.is_active) ||
      (statusFilter === 'inactive' && !tenant.is_active);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="empty-state">
        <Icons.Loader size={48} className="spin" />
        <p>Loading tenants...</p>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="alert alert-warning mb-3">
          <Icons.AlertCircle size={18} />
          <span>{error} - Showing demo data</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="card mb-3" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Icons.Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} 
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>

          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button className="btn btn-secondary" onClick={loadTenants}>
            <Icons.RefreshCw size={18} />
            Refresh
          </button>

          <button className="btn btn-primary" onClick={() => navigate('/onboarding')}>
            <Icons.Plus size={18} />
            New Tenant
          </button>
        </div>
      </div>

      {/* Tenants List */}
      <div className="card">
        {filteredTenants.length === 0 ? (
          <div className="empty-state">
            <Icons.Building size={64} />
            <h3>No tenants found</h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first tenant to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button 
                className="btn btn-primary mt-2"
                onClick={() => navigate('/onboarding')}
              >
                <Icons.Plus size={18} />
                Create Tenant
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Status</th>
                  <th>Users</th>
                  <th>Created</th>
                  <th>Last Activity</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map(tenant => (
                  <tr key={tenant.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div 
                          className="tenant-avatar"
                          style={{ 
                            width: '36px', 
                            height: '36px',
                            fontSize: '14px',
                            background: tenant.primary_color || (tenant.is_active 
                              ? 'var(--accent-primary)' 
                              : 'var(--text-muted)')
                          }}
                        >
                          {getInitials(tenant.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                            {tenant.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {tenant.slug || tenant.id.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${tenant.is_active ? 'success' : 'neutral'}`}>
                        <span className={`status-dot ${tenant.is_active ? 'active' : 'inactive'}`}></span>
                        {tenant.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{tenant.user_count || 0}</td>
                    <td>{formatDate(tenant.created_at)}</td>
                    <td>{formatRelativeTime(tenant.last_activity_at || tenant.updated_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/tenants/${tenant.id}`)}
                          title="View Details"
                        >
                          <Icons.Eye size={14} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/tenants/${tenant.id}?tab=edit`)}
                          title="Edit"
                        >
                          <Icons.Edit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '16px', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--text-muted)',
        fontSize: '13px'
      }}>
        <span>Showing {filteredTenants.length} of {tenants.length} tenants</span>
      </div>
    </div>
  );
};

export default TenantsView;
