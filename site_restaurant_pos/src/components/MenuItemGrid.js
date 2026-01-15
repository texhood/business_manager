import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'price-asc', label: 'Price Low-High' },
  { value: 'price-desc', label: 'Price High-Low' },
];

function MenuItemGrid({ menu }) {
  const { addItem } = useCart();
  const [sortBy, setSortBy] = useState('default');
  const [expandedItem, setExpandedItem] = useState(null);

  if (!menu) {
    return (
      <div className="loading" style={{ flex: 1 }}>
        <div className="spinner"></div>
        <span>Loading menu...</span>
      </div>
    );
  }

  const sections = menu.sections || [];

  const handleItemClick = (item) => {
    if (item.is_available === false) return;

    addItem({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      description: item.description
    });
  };

  const toggleDescription = (e, itemId) => {
    e.stopPropagation();
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Sort items within each section
  const sortItems = (items) => {
    if (sortBy === 'default') return items;

    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-desc':
          return parseFloat(b.price) - parseFloat(a.price);
        default:
          return 0;
      }
    });
  };

  // Filter out empty sections
  const sectionsWithItems = sections.filter(section => section.items && section.items.length > 0);

  if (sectionsWithItems.length === 0) {
    return (
      <div className="menu-empty">
        <div className="menu-empty-icon">🍽️</div>
        <p>No items available in this menu</p>
      </div>
    );
  }

  return (
    <div className="menu-items-container">
      {/* Sort Controls */}
      <div className="menu-controls">
        <div className="menu-sort">
          <label>Sort:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {sectionsWithItems.map(section => (
        <div key={section.id} className="menu-section">
          <div className="menu-section-header">
            <h3>{section.name}</h3>
            {section.description && <p>{section.description}</p>}
          </div>
          
          <div className="menu-items-grid">
            {sortItems(section.items).map(item => (
              <div
                key={item.id}
                className={`menu-item-card compact ${item.is_available === false ? 'unavailable' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                {/* Compact view - name, price, badges */}
                <div className="menu-item-top">
                  <div className="menu-item-name">{item.name}</div>
                  {item.description && (
                    <button 
                      className="menu-item-info-btn"
                      onClick={(e) => toggleDescription(e, item.id)}
                      title="Show description"
                    >
                      ⓘ
                    </button>
                  )}
                </div>

                {/* Expanded description */}
                {expandedItem === item.id && item.description && (
                  <div className="menu-item-description-expanded">
                    {item.description}
                  </div>
                )}

                <div className="menu-item-footer">
                  <div className="menu-item-price">
                    {item.price_label || formatPrice(item.price)}
                  </div>
                  <div className="menu-item-badges">
                    {item.is_vegetarian && (
                      <span className="dietary-badge vegetarian" title="Vegetarian">V</span>
                    )}
                    {item.is_vegan && (
                      <span className="dietary-badge vegan" title="Vegan">VG</span>
                    )}
                    {item.is_gluten_free && (
                      <span className="dietary-badge gluten-free" title="Gluten Free">GF</span>
                    )}
                    {item.is_spicy && (
                      <span className="dietary-badge spicy" title="Spicy">🌶</span>
                    )}
                  </div>
                </div>
                
                {item.is_available === false && (
                  <div className="menu-item-unavailable-overlay">
                    86'd
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MenuItemGrid;
