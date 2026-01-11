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
  AccountingCategoriesView,
  ChartOfAccountsView,
  ReportsView,
  DeliveryZonesView,
} from './components/views';

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [accounts, setAccounts] = useState([]);
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [chartOfAccounts, setChartOfAccounts] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

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

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'accounts', label: 'Accounts', icon: Icons.Users },
    { id: 'items', label: 'Items', icon: Icons.Package },
    { id: 'bankFeed', label: 'Bank Feed', icon: Icons.Inbox },
    { id: 'bankConnections', label: 'Bank Connections', icon: Icons.Bank },
    { id: 'journalEntries', label: 'Journal Entries', icon: Icons.FileText },
    { id: 'transactions', label: 'Bookkeeping', icon: Icons.DollarSign },
    { id: 'accountingCategories', label: 'Categories', icon: Icons.Tag },
    { id: 'chartOfAccounts', label: 'Chart of Accounts', icon: Icons.Book },
    { id: 'reports', label: 'Reports', icon: Icons.BarChart },
    { id: 'deliveryZones', label: 'Delivery Zones', icon: Icons.Truck },
  ];

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView accounts={accounts} items={items} transactions={transactions} />;
      case 'accounts':
        return <AccountsView accounts={accounts} loading={dataLoading} onRefresh={loadData} />;
      case 'items':
        return <ItemsView items={items} loading={dataLoading} />;
      case 'bankFeed':
        return <BankFeedView />;
      case 'bankConnections':
        return <BankConnectionsView />;
      case 'journalEntries':
        return <JournalEntriesView />;
      case 'transactions':
        return <TransactionsView />;
      case 'accountingCategories':
        return <AccountingCategoriesView />;
      case 'chartOfAccounts':
        return <ChartOfAccountsView accounts={chartOfAccounts} loading={dataLoading} onRefresh={loadData} />;
      case 'reports':
        return <ReportsView />;
      case 'deliveryZones':
        return <DeliveryZonesView zones={deliveryZones} loading={dataLoading} />;
      default:
        return <DashboardView accounts={accounts} items={items} transactions={transactions} />;
    }
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
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              <item.icon />
              {item.label}
            </button>
          ))}
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
