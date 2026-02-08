/**
 * PortalDashboard Component
 * The main app launcher view — shows categorized app cards with access gating
 */

import React, { useState, useEffect } from 'react';
import { LogOut, ArrowUpRight } from 'lucide-react';
import { portalService, authService } from '../services/api';
import AppCard from './AppCard';

const CATEGORY_LABELS = {
  core: 'Core',
  sales: 'Sales & Commerce',
  operations: 'Operations',
  analytics: 'Analytics & Reporting',
};

const CATEGORY_ORDER = ['core', 'sales', 'operations', 'analytics'];

const PortalDashboard = ({ user, onLogout, HelpView }) => {
  const [launcherData, setLauncherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    loadLauncher();
  }, []);

  const loadLauncher = async () => {
    try {
      const data = await portalService.getLauncher();
      setLauncherData(data);
    } catch (err) {
      console.error('Failed to load launcher:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchApp = async (app) => {
    try {
      // Record the access
      await portalService.recordAccess(app.slug);
    } catch (err) {
      // Non-blocking — still launch the app
      console.warn('Failed to record app access:', err);
    }

    // Open app in a new tab
    window.open(app.url, '_blank', 'noopener,noreferrer');
  };

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  if (loading) {
    return (
      <div className="portal-loading">
        <div className="spinner" />
        <p>Loading your applications…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portal-loading">
        <p style={{ color: '#b91c1c' }}>{error}</p>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={loadLauncher}>
          Retry
        </button>
      </div>
    );
  }

  const { tenant, apps, categories } = launcherData;
  const tenantInitial = (tenant?.name || 'B').charAt(0).toUpperCase();
  const hasLockedApps = apps.some(a => !a.hasAccess && a.accessReason === 'tier_required');

  // Get plan badge class
  const planClass = (tenant.planSlug || 'starter').toLowerCase();

  return (
    <div className="portal-layout">
      {/* Header */}
      <header className="portal-header">
        <div className="portal-header-left">
          {tenant.logoUrl ? (
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              className="tenant-logo"
              style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }}
            />
          ) : (
            <div className="tenant-logo">{tenantInitial}</div>
          )}
          <span className="tenant-name">{tenant.name}</span>
        </div>

        <div className="portal-header-right">
          <span className="user-info">{launcherData.user?.name || launcherData.user?.email}</span>
          <span className="user-role">{launcherData.user?.role?.replace('_', ' ')}</span>
          {HelpView && (
            <button onClick={() => setShowHelp(!showHelp)} style={{ background: showHelp ? 'var(--brand-color, #2d5016)' : 'transparent', color: '#333', border: '1px solid #d1d5db', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', ...(showHelp ? {color:'#fff'} : {}) }}>
              {showHelp ? '✕ Close Help' : '📖 Help'}
            </button>
          )}
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      {showHelp && HelpView ? (
        <main className="portal-main" style={{ padding: 0 }}>
          <HelpView appSlug="portal" />
        </main>
      ) : (
      <main className="portal-main">
        <div className="portal-welcome">
          <h2>
            Your Applications
            <span className={`plan-badge ${planClass}`}>
              {tenant.planName || 'Starter'} Plan
            </span>
          </h2>
          <p>Select an application to get started</p>
        </div>

        {/* App categories */}
        {CATEGORY_ORDER.map(categoryKey => {
          const categoryApps = categories[categoryKey];
          if (!categoryApps || categoryApps.length === 0) return null;

          return (
            <div key={categoryKey} className="app-category">
              <h3>{CATEGORY_LABELS[categoryKey] || categoryKey}</h3>
              <div className="app-grid">
                {categoryApps.map(app => (
                  <AppCard
                    key={app.slug}
                    app={app}
                    onLaunch={handleLaunchApp}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Upgrade banner — show if there are locked tier-gated apps */}
        {hasLockedApps && (
          <div className="upgrade-banner">
            <div className="upgrade-text">
              <h4>Unlock more tools for your business</h4>
              <p>Upgrade your plan to access additional applications like Restaurant POS, Livestock Management, and more.</p>
            </div>
            <button className="btn-upgrade">
              <ArrowUpRight size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Upgrade Plan
            </button>
          </div>
        )}
      </main>
      )}
    </div>
  );
};

export default PortalDashboard;
