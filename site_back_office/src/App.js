/**
 * Hood Family Farms - Business Manager Application
 * Main App Component with Navigation and Routing
 */

import React, { useState, useEffect } from 'react';
import './App.css';

// Services
import { authService, accountsService, itemsService, transactionsService, deliveryZonesService, accountingService } from './services/api';

// Components
import { Icons } from './components/common/Icons';
import LoginPage from './components/auth/LoginPage';

// Views
import {
  DashboardView,
  AccountsView,
  ItemsView,
  BankFeedView,
  BankConnectionsView,
  JournalEntriesView,
  TransactionsView,
  ItemCategoriesView,
  ChartOfAccountsView,
  ReportsView,
  DeliveryZonesView,
  MenusView,
  MenuItemsView,
  EventsView,
  MediaLibraryView,
  BlogManagementView,
  SocialMediaView,
  SiteDesignerView,
} from './components/views';
import ModificationsManager from './components/views/ModificationsManager';
import BlogPreviewView from './components/views/BlogPreviewView';

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [previewPostId, setPreviewPostId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [chartOfAccounts, setChartOfAccounts] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['foodTrailer']); // Default expanded

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      loadData();
    }
    setLoading(false);
  }, []);

  // Load all data
  const loadData = async () => {
    setDataLoading(true);
    try {
      const [accountsRes, itemsRes, transactionsRes, zonesRes, coaRes] = await Promise.all([
        accountsService.getAll().catch(() => ({ data: [] })),
        itemsService.getAll().catch(() => ({ data: [] })),
        transactionsService.getAll().catch(() => ({ data: [] })),
        deliveryZonesService.getAll().catch(() => []),
        accountingService.getAccounts().catch(() => []),
      ]);
      setAccounts(accountsRes.data || []);
      setItems(itemsRes.data || []);
      setTransactions(transactionsRes.data || []);
      setDeliveryZones(Array.isArray(zonesRes) ? zonesRes : zonesRes.data || []);
      setChartOfAccounts(Array.isArray(coaRes) ? coaRes : coaRes.data || []);
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
    setAccounts([]);
    setItems([]);
    setTransactions([]);
    setDeliveryZones([]);
    setChartOfAccounts([]);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Handle blog preview navigation
  const handlePreviewPost = (postId) => {
    setPreviewPostId(postId);
    setCurrentView('blogPreview');
  };

  const handleBackFromPreview = () => {
    setPreviewPostId(null);
    setCurrentView('blogPosts');
  };

  // Loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <Icons.Loader />
        <p>Loading...</p>
      </div>
    );
  }

  // Login screen
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Navigation structure with sections
  const navStructure = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    
    // Food Trailer Section
    {
      id: 'foodTrailer',
      label: 'Food Trailer',
      icon: Icons.Truck,
      isSection: true,
      children: [
        { id: 'menus', label: 'Menus', icon: Icons.Menu },
        { id: 'menuItems', label: 'Menu Items', icon: Icons.List },
        { id: 'modifications', label: 'Modifications', icon: Icons.Edit },
        { id: 'events', label: 'Events', icon: Icons.Calendar },
      ],
    },
    
    // Inventory Section
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Icons.Package,
      isSection: true,
      children: [
        { id: 'items', label: 'Products', icon: Icons.Package },
        { id: 'itemCategories', label: 'Categories', icon: Icons.Tag },
      ],
    },
    
    // Accounting Section
    {
      id: 'accounting',
      label: 'Accounting',
      icon: Icons.DollarSign,
      isSection: true,
      children: [
        { id: 'transactions', label: 'Bookkeeping', icon: Icons.DollarSign },
        { id: 'bankFeed', label: 'Bank Feed', icon: Icons.Inbox },
        { id: 'bankConnections', label: 'Bank Connections', icon: Icons.Bank },
        { id: 'journalEntries', label: 'Journal Entries', icon: Icons.FileText },
        { id: 'chartOfAccounts', label: 'Chart of Accounts', icon: Icons.Book },
      ],
    },
    
    // Site Management Section
    {
      id: 'siteManagement',
      label: 'Site Management',
      icon: Icons.Image,
      isSection: true,
      children: [
        { id: 'siteDesigner', label: 'Site Designer', icon: Icons.Layout },
        { id: 'mediaLibrary', label: 'Media Library', icon: Icons.Image },
        { id: 'blogPosts', label: 'Blog Posts', icon: Icons.FileText },
        { id: 'socialMedia', label: 'Social Media', icon: Icons.TrendingUp },
      ],
    },
    
    // Other items
    { id: 'accounts', label: 'Customers', icon: Icons.Users },
    { id: 'deliveryZones', label: 'Delivery Zones', icon: Icons.MapPin },
    { id: 'reports', label: 'Reports', icon: Icons.BarChart },
  ];

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView accounts={accounts} items={items} transactions={transactions} />;
      case 'accounts':
        return <AccountsView accounts={accounts} loading={dataLoading} onRefresh={loadData} />;
      case 'items':
        return <ItemsView />;
      case 'bankFeed':
        return <BankFeedView />;
      case 'bankConnections':
        return <BankConnectionsView />;
      case 'journalEntries':
        return <JournalEntriesView />;
      case 'transactions':
        return <TransactionsView />;
      case 'itemCategories':
        return <ItemCategoriesView />;
      case 'chartOfAccounts':
        return <ChartOfAccountsView accounts={chartOfAccounts} loading={dataLoading} onRefresh={loadData} />;
      case 'reports':
        return <ReportsView />;
      case 'deliveryZones':
        return <DeliveryZonesView />;
      case 'menus':
        return <MenusView />;
      case 'menuItems':
        return <MenuItemsView />;
      case 'events':
        return <EventsView />;
      case 'modifications':
        return <ModificationsManager token={localStorage.getItem('token')} />;
      case 'mediaLibrary':
        return <MediaLibraryView />;
      case 'blogPosts':
        return <BlogManagementView onPreview={handlePreviewPost} />;
      case 'blogPreview':
        return <BlogPreviewView postId={previewPostId} onBack={handleBackFromPreview} />;
      case 'socialMedia':
        return <SocialMediaView />;
      case 'siteDesigner':
        return <SiteDesignerView />;
      default:
        return <DashboardView accounts={accounts} items={items} transactions={transactions} />;
    }
  };

  // Render navigation item
  const renderNavItem = (item, isChild = false) => {
    if (item.isSection) {
      const isExpanded = expandedSections.includes(item.id);
      const hasActiveChild = item.children?.some(child => child.id === currentView);
      
      return (
        <div key={item.id} className="nav-section">
          <button
            className={`nav-item nav-section-header ${hasActiveChild ? 'active-parent' : ''}`}
            onClick={() => toggleSection(item.id)}
          >
            <item.icon />
            {item.label}
            <span className={`nav-chevron ${isExpanded ? 'expanded' : ''}`}>
              <Icons.ChevronDown />
            </span>
          </button>
          {isExpanded && (
            <div className="nav-section-children">
              {item.children.map(child => renderNavItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.id}
        className={`nav-item ${isChild ? 'nav-child' : ''} ${currentView === item.id ? 'active' : ''}`}
        onClick={() => setCurrentView(item.id)}
      >
        <item.icon />
        {item.label}
      </button>
    );
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>🌱 Hood Family Farms</h1>
          <p>Business Manager</p>
        </div>
        
        <nav className="sidebar-nav">
          {navStructure.map(item => renderNavItem(item))}
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user.name?.charAt(0) || 'U'}</div>
            <div className="user-details">
              <div className="user-name">{user.name}</div>
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
