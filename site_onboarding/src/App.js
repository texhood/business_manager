/**
 * System Administration & Onboarding Portal
 * Main Application Component
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import LoginView from './components/views/LoginView';
import DashboardView from './components/views/DashboardView';
import TenantsView from './components/views/TenantsView';
import TenantDetailView from './components/views/TenantDetailView';
import OnboardingWizard from './components/views/OnboardingWizard';
import SystemSettingsView from './components/views/SystemSettingsView';
import { authService } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        try {
          const response = await authService.getProfile();
          const userData = response.data || response;
          // Verify user is a super admin
          if (userData.role === 'super_admin') {
            setUser(userData);
          } else {
            localStorage.removeItem('admin_token');
          }
        } catch (err) {
          localStorage.removeItem('admin_token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('admin_token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading System Admin...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <AdminLayout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/tenants" element={<TenantsView />} />
          <Route path="/tenants/:id" element={<TenantDetailView />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
          <Route path="/settings" element={<SystemSettingsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  );
}

export default App;
