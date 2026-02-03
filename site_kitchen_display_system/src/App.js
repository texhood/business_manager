/**
 * ===========================================================================
 * FILE: site_kitchen_display_system/src/App.js
 * ===========================================================================
 * Kitchen Display System
 *
 * CHANGES (tenant branding fix):
 *   - Added import of useTenantBranding hook
 *   - Added useTenantBranding('Kitchen Display') call in App component
 */

import React from 'react';
import { useAuth } from './context/AuthContext';
import { useTenantBranding } from './hooks/useTenantBranding';
import Login from './components/Login';
import KitchenDisplay from './components/KitchenDisplay';

function App() {
  const { isAuthenticated, loading } = useAuth();

  // Load tenant branding: sets CSS vars, document title, favicon
  useTenantBranding('Kitchen Display');

  if (loading) {
    return (
      <div className="kds-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <KitchenDisplay />;
}

export default App;