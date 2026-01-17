/**
 * Admin Layout Component
 * Main layout wrapper with sidebar navigation
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icons } from '../common/Icons';
import { getInitials } from '../../utils/formatters';

const AdminLayout = ({ children, user, onLogout }) => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/tenants') return 'Tenants';
    if (path.startsWith('/tenants/')) return 'Tenant Details';
    if (path === '/onboarding') return 'New Tenant Onboarding';
    if (path === '/settings') return 'System Settings';
    return 'System Admin';
  };

  const navItems = [
    { path: '/', icon: Icons.Home, label: 'Dashboard' },
    { path: '/tenants', icon: Icons.Building, label: 'Tenants' },
    { path: '/onboarding', icon: Icons.Rocket, label: 'New Tenant' },
  ];

  const systemItems = [
    { path: '/settings', icon: Icons.Settings, label: 'Settings' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Icons.Shield size={20} />
            </div>
            <span>System Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main</div>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `nav-item ${isActive && location.pathname === item.path ? 'active' : ''}`
                }
                end={item.path === '/'}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="nav-section">
            <div className="nav-section-title">System</div>
            {systemItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {getInitials(user?.name || user?.email)}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name || user?.email}</div>
              <div className="user-role">Super Admin</div>
            </div>
            <button 
              onClick={onLogout}
              className="btn btn-secondary btn-sm"
              title="Log out"
              style={{ padding: '6px' }}
            >
              <Icons.LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <h1 className="content-title">{getPageTitle()}</h1>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
