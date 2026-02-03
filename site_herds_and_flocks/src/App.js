/**
 * ===========================================================================
 * FILE: site_herds_and_flocks/src/App.js
 * ===========================================================================
 * Herds, Flocks & Pastures
 * Main App Component with Navigation and Routing
 *
 * CHANGES (tenant branding fix):
 *   - Added import of useTenantBranding hook
 *   - Added useTenantBranding('Herds & Flocks') call in App component
 */

import React, { useState, useEffect } from 'react';
import './App.css';

// Services
import { authService, statsService } from './services/api';

// Tenant Branding
import { useTenantBranding } from './hooks/useTenantBranding';

// Components
import { Icons } from './components/common/Icons';
import LoginPage from './components/auth/LoginPage';
import PasturesView from './components/views/PasturesView';
import HerdsFlocksView from './components/views/HerdsFlocksView';
import AnimalsView from './components/views/AnimalsView';
import HealthRecordsView from './components/views/HealthRecordsView';
import WeightTrackingView from './components/views/WeightTrackingView';
import GrazingEventsView from './components/views/GrazingEventsView';
import SoilSamplesView from './components/views/SoilSamplesView';
import PastureTasksView from './components/views/PastureTasksView';
import PastureTreatmentsView from './components/views/PastureTreatmentsView';
import ProcessingRecordsView from './components/views/ProcessingRecordsView';
import SaleTicketsView from './components/views/SaleTicketsView';
import BuyersView from './components/views/BuyersView';
import BreedsView from './components/views/BreedsView';
import AnimalCategoriesView from './components/views/AnimalCategoriesView';
import FeeTypesView from './components/views/FeeTypesView';
import OwnersView from './components/views/OwnersView';
import RainfallView from './components/views/RainfallView';

// ============================================================================
// TEMPORARY PLACEHOLDER VIEWS (until proper views are created)
// ============================================================================

const DashboardView = ({ stats, loading }) => (
  <div>
    <div className="page-header">
      <h1>Dashboard</h1>
      <p className="subtitle">Overview of your livestock operations</p>
    </div>
    
    {loading ? (
      <div className="loading-state">
        <Icons.Loader className="animate-spin" />
        <p>Loading statistics...</p>
      </div>
    ) : (
      <>
        <div className="stats-grid">
          <div className="stat-card cattle">
            <div className="stat-icon"><Icons.Cow /></div>
            <div className="stat-content">
              <span className="stat-label">Cattle</span>
              <span className="stat-value">{stats?.cattle || 0}</span>
            </div>
          </div>
          <div className="stat-card sheep">
            <div className="stat-icon"><Icons.Sheep /></div>
            <div className="stat-content">
              <span className="stat-label">Sheep/Goats</span>
              <span className="stat-value">{stats?.sheep || 0}</span>
            </div>
          </div>
          <div className="stat-card poultry">
            <div className="stat-icon"><Icons.Chicken /></div>
            <div className="stat-content">
              <span className="stat-label">Poultry</span>
              <span className="stat-value">{stats?.poultry || 0}</span>
            </div>
          </div>
          <div className="stat-card pastures">
            <div className="stat-icon"><Icons.TreeDeciduous /></div>
            <div className="stat-content">
              <span className="stat-label">Pastures</span>
              <span className="stat-value">{stats?.pastures || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary"><Icons.Plus /> Add Animal</button>
              <button className="btn btn-secondary"><Icons.Receipt /> New Sale Ticket</button>
              <button className="btn btn-secondary"><Icons.Scale /> Record Weight</button>
              <button className="btn btn-secondary"><Icons.Stethoscope /> Health Record</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="card-body">
            <div className="empty-state">
              <Icons.Clipboard />
              <h3>No recent activity</h3>
              <p>Activity from your livestock operations will appear here</p>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
);

const PlaceholderView = ({ title, subtitle, icon: IconComponent }) => (
  <div>
    <div className="page-header">
      <h1>{title}</h1>
      <p className="subtitle">{subtitle}</p>
    </div>
    <div className="card">
      <div className="card-body">
        <div className="empty-state">
          <IconComponent />
          <h3>Coming Soon</h3>
          <p>This feature is under development</p>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [dataLoading, setDataLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['livestock', 'pastures', 'sales', 'settings']);

  // Load tenant branding: sets CSS vars, document title, favicon
  useTenantBranding('Herds & Flocks');

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      loadData();
    }
    setLoading(false);
  }, []);

  // Load dashboard data
  const loadData = async () => {
    setDataLoading(true);
    try {
      const statsRes = await statsService.getDashboard().catch(() => ({ data: {} }));
      setStats(statsRes.data || {});
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogin = (user) => {
    setUser(user);
    loadData();
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setStats({});
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <Icons.Loader className="animate-spin" />
        <p>Loading...</p>
      </div>
    );
  }

  // Login screen
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Navigation structure
  const navStructure = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    
    // Livestock Section
    {
      id: 'livestock',
      label: 'Livestock',
      icon: Icons.Cow,
      isSection: true,
      children: [
        { id: 'herdsFlocks', label: 'Herds & Flocks', icon: Icons.Grid },
        { id: 'animals', label: 'Animals', icon: Icons.Tag },
        { id: 'health', label: 'Health Records', icon: Icons.Stethoscope },
        { id: 'weights', label: 'Weight Tracking', icon: Icons.Scale },
        { id: 'processing', label: 'Processing Records', icon: Icons.Truck },
      ],
    },
    
    // Pastures Section
    {
      id: 'pastures',
      label: 'Land Management',
      icon: Icons.TreeDeciduous,
      isSection: true,
      children: [
        { id: 'pasturesList', label: 'Pastures', icon: Icons.Fence },
        { id: 'grazing', label: 'Grazing Events', icon: Icons.Calendar },
        { id: 'soil', label: 'Soil Samples', icon: Icons.Clipboard },
        { id: 'pastureTasks', label: 'Tasks', icon: Icons.CheckSquare },
        { id: 'pastureTreatments', label: 'Treatments', icon: Icons.Spray },
      ],
    },
    
    // Rainfall (standalone)
    { id: 'rainfall', label: 'Rainfall', icon: Icons.CloudRain },
    
    // Sales Section
    {
      id: 'sales',
      label: 'Sales',
      icon: Icons.DollarSign,
      isSection: true,
      children: [
        { id: 'saleTickets', label: 'Sale Tickets', icon: Icons.Receipt },
        { id: 'buyers', label: 'Buyers', icon: Icons.Users },
      ],
    },
    
    // Settings Section
    {
      id: 'settings',
      label: 'Settings',
      icon: Icons.List,
      isSection: true,
      children: [
        { id: 'breeds', label: 'Breeds', icon: Icons.Tag },
        { id: 'animalCategories', label: 'Animal Categories', icon: Icons.Grid },
        { id: 'owners', label: 'Owners', icon: Icons.Users },
        { id: 'feeTypes', label: 'Fee Types', icon: Icons.DollarSign },
      ],
    },
  ];

  // Render navigation items
  const renderNavItems = () => {
    return navStructure.map((item) => {
      if (item.isSection) {
        const isExpanded = expandedSections.includes(item.id);
        return (
          <div key={item.id} className="nav-section">
            <button 
              className="nav-section-header"
              onClick={() => toggleSection(item.id)}
            >
              <item.icon />
              <span>{item.label}</span>
              <Icons.ChevronDown style={{ 
                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s',
                marginLeft: 'auto'
              }} />
            </button>
            {isExpanded && (
              <div className="nav-section-items">
                {item.children.map((child) => (
                  <button
                    key={child.id}
                    className={`nav-item ${currentView === child.id ? 'active' : ''}`}
                    onClick={() => setCurrentView(child.id)}
                  >
                    <child.icon />
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }
      
      return (
        <button
          key={item.id}
          className={`nav-item ${currentView === item.id ? 'active' : ''}`}
          onClick={() => setCurrentView(item.id)}
        >
          <item.icon />
          {item.label}
        </button>
      );
    });
  };

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView stats={stats} loading={dataLoading} />;
      case 'herdsFlocks':
        return <HerdsFlocksView />;
      case 'animals':
        return <AnimalsView />;
      case 'health':
        return <HealthRecordsView />;
      case 'weights':
        return <WeightTrackingView />;
      case 'processing':
        return <ProcessingRecordsView />;
      case 'pasturesList':
        return <PasturesView />;
      case 'grazing':
        return <GrazingEventsView />;
      case 'soil':
        return <SoilSamplesView />;
      case 'pastureTasks':
        return <PastureTasksView />;
      case 'pastureTreatments':
        return <PastureTreatmentsView />;
      case 'saleTickets':
        return <SaleTicketsView />;
      case 'buyers':
        return <BuyersView />;
      case 'breeds':
        return <BreedsView />;
      case 'animalCategories':
        return <AnimalCategoriesView />;
      case 'owners':
        return <OwnersView />;
      case 'feeTypes':
        return <FeeTypesView />;
      case 'rainfall':
        return <RainfallView />;
      default:
        return <DashboardView stats={stats} loading={dataLoading} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>🐄 Herds & Flocks</h1>
          <p>Livestock Management</p>
        </div>

        <nav className="sidebar-nav">
          {renderNavItems()}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{user.name || user.email}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <Icons.LogOut />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;