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
  DataImportView,
} from './components/views';
import ModificationsManager from './components/views/ModificationsManager';
import BlogPreviewView from './components/views/BlogPreviewView';

// ============================================================================
// HELPER: Convert hex to HSL for generating color variations
// ============================================================================
function hexToHsl(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: h = 0;
    }
  }
  
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function applyBrandColor(hexColor) {
  const hsl = hexToHsl(hexColor);
  const root = document.documentElement;
  
  // Set CSS custom properties
  root.style.setProperty('--brand-color', hexColor);
  root.style.setProperty('--brand-color-h', hsl.h);
  root.style.setProperty('--brand-color-s', `${hsl.s}%`);
  root.style.setProperty('--brand-color-l', `${hsl.l}%`);
  
  // Generate variations
  root.style.setProperty('--brand-color-light', `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 15, 90)}%)`);
  root.style.setProperty('--brand-color-dark', `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 10, 10)}%)`);
  root.style.setProperty('--brand-color-bg', `hsl(${hsl.h}, ${Math.max(hsl.s - 30, 10)}%, 95%)`);
}

// ============================================================================
// HELPER: Extract tenant slug from subdomain
// ============================================================================
function getTenantSlugFromSubdomain() {
  const hostname = window.location.hostname;
  
  // Handle localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  // Pattern: {tenant-slug}.{app}.hoodfamilyfarms.com or {tenant-slug}.hoodfamilyfarms.com
  const domainParts = hostname.split('.');
  
  // Need at least: tenant.app.domain.com (4 parts) or tenant.domain.com (3 parts with known domain)
  if (domainParts.length >= 3) {
    const potentialSlug = domainParts[0];
    
    // Reserved subdomains that are NOT tenant slugs
    const reservedSubdomains = [
      'www', 'api', 'office', 'pos', 'kds', 'herds', 'onboard', 
      'app', 'admin', 'mail', 'smtp', 'ftp', 'cdn', 'static',
      'dev', 'staging', 'test', 'demo'
    ];
    
    if (!reservedSubdomains.includes(potentialSlug.toLowerCase())) {
      return potentialSlug;
    }
  }
  
  return null;
}

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
  const [tenant, setTenant] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  // Lookup tenant ID by slug (public, no auth required)
  const lookupTenantBySlug = async (slug) => {
    if (!slug) return null;
    
    console.log('lookupTenantBySlug: Looking up tenant by slug:', slug);
    
    try {
      // API_URL already includes /api/v1, so just append the endpoint
      const response = await fetch(`${API_URL}/tenants/by-slug/${slug}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('lookupTenantBySlug: Found tenant:', data);
        return data.data || data;
      } else {
        console.error('lookupTenantBySlug: Tenant not found for slug:', slug);
      }
    } catch (err) {
      console.error('lookupTenantBySlug: Error looking up tenant:', err);
    }
    
    return null;
  };

  // Fetch tenant branding (public, no auth required)
  const loadTenantBranding = async (tenantId) => {
    if (!tenantId) {
      console.log('loadTenantBranding: No tenant ID provided');
      return null;
    }
    
    console.log('loadTenantBranding: Fetching tenant', tenantId);
    
    try {
      // Use the public branding endpoint (no auth required)
      // API_URL already includes /api/v1, so just append the endpoint
      const response = await fetch(`${API_URL}/tenants/${tenantId}/branding`);
      
      console.log('loadTenantBranding: Response status', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('loadTenantBranding: Data received', data);
        const tenantData = data.data || data;
        setTenant(tenantData);
        
        // Apply brand color
        if (tenantData.primary_color) {
          console.log('loadTenantBranding: Applying color', tenantData.primary_color);
          applyBrandColor(tenantData.primary_color);
        }
        
        return tenantData;
      } else {
        const errorText = await response.text();
        console.error('loadTenantBranding: Error response', response.status, errorText);
      }
    } catch (err) {
      console.error('loadTenantBranding: Failed to load tenant:', err);
    }
    return null;
  };

  // Check for existing session on mount
  useEffect(() => {
    const init = async () => {
      console.log('App init starting...');
      
      // ========================================
      // Step 1: Extract tenant slug from subdomain
      // ========================================
      const subdomainSlug = getTenantSlugFromSubdomain();
      console.log('Subdomain tenant slug:', subdomainSlug);
      
      // ========================================
      // Step 2: Check for tenant ID override in URL query params
      // ========================================
      const urlParams = new URLSearchParams(window.location.search);
      let urlTenantId = urlParams.get('tenant');
      
      // Sanitize tenant ID (remove any trailing paths that might have been added accidentally)
      if (urlTenantId && urlTenantId.includes('/')) {
        urlTenantId = urlTenantId.split('/')[0];
      }
      
      console.log('URL tenant ID:', urlTenantId);
      
      if (urlTenantId) {
        localStorage.setItem('tenant_id_override', urlTenantId);
      }
      
      // ========================================
      // Step 3: Look up tenant ID from subdomain slug if needed
      // ========================================
      let subdomainTenantId = null;
      if (subdomainSlug && !urlTenantId) {
        const tenantData = await lookupTenantBySlug(subdomainSlug);
        if (tenantData && tenantData.id) {
          subdomainTenantId = tenantData.id;
          console.log('Resolved subdomain slug to tenant ID:', subdomainTenantId);
          // Store it for future use
          localStorage.setItem('tenant_id_override', subdomainTenantId);
        }
      }
      
      // ========================================
      // Step 4: Determine final tenant ID to use
      // Priority: URL param > subdomain > stored override > user's tenant
      // ========================================
      const storedUser = authService.getCurrentUser();
      let storedOverride = localStorage.getItem('tenant_id_override');
      
      // Sanitize stored override too
      if (storedOverride && storedOverride.includes('/')) {
        storedOverride = storedOverride.split('/')[0];
        localStorage.setItem('tenant_id_override', storedOverride);
      }
      
      const tenantIdToLoad = urlTenantId || subdomainTenantId || storedOverride || storedUser?.tenant_id;
      
      console.log('Stored user:', storedUser);
      console.log('Stored override:', storedOverride);
      console.log('Subdomain tenant ID:', subdomainTenantId);
      console.log('Final tenant ID to load:', tenantIdToLoad);
      
      // ========================================
      // Step 5: Load tenant branding (public, no auth needed)
      // ========================================
      if (tenantIdToLoad) {
        await loadTenantBranding(tenantIdToLoad);
      }
      
      // ========================================
      // Step 6: Handle user session
      // ========================================
      if (storedUser) {
        setUser(storedUser);
        loadData();
      }
      
      setLoading(false);
    };
    
    init();
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

  const handleLogin = async (user) => {
    setUser(user);
    
    // Load tenant branding if not already loaded
    if (!tenant) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTenantId = urlParams.get('tenant');
      const tenantIdToLoad = urlTenantId || localStorage.getItem('tenant_id_override') || user.tenant_id;
      
      if (tenantIdToLoad) {
        await loadTenantBranding(tenantIdToLoad);
      }
    }
    
    loadData();
  };

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem('tenant_id_override');
    setUser(null);
    setTenant(null);
    setAccounts([]);
    setItems([]);
    setTransactions([]);
    setDeliveryZones([]);
    setChartOfAccounts([]);
    
    // Reset brand color to default
    applyBrandColor('#7A8B6E');
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
    
    // System Section
    {
      id: 'system',
      label: 'System',
      icon: Icons.Settings,
      isSection: true,
      children: [
        { id: 'dataImport', label: 'Data Import', icon: Icons.Upload },
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
      case 'dataImport':
        return <DataImportView />;
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
          <h1>🌱 {tenant?.name || 'Business Manager'}</h1>
          <p>Back Office</p>
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
