/**
 * Dashboard View
 * System overview with tenant health and key metrics
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../common/Icons';
import { systemService, tenantsService } from '../../services/api';
import { formatNumber, formatCurrency, formatRelativeTime } from '../../utils/formatters';

const DashboardView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
  try {
    setLoading(true);
    
    // Load tenants
    const tenantsData = await tenantsService.getAll({ limit: 5 }).catch(() => ({ data: [] }));
    setTenants(tenantsData.data || []);
    
    // Get dashboard stats
    let statsData = null;
    try {
      const response = await systemService.getDashboardStats();
      // Handle nested data structure: response is { status, data: { totalTenants, ... } }
      statsData = response?.data || response;
    } catch (err) {
      console.warn('Dashboard stats endpoint failed:', err);
    }
    
    setStats(statsData || {
      totalTenants: 0,
      activeTenants: 0,
      totalUsers: 0,
      totalTransactions: 0,
      systemHealth: 'unknown'
    });
  } catch (err) {
    console.error('Failed to load dashboard:', err);
    setError('Failed to load dashboard data');
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="empty-state">
        <Icons.Loader size={48} className="spin" />
        <p>Loading dashboard...</p>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="alert alert-warning mb-3">
          <Icons.AlertCircle size={18} />
          <span>{error} - Showing placeholder data</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Icons.Building size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(stats?.totalTenants ?? 0)}</div>
            <div className="stat-label">Total Tenants</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <Icons.CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(stats?.activeTenants ?? 0)}</div>
            <div className="stat-label">Active Tenants</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <Icons.Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(stats?.totalUsers ?? 0)}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon primary">
            <Icons.Activity size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(stats?.totalTransactions ?? 0)}</div>
            <div className="stat-label">Transactions (30d)</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent Tenants */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Tenants</h3>
              <p className="card-subtitle">Latest tenant activity</p>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/tenants')}
            >
              View All
              <Icons.ChevronRight size={16} />
            </button>
          </div>

          {tenants.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px' }}>
              <Icons.Building size={48} />
              <h3>No tenants yet</h3>
              <p>Create your first tenant to get started</p>
              <button 
                className="btn btn-primary mt-2"
                onClick={() => navigate('/onboarding')}
              >
                <Icons.Plus size={18} />
                Create Tenant
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tenants.map(tenant => (
                <div 
                  key={tenant.id}
                  className="tenant-card"
                  onClick={() => navigate(`/tenants/${tenant.id}`)}
                >
                  <div 
                    className="tenant-avatar"
                    style={{ 
                      background: tenant.is_active 
                        ? 'var(--accent-primary)' 
                        : 'var(--text-muted)' 
                    }}
                  >
                    {tenant.name?.charAt(0).toUpperCase() || 'T'}
                  </div>
                  <div className="tenant-info">
                    <div className="tenant-name">{tenant.name}</div>
                    <div className="tenant-details">
                      Created {formatRelativeTime(tenant.created_at)}
                    </div>
                  </div>
                  <span className={`badge badge-${tenant.is_active ? 'success' : 'neutral'}`}>
                    <span className={`status-dot ${tenant.is_active ? 'active' : 'inactive'}`}></span>
                    {tenant.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/onboarding')}
              style={{ justifyContent: 'flex-start' }}
            >
              <Icons.Rocket size={18} />
              <span>Onboard New Tenant</span>
            </button>

            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/tenants')}
              style={{ justifyContent: 'flex-start' }}
            >
              <Icons.Building size={18} />
              <span>Manage Tenants</span>
            </button>

            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/settings')}
              style={{ justifyContent: 'flex-start' }}
            >
              <Icons.Settings size={18} />
              <span>System Settings</span>
            </button>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>System Health</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className={`status-dot ${stats?.systemHealth === 'healthy' ? 'active' : 'pending'}`} style={{ width: '12px', height: '12px' }}></span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {stats?.systemHealth === 'healthy' ? 'All systems operational' : 'Status unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;