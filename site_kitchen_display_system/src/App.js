import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import KitchenDisplay from './components/KitchenDisplay';

function App() {
  const { isAuthenticated, loading } = useAuth();

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
