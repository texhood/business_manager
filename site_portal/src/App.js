/**
 * App.js — Tenant Portal
 * SSO entry point and app launcher
 * 
 * Flow:
 *   1. Resolve tenant from subdomain → apply branding
 *   2. Check for existing auth token
 *   3. Show login or portal dashboard
 */

import React, { useState, useEffect } from 'react';
import { useTenantBranding } from './hooks/useTenantBranding';
import { authService } from './services/api';
import LoginPage from './components/LoginPage';
import PortalDashboard from './components/PortalDashboard';

function App() {
  const tenant = useTenantBranding('Portal');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      // Verify token is still valid
      authService.getMe()
        .then(freshUser => {
          setUser(freshUser);
          setLoading(false);
        })
        .catch(() => {
          authService.logout();
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="portal-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage tenant={tenant} onLogin={handleLogin} />;
  }

  return <PortalDashboard user={user} onLogout={handleLogout} />;
}

export default App;
