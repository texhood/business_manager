import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './LayoutEditor.css';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

function LayoutEditor({ layout, onSave, onCancel }) {
  const { token } = useAuth();
  
  // Layout metadata
  const [layoutName, setLayoutName] = useState(layout?.name || '');
  const [layoutDescription, setLayoutDescription] = useState(layout?.description || '');
  
  // Items in the layout (ordered)
  const [layoutItems, setLayoutItems] = useState([]);
  
  // All available items (not in layout)
  const [availableItems, setAvailableItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Drag state
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Fetch layout details if editing existing
  useEffect(() => {
    if (layout?.id) {
      fetchLayoutDetails();
    } else {
      setLayoutItems([]);
      fetchAvailableItems();
    }
    fetchCategories();
  }, [layout?.id]);

  const fetchLayoutDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/pos-layouts/${layout.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLayoutName(data.data.name);
        setLayoutDescription(data.data.description || '');
        setLayoutItems(data.data.items.map(item => ({
          item_id: item.item_id,
          name: item.name,
          display_name: item.override_name || item.name,
          display_color: item.display_color,
          price: item.price,
          image_url: item.image_url,
          category_name: item.category_name,
          display_order: item.display_order
        })));
        await fetchAvailableItems(data.data.items.map(i => i.item_id));
      }
    } catch (err) {
      setError('Failed to load layout');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableItems = async (excludeIds = []) => {
    try {
      // If editing, use the available-items endpoint
      if (layout?.id) {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (selectedCategory) params.append('category_id', selectedCategory);
        
        const response = await fetch(`${API_URL}/pos-layouts/${layout.id}/available-items?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAvailableItems(data.data);
        }
      } else {
        // New layout - fetch all active items
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (selectedCategory) params.append('category_id', selectedCategory);
        
        const response = await fetch(`${API_URL}/terminal/products?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Exclude items already in layout
          const layoutItemIds = new Set(layoutItems.map(i => i.item_id));
          setAvailableItems(data.data.filter(item => !layoutItemIds.has(item.id)));
        }
      }
    } catch (err) {
      console.error('Failed to fetch available items:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/terminal/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Refetch available items when search/category changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAvailableItems();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, layoutItems.length]);

  // Add item to layout
  const addItemToLayout = (item) => {
    const newItem = {
      item_id: item.id,
      name: item.name,
      display_name: item.display_name || item.name,
      display_color: item.display_color || null,
      price: item.price,
      image_url: item.image_url,
      category_name: item.category_name,
      display_order: layoutItems.length
    };
    
    setLayoutItems([...layoutItems, newItem]);
    setAvailableItems(availableItems.filter(i => i.id !== item.id));
  };

  // Remove item from layout
  const removeItemFromLayout = (itemId) => {
    const removedItem = layoutItems.find(i => i.item_id === itemId);
    setLayoutItems(layoutItems.filter(i => i.item_id !== itemId));
    
    // Add back to available items
    if (removedItem) {
      setAvailableItems([...availableItems, {
        id: removedItem.item_id,
        name: removedItem.name,
        price: removedItem.price,
        image_url: removedItem.image_url,
        category_name: removedItem.category_name
      }].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  // Drag and drop handlers for reordering
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...layoutItems];
    const [removed] = newItems.splice(draggedItem, 1);
    newItems.splice(dropIndex, 0, removed);
    
    // Update display_order
    newItems.forEach((item, idx) => {
      item.display_order = idx;
    });
    
    setLayoutItems(newItems);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  // Save layout
  const handleSave = async () => {
    if (!layoutName.trim()) {
      setError('Layout name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let layoutId = layout?.id;

      // Create or update layout metadata
      if (layoutId) {
        // Update existing
        const response = await fetch(`${API_URL}/pos-layouts/${layoutId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: layoutName.trim(),
            description: layoutDescription.trim() || null
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update layout');
        }
      } else {
        // Create new
        const response = await fetch(`${API_URL}/pos-layouts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: layoutName.trim(),
            description: layoutDescription.trim() || null
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create layout');
        }

        const data = await response.json();
        layoutId = data.data.id;
      }

      // Update layout items
      const itemsResponse = await fetch(`${API_URL}/pos-layouts/${layoutId}/items`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: layoutItems.map((item, index) => ({
            item_id: item.item_id,
            display_order: index,
            display_name: item.display_name !== item.name ? item.display_name : null,
            display_color: item.display_color
          }))
        })
      });

      if (!itemsResponse.ok) {
        const data = await itemsResponse.json();
        throw new Error(data.error || 'Failed to save layout items');
      }

      onSave(layoutId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && layout?.id) {
    return (
      <div className="layout-editor">
        <div className="layout-editor-loading">
          <div className="spinner"></div>
          <p>Loading layout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-editor">
      {/* Header */}
      <header className="layout-editor-header">
        <button className="btn-back" onClick={onCancel}>
          ← Back to POS
        </button>
        
        <div className="layout-editor-title">
          <input
            type="text"
            className="layout-name-input"
            placeholder="Layout Name"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
          />
        </div>
        
        <div className="layout-editor-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={saving || !layoutName.trim()}
          >
            {saving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </header>

      {error && (
        <div className="layout-editor-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Main content */}
      <div className="layout-editor-content">
        {/* Available Items Panel */}
        <div className="available-items-panel">
          <div className="panel-header">
            <h3>Available Items</h3>
            <span className="item-count">{availableItems.length} items</span>
          </div>
          
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="category-filter">
            <button
              className={`filter-btn ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
          
          <div className="available-items-list">
            {availableItems.map(item => (
              <div key={item.id} className="available-item">
                <div className="available-item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-meta">
                    ${parseFloat(item.price).toFixed(2)}
                    {item.category_name && ` • ${item.category_name}`}
                  </span>
                </div>
                <button
                  className="btn-add-item"
                  onClick={() => addItemToLayout(item)}
                  title="Add to layout"
                >
                  +
                </button>
              </div>
            ))}
            
            {availableItems.length === 0 && (
              <div className="no-items">
                {searchQuery || selectedCategory 
                  ? 'No matching items found'
                  : 'All items are in the layout'}
              </div>
            )}
          </div>
        </div>

        {/* Layout Grid Panel */}
        <div className="layout-grid-panel">
          <div className="panel-header">
            <h3>Layout Grid</h3>
            <span className="item-count">{layoutItems.length} items</span>
          </div>
          
          <div className="layout-description">
            <input
              type="text"
              placeholder="Description (optional)"
              value={layoutDescription}
              onChange={(e) => setLayoutDescription(e.target.value)}
              className="description-input"
            />
          </div>
          
          <div className="layout-grid">
            {layoutItems.length === 0 ? (
              <div className="layout-empty">
                <div className="empty-icon">📦</div>
                <p>No items in layout</p>
                <p className="empty-hint">Add items from the left panel</p>
              </div>
            ) : (
              <div className="layout-items-grid">
                {layoutItems.map((item, index) => (
                  <div
                    key={item.item_id}
                    className={`layout-item ${draggedItem === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    style={item.display_color ? { borderColor: item.display_color, borderWidth: '3px' } : {}}
                  >
                    <button
                      className="btn-remove-item"
                      onClick={() => removeItemFromLayout(item.item_id)}
                      title="Remove from layout"
                    >
                      ×
                    </button>
                    <div className="layout-item-order">{index + 1}</div>
                    <div className="layout-item-name">{item.display_name || item.name}</div>
                    <div className="layout-item-price">${parseFloat(item.price).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="layout-help">
            <span>💡 Drag items to reorder • Click × to remove</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LayoutEditor;
