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

import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useTenantBranding } from './hooks/useTenantBranding';
import Login from './components/Login';
import KitchenDisplay from './components/KitchenDisplay';
import HelpView from './components/HelpView';

function App() {
  const { isAuthenticated, loading } = useAuth();
  const [showHelp, setShowHelp] = useState(false);

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

  if (showHelp) {
    return (
      <div style={{ height: '100vh', overflow: 'auto' }}>
        <div style={{ padding: '8px 16px', background: '#1f2937', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowHelp(false)} style={{ background: '#374151', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' }}>✕ Back to Kitchen</button>
        </div>
        <HelpView appSlug="kitchen" />
      </div>
    );
  }

  return <KitchenDisplay onShowHelp={() => setShowHelp(true)} />;
}

export default App;