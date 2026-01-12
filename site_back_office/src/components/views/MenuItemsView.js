/**
 * MenuItemsView Component
 * CRUD for reusable menu items
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../common/Icons';
import Modal from '../common/Modal';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

const MenuItemsView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    price_label: '',
    image_url: '',
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    is_dairy_free: false,
    is_spicy: false,
    allergens: [],
    is_featured: false,
    is_available: true,
  });

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await fetch(`${API_URL}/menus/items/all?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setItems(data.data || []);
    } catch (err) {
      console.error('Failed to load menu items:', err);
      setMessage({ type: 'error', text: 'Failed to load menu items' });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      price_label: '',
      image_url: '',
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      is_dairy_free: false,
      is_spicy: false,
      allergens: [],
      is_featured: false,
      is_available: true,
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingItem(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setForm({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      price_label: item.price_label || '',
      image_url: item.image_url || '',
      is_vegetarian: item.is_vegetarian || false,
      is_vegan: item.is_vegan || false,
      is_gluten_free: item.is_gluten_free || false,
      is_dairy_free: item.is_dairy_free || false,
      is_spicy: item.is_spicy || false,
      allergens: item.allergens || [],
      is_featured: item.is_featured || false,
      is_available: item.is_available !== false,
    });
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingItem 
        ? `${API_URL}/menus/items/${editingItem.id}`
        : `${API_URL}/menus/items`;
      
      const payload = {
        ...form,
        price: form.price ? parseFloat(form.price) : null,
      };
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save item');
      }
      
      setMessage({ type: 'success', text: `Item ${editingItem ? 'updated' : 'created'} successfully` });
      setShowModal(false);
      loadItems();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This will remove it from all menus.`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/menus/items/${item.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to delete item');
      
      setMessage({ type: 'success', text: 'Item deleted successfully' });
      loadItems();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return `$${Number(price).toFixed(2)}`;
  };

  const getDietaryTags = (item) => {
    const tags = [];
    if (item.is_vegetarian) tags.push({ label: 'V', title: 'Vegetarian' });
    if (item.is_vegan) tags.push({ label: 'VG', title: 'Vegan' });
    if (item.is_gluten_free) tags.push({ label: 'GF', title: 'Gluten Free' });
    if (item.is_dairy_free) tags.push({ label: 'DF', title: 'Dairy Free' });
    if (item.is_spicy) tags.push({ label: '🌶️', title: 'Spicy' });
    return tags;
  };

  const filtered = items.filter(item => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return item.name?.toLowerCase().includes(searchLower) ||
           item.description?.toLowerCase().includes(searchLower);
  });

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <h2>Menu Items</h2>
          <p>Reusable items that can be added to multiple menus</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Icons.Plus /> New Item
        </button>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.type === 'success' ? <Icons.CheckCircle /> : <Icons.AlertCircle />}
          {message.text}
        </div>
      )}

      {/* Search */}
      <div className="filters-bar">
        <div className="search-input">
          <Icons.Search />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="loading-state">
          <Icons.Loader />
          <p>Loading items...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Icons.List />
          <h3>No menu items yet</h3>
          <p>Create items that can be reused across multiple menus</p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Icons.Plus /> Create Item
          </button>
        </div>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Dietary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className={!item.is_available ? 'row-inactive' : ''}>
                  <td>
                    <strong>{item.name}</strong>
                    {item.is_featured && <span className="featured-star" title="Featured">★</span>}
                  </td>
                  <td className="description-cell">{item.description || '-'}</td>
                  <td>{item.price_label || formatPrice(item.price)}</td>
                  <td>
                    <div className="dietary-tags">
                      {getDietaryTags(item).map((tag, idx) => (
                        <span key={idx} className="dietary-tag" title={tag.title}>{tag.label}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {item.is_available ? (
                      <span className="status-badge status-active">Available</span>
                    ) : (
                      <span className="status-badge status-inactive">Unavailable</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(item)}>
                        <Icons.Edit />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item)}>
                        <Icons.Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Menu Item' : 'Create Menu Item'}>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Smash Burger"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the item, ingredients, etc."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="12.00"
                />
              </div>

              <div className="form-group">
                <label>Price Label</label>
                <input
                  type="text"
                  value={form.price_label}
                  onChange={(e) => setForm({ ...form, price_label: e.target.value })}
                  placeholder="e.g., Market Price"
                />
                <small>Overrides numeric price display</small>
              </div>
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label>Dietary Options</label>
              <div className="checkbox-grid">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.is_vegetarian}
                    onChange={(e) => setForm({ ...form, is_vegetarian: e.target.checked })}
                  />
                  Vegetarian
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.is_vegan}
                    onChange={(e) => setForm({ ...form, is_vegan: e.target.checked })}
                  />
                  Vegan
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.is_gluten_free}
                    onChange={(e) => setForm({ ...form, is_gluten_free: e.target.checked })}
                  />
                  Gluten Free
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.is_dairy_free}
                    onChange={(e) => setForm({ ...form, is_dairy_free: e.target.checked })}
                  />
                  Dairy Free
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.is_spicy}
                    onChange={(e) => setForm({ ...form, is_spicy: e.target.checked })}
                  />
                  Spicy
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  />
                  Featured item
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={form.is_available}
                    onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                  />
                  Available
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : (editingItem ? 'Update Item' : 'Create Item')}
              </button>
            </div>
          </form>
      </Modal>
    </div>
  );
};

export default MenuItemsView;
