import React, { useState, useEffect, useCallback } from 'react';
import './ModificationsManager.css';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

const CATEGORIES = [
  { value: 'removal', label: 'Removals' },
  { value: 'addition', label: 'Additions' },
  { value: 'preparation', label: 'Preparation' },
  { value: 'temperature', label: 'Temperature' },
  { value: 'size', label: 'Size' },
  { value: 'allergy', label: 'Allergy/Dietary' },
  { value: 'general', label: 'General' },
];

function ModificationsManager({ token }) {
  const [modifications, setModifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('modifications');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingMod, setEditingMod] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    price_adjustment: '',
    category: 'general',
    sort_order: 0
  });

  // Menu items for assignment
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemMods, setItemMods] = useState({ groups: [], modifications: [] });

  const fetchModifications = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/modifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setModifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching modifications:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchMenuItems = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/items?type=menu_item&status=active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  }, [token]);

  const fetchItemMods = useCallback(async (itemId) => {
    try {
      const response = await fetch(`${API_URL}/modifications/menu-item/${itemId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setItemMods(data.data);
      }
    } catch (error) {
      console.error('Error fetching item modifications:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchModifications();
    fetchMenuItems();
  }, [fetchModifications, fetchMenuItems]);

  useEffect(() => {
    if (selectedItem) {
      fetchItemMods(selectedItem.id);
    }
  }, [selectedItem, fetchItemMods]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const method = editingMod ? 'PUT' : 'POST';
    const url = editingMod 
      ? `${API_URL}/modifications/${editingMod.id}`
      : `${API_URL}/modifications`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price_adjustment: parseFloat(formData.price_adjustment) || 0
        })
      });

      if (response.ok) {
        fetchModifications();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save modification');
      }
    } catch (error) {
      console.error('Error saving modification:', error);
      alert('Failed to save modification');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this modification?')) return;

    try {
      const response = await fetch(`${API_URL}/modifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchModifications();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete modification');
      }
    } catch (error) {
      console.error('Error deleting modification:', error);
    }
  };

  const handleEdit = (mod) => {
    setEditingMod(mod);
    setFormData({
      name: mod.name,
      display_name: mod.display_name || '',
      price_adjustment: mod.price_adjustment?.toString() || '0',
      category: mod.category,
      sort_order: mod.sort_order || 0
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMod(null);
    setFormData({
      name: '',
      display_name: '',
      price_adjustment: '',
      category: 'general',
      sort_order: 0
    });
  };

  const toggleItemMod = async (mod) => {
    if (!selectedItem) return;

    const isAssigned = itemMods.modifications.some(m => m.id === mod.id) ||
      itemMods.groups.some(g => g.options.some(o => o.id === mod.id));

    try {
      if (isAssigned) {
        // Remove
        await fetch(`${API_URL}/modifications/menu-item/${selectedItem.id}/${mod.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // Add
        await fetch(`${API_URL}/modifications/menu-item/${selectedItem.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ modification_id: mod.id })
        });
      }
      fetchItemMods(selectedItem.id);
    } catch (error) {
      console.error('Error toggling modification:', error);
    }
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return '-';
    const sign = price > 0 ? '+' : '';
    return `${sign}$${parseFloat(price).toFixed(2)}`;
  };

  const filteredMods = filterCategory
    ? modifications.filter(m => m.category === filterCategory)
    : modifications;

  const groupedMods = filteredMods.reduce((acc, mod) => {
    const cat = mod.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(mod);
    return acc;
  }, {});

  if (loading) {
    return <div className="mods-loading">Loading...</div>;
  }

  return (
    <div className="mods-manager">
      <div className="mods-header">
        <h2>Modifications Manager</h2>
        <div className="mods-tabs">
          <button
            className={`mods-tab ${activeTab === 'modifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('modifications')}
          >
            All Modifications
          </button>
          <button
            className={`mods-tab ${activeTab === 'assign' ? 'active' : ''}`}
            onClick={() => setActiveTab('assign')}
          >
            Assign to Items
          </button>
        </div>
      </div>

      {activeTab === 'modifications' && (
        <div className="mods-list-view">
          <div className="mods-toolbar">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <button className="btn-add-mod" onClick={() => setShowForm(true)}>
              + Add Modification
            </button>
          </div>

          {showForm && (
            <div className="mods-form-container">
              <form onSubmit={handleSubmit} className="mods-form">
                <h3>{editingMod ? 'Edit Modification' : 'New Modification'}</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Internal Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="no_onions"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Display Name</label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="No Onions"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price Adjustment</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price_adjustment}
                      onChange={(e) => setFormData({ ...formData, price_adjustment: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Sort Order</label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-save">
                    {editingMod ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mods-list">
            {Object.entries(groupedMods).map(([category, mods]) => (
              <div key={category} className="mods-category">
                <h4>{CATEGORIES.find(c => c.value === category)?.label || category}</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Display Name</th>
                      <th>Internal Name</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mods.map(mod => (
                      <tr key={mod.id} className={!mod.is_active ? 'inactive' : ''}>
                        <td>{mod.display_name}</td>
                        <td className="internal-name">{mod.name}</td>
                        <td className={mod.price_adjustment > 0 ? 'price-positive' : mod.price_adjustment < 0 ? 'price-negative' : ''}>
                          {formatPrice(mod.price_adjustment)}
                        </td>
                        <td>
                          <span className={`status-badge ${mod.is_active ? 'active' : 'inactive'}`}>
                            {mod.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button className="btn-edit" onClick={() => handleEdit(mod)}>Edit</button>
                          <button className="btn-delete" onClick={() => handleDelete(mod.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'assign' && (
        <div className="mods-assign-view">
          <div className="assign-layout">
            <div className="item-selector">
              <h3>Select Menu Item</h3>
              <div className="item-list">
                {menuItems.map(item => (
                  <div
                    key={item.id}
                    className={`item-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">${parseFloat(item.price).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mod-selector">
              {selectedItem ? (
                <>
                  <h3>Modifications for: {selectedItem.name}</h3>
                  <p className="assign-hint">Click to toggle assignment</p>
                  
                  <div className="assigned-mods">
                    <h4>Currently Assigned ({itemMods.modifications.length + itemMods.groups.reduce((sum, g) => sum + g.options.length, 0)})</h4>
                    {itemMods.modifications.length === 0 && itemMods.groups.length === 0 ? (
                      <p className="no-mods">No modifications assigned</p>
                    ) : (
                      <div className="assigned-tags">
                        {itemMods.modifications.map(mod => (
                          <span key={mod.id} className="assigned-tag" onClick={() => toggleItemMod(mod)}>
                            {mod.display_name}
                            {mod.price !== 0 && ` (${formatPrice(mod.price)})`}
                            <span className="remove">×</span>
                          </span>
                        ))}
                        {itemMods.groups.flatMap(g => g.options).map(mod => (
                          <span key={mod.id} className="assigned-tag grouped" onClick={() => toggleItemMod(mod)}>
                            {mod.display_name} [{mod.group_name}]
                            <span className="remove">×</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="available-mods">
                    <h4>Available Modifications</h4>
                    {CATEGORIES.map(cat => {
                      const catMods = modifications.filter(m => m.category === cat.value && m.is_active);
                      if (catMods.length === 0) return null;
                      
                      return (
                        <div key={cat.value} className="mod-category-section">
                          <div className="mod-category-label">{cat.label}</div>
                          <div className="mod-buttons">
                            {catMods.map(mod => {
                              const isAssigned = itemMods.modifications.some(m => m.id === mod.id) ||
                                itemMods.groups.some(g => g.options.some(o => o.id === mod.id));
                              
                              return (
                                <button
                                  key={mod.id}
                                  className={`mod-assign-btn ${isAssigned ? 'assigned' : ''}`}
                                  onClick={() => toggleItemMod(mod)}
                                >
                                  {mod.display_name}
                                  {mod.price_adjustment !== 0 && (
                                    <span className="mod-price">{formatPrice(mod.price_adjustment)}</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="no-selection">
                  <p>Select a menu item to manage its modifications</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModificationsManager;
