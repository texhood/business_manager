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
    const checkAuth = async () => {
      // Check for existing localStorage session
      const storedUser = authService.getCurrentUser();
      if (storedUser) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
        } catch {
          authService.logout();
          setUser(null);
        }
      } else {
        // No local token — try SSO cookie
        const ssoUser = await authService.checkSSOSession();
        if (ssoUser) {
          setUser(ssoUser);
        }
      }
      setLoading(false);
    };
    checkAuth();
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
