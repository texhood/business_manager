/**
 * MenusView Component
 * CRUD for food trailer menus
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../common/Icons';
import Modal from '../common/Modal';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

const MENU_STATUSES = [
  { value: 'draft', label: 'Draft', color: '#6b7280' },
  { value: 'active', label: 'Active', color: '#10b981' },
  { value: 'archived', label: 'Archived', color: '#ef4444' },
];

const SEASONS = [
  { value: '', label: 'All Seasons' },
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' },
  { value: 'all', label: 'Year-Round' },
];

const MenusView = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Menu builder modal
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [builderMenu, setBuilderMenu] = useState(null);
  
  // Form state
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    season: '',
    menu_type: 'food_trailer',
    header_image: '',
    footer_text: '',
    status: 'draft',
    is_featured: false,
  });

  const loadMenus = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`${API_URL}/menus?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setMenus(data.data || []);
    } catch (err) {
      console.error('Failed to load menus:', err);
      setMessage({ type: 'error', text: 'Failed to load menus' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const resetForm = () => {
    setForm({
      name: '',
      slug: '',
      description: '',
      season: '',
      menu_type: 'food_trailer',
      header_image: '',
      footer_text: '',
      status: 'draft',
      is_featured: false,
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingMenu(null);
    setShowModal(true);
  };

  const openEditModal = (menu) => {
    setForm({
      name: menu.name || '',
      slug: menu.slug || '',
      description: menu.description || '',
      season: menu.season || '',
      menu_type: menu.menu_type || 'food_trailer',
      header_image: menu.header_image || '',
      footer_text: menu.footer_text || '',
      status: menu.status || 'draft',
      is_featured: menu.is_featured || false,
    });
    setEditingMenu(menu);
    setShowModal(true);
  };

  const openBuilder = (menu) => {
    setBuilderMenu(menu);
    setShowBuilderModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingMenu 
        ? `${API_URL}/menus/${editingMenu.id}`
        : `${API_URL}/menus`;
      
      const response = await fetch(url, {
        method: editingMenu ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save menu');
      }
      
      setMessage({ type: 'success', text: `Menu ${editingMenu ? 'updated' : 'created'} successfully` });
      setShowModal(false);
      loadMenus();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (menu) => {
    if (!window.confirm(`Duplicate "${menu.name}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/menus/${menu.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: `${menu.name} (Copy)` }),
      });
      
      if (!response.ok) throw new Error('Failed to duplicate menu');
      
      setMessage({ type: 'success', text: 'Menu duplicated successfully' });
      loadMenus();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (menu) => {
    if (!window.confirm(`Archive "${menu.name}"? This will hide it from the website.`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/menus/${menu.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to archive menu');
      
      setMessage({ type: 'success', text: 'Menu archived successfully' });
      loadMenus();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleSetFeatured = async (menu) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/menus/${menu.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_featured: true }),
      });
      
      if (!response.ok) throw new Error('Failed to set featured menu');
      
      setMessage({ type: 'success', text: `"${menu.name}" is now the featured menu` });
      loadMenus();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const getStatusBadge = (status) => {
    const statusInfo = MENU_STATUSES.find(s => s.value === status) || MENU_STATUSES[0];
    return (
      <span className="status-badge" style={{ backgroundColor: statusInfo.color }}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <h2>Menus</h2>
          <p>Create and manage food trailer menus</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Icons.Plus /> New Menu
        </button>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.type === 'success' ? <Icons.CheckCircle /> : <Icons.AlertCircle />}
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          {MENU_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Menus List */}
      {loading ? (
        <div className="loading-state">
          <Icons.Loader />
          <p>Loading menus...</p>
        </div>
      ) : menus.length === 0 ? (
        <div className="empty-state">
          <Icons.Menu />
          <h3>No menus yet</h3>
          <p>Create your first menu to get started</p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Icons.Plus /> Create Menu
          </button>
        </div>
      ) : (
        <div className="menus-grid">
          {menus.map(menu => (
            <div key={menu.id} className={`menu-card ${menu.is_featured ? 'featured' : ''}`}>
              {menu.is_featured && (
                <div className="featured-badge">
                  <Icons.Star /> Featured
                </div>
              )}
              <div className="menu-card-header">
                <h3>{menu.name}</h3>
                {getStatusBadge(menu.status)}
              </div>
              <p className="menu-description">{menu.description || 'No description'}</p>
              <div className="menu-meta">
                {menu.season && <span className="meta-tag">{menu.season}</span>}
                <span className="meta-info">{menu.section_count || 0} sections</span>
              </div>
              <div className="menu-actions">
                <button className="btn btn-sm btn-secondary" onClick={() => openBuilder(menu)} title="Edit Sections & Items">
                  <Icons.Edit /> Build
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(menu)} title="Edit Details">
                  <Icons.FileText /> Details
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => handleDuplicate(menu)} title="Duplicate">
                  <Icons.Copy />
                </button>
                {!menu.is_featured && menu.status === 'active' && (
                  <button className="btn btn-sm btn-secondary" onClick={() => handleSetFeatured(menu)} title="Set as Featured">
                    <Icons.Star />
                  </button>
                )}
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(menu)} title="Archive">
                  <Icons.Trash />
                </button>
              </div>
              <div className="menu-preview-link">
                <a href={`http://localhost:3002/menu/${menu.slug}`} target="_blank" rel="noopener noreferrer">
                  <Icons.Eye /> Preview
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingMenu ? 'Edit Menu' : 'Create Menu'}>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Summer 2026 Menu"
                required
              />
            </div>

            <div className="form-group">
              <label>URL Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="auto-generated if empty"
              />
              <small>Leave blank to auto-generate from name</small>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description shown at top of menu"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Season</label>
                <select
                  value={form.season}
                  onChange={(e) => setForm({ ...form, season: e.target.value })}
                >
                  {SEASONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {MENU_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Footer Text</label>
              <textarea
                value={form.footer_text}
                onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
                placeholder="e.g., All meats are pasture-raised. Prices subject to change."
                rows={2}
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                />
                Set as featured menu (shown by default on /menu page)
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : (editingMenu ? 'Update Menu' : 'Create Menu')}
              </button>
            </div>
          </form>
      </Modal>

      {/* Menu Builder Modal */}
      {showBuilderModal && builderMenu && (
        <MenuBuilderModal
          menu={builderMenu}
          onClose={() => setShowBuilderModal(false)}
          onSave={() => {
            setShowBuilderModal(false);
            loadMenus();
          }}
        />
      )}
    </div>
  );
};

// Menu Builder Modal Component
const MenuBuilderModal = ({ menu, onClose, onSave }) => {
  const [sections, setSections] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Section edit state
  const [editingSection, setEditingSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({ name: '', description: '' });
  
  // Add item state
  const [addingToSection, setAddingToSection] = useState(null);

  useEffect(() => {
    loadMenuData();
  }, [menu.id]);

  const loadMenuData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Load full menu with sections
      const menuRes = await fetch(`${API_URL}/menus/${menu.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const menuData = await menuRes.json();
      setSections(menuData.data.sections || []);
      
      // Load all menu items
      const itemsRes = await fetch(`${API_URL}/menus/items/all`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const itemsData = await itemsRes.json();
      setAllItems(itemsData.data || []);
    } catch (err) {
      console.error('Failed to load menu data:', err);
      setMessage({ type: 'error', text: 'Failed to load menu data' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/menus/${menu.id}/sections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'New Section', description: '' }),
      });
      
      if (!response.ok) throw new Error('Failed to add section');
      
      loadMenuData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleUpdateSection = async (sectionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/menus/${menu.id}/sections/${sectionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionForm),
      });
      
      if (!response.ok) throw new Error('Failed to update section');
      
      setEditingSection(null);
      loadMenuData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Delete this section and all its items?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/menus/${menu.id}/sections/${sectionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to delete section');
      
      loadMenuData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleAddItemToSection = async (sectionId, itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/menus/${menu.id}/sections/${sectionId}/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menu_item_id: itemId }),
      });
      
      if (!response.ok) throw new Error('Failed to add item');
      
      setAddingToSection(null);
      loadMenuData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleRemoveItemFromSection = async (sectionId, itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/menus/${menu.id}/sections/${sectionId}/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to remove item');
      
      loadMenuData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return `$${Number(price).toFixed(2)}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <h2>Build Menu: {menu.name}</h2>
          <button className="modal-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>
        
        <div className="modal-body">
          {message && (
            <div className={`message message-${message.type}`}>
              {message.text}
            </div>
          )}
          
          {loading ? (
            <div className="loading-state">
              <Icons.Loader />
              <p>Loading...</p>
            </div>
          ) : (
            <div className="menu-builder">
              <div className="builder-actions">
                <button className="btn btn-primary" onClick={handleAddSection}>
                  <Icons.Plus /> Add Section
                </button>
              </div>
              
              {sections.length === 0 ? (
                <div className="empty-state">
                  <p>No sections yet. Add a section to start building your menu.</p>
                </div>
              ) : (
                <div className="sections-list">
                  {sections.map((section, sectionIndex) => (
                    <div key={section.id} className="section-card">
                      <div className="section-header">
                        {editingSection === section.id ? (
                          <div className="section-edit-form">
                            <input
                              type="text"
                              value={sectionForm.name}
                              onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                              placeholder="Section name"
                            />
                            <input
                              type="text"
                              value={sectionForm.description}
                              onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                              placeholder="Description (optional)"
                            />
                            <button className="btn btn-sm btn-primary" onClick={() => handleUpdateSection(section.id)}>
                              Save
                            </button>
                            <button className="btn btn-sm btn-secondary" onClick={() => setEditingSection(null)}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="section-info">
                              <h4>{section.name}</h4>
                              {section.description && <p>{section.description}</p>}
                            </div>
                            <div className="section-actions">
                              <button 
                                className="btn btn-sm btn-secondary" 
                                onClick={() => {
                                  setEditingSection(section.id);
                                  setSectionForm({ name: section.name, description: section.description || '' });
                                }}
                              >
                                <Icons.Edit />
                              </button>
                              <button 
                                className="btn btn-sm btn-danger" 
                                onClick={() => handleDeleteSection(section.id)}
                              >
                                <Icons.Trash />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="section-items">
                        {section.items && section.items.length > 0 ? (
                          section.items.map(item => (
                            <div key={item.id} className="section-item">
                              <div className="item-info">
                                <span className="item-name">{item.name}</span>
                                <span className="item-price">{formatPrice(item.price)}</span>
                              </div>
                              <button 
                                className="btn btn-sm btn-icon"
                                onClick={() => handleRemoveItemFromSection(section.id, item.id)}
                              >
                                <Icons.X />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="no-items">No items in this section</p>
                        )}
                        
                        {addingToSection === section.id ? (
                          <div className="add-item-picker">
                            <select 
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAddItemToSection(section.id, e.target.value);
                                }
                              }}
                              defaultValue=""
                            >
                              <option value="">Select an item...</option>
                              {allItems
                                .filter(item => !section.items?.some(si => si.id === item.id))
                                .map(item => (
                                  <option key={item.id} value={item.id}>
                                    {item.name} - {formatPrice(item.price)}
                                  </option>
                                ))
                              }
                            </select>
                            <button className="btn btn-sm btn-secondary" onClick={() => setAddingToSection(null)}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="btn btn-sm btn-secondary add-item-btn"
                            onClick={() => setAddingToSection(section.id)}
                          >
                            <Icons.Plus /> Add Item
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default MenusView;
