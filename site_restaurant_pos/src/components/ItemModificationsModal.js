import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

function ItemModificationsModal({ item, itemIndex, onSave, onClose }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [availableMods, setAvailableMods] = useState({ groups: [], modifications: [] });
  const [selectedMods, setSelectedMods] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState(item.special_instructions || '');
  const [customMod, setCustomMod] = useState('');

  // Initialize selected mods from item
  useEffect(() => {
    if (item.modifications) {
      setSelectedMods(item.modifications.map(mod => {
        // Handle both string mods (legacy) and object mods (new)
        if (typeof mod === 'string') {
          return { id: null, name: mod, display_name: mod, price: 0, is_custom: true };
        }
        return mod;
      }));
    }
  }, [item.modifications]);

  // Fetch available modifications for this item
  useEffect(() => {
    const fetchMods = async () => {
      try {
        const response = await fetch(`${API_URL}/modifications/menu-item/${item.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAvailableMods(data.data);
        }
      } catch (error) {
        console.error('Error fetching modifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (item.id) {
      fetchMods();
    } else {
      setLoading(false);
    }
  }, [item.id, token]);

  const isModSelected = (mod) => {
    return selectedMods.some(m => 
      (m.id && m.id === mod.id) || 
      (m.display_name === mod.display_name)
    );
  };

  const toggleMod = (mod) => {
    setSelectedMods(current => {
      const exists = current.find(m => 
        (m.id && m.id === mod.id) || 
        (m.display_name === mod.display_name)
      );
      
      if (exists) {
        return current.filter(m => 
          !((m.id && m.id === mod.id) || (m.display_name === mod.display_name))
        );
      }
      
      return [...current, {
        id: mod.id,
        name: mod.name,
        display_name: mod.display_name,
        price: mod.price || 0,
        is_custom: false
      }];
    });
  };

  const selectGroupOption = (group, mod) => {
    setSelectedMods(current => {
      // Remove any existing selection from this group
      const filtered = current.filter(m => {
        const inGroup = group.options.some(opt => 
          (opt.id && opt.id === m.id) || opt.display_name === m.display_name
        );
        return !inGroup;
      });
      
      // Add the new selection
      return [...filtered, {
        id: mod.id,
        name: mod.name,
        display_name: mod.display_name,
        price: mod.price || 0,
        group_name: group.name,
        is_custom: false
      }];
    });
  };

  const getGroupSelection = (group) => {
    return selectedMods.find(m => {
      return group.options.some(opt => 
        (opt.id && opt.id === m.id) || opt.display_name === m.display_name
      );
    });
  };

  const addCustomMod = () => {
    if (customMod.trim()) {
      const exists = selectedMods.find(m => 
        m.display_name.toLowerCase() === customMod.trim().toLowerCase()
      );
      
      if (!exists) {
        setSelectedMods(current => [...current, {
          id: null,
          name: customMod.trim(),
          display_name: customMod.trim(),
          price: 0,
          is_custom: true
        }]);
      }
      setCustomMod('');
    }
  };

  const removeMod = (mod) => {
    setSelectedMods(current => current.filter(m => 
      !((m.id && m.id === mod.id) || (m.display_name === mod.display_name))
    ));
  };

  const handleSave = () => {
    onSave(itemIndex, selectedMods, specialInstructions);
    onClose();
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return '';
    const sign = price > 0 ? '+' : '';
    return `${sign}${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)}`;
  };

  const totalModPrice = selectedMods.reduce((sum, m) => sum + (m.price || 0), 0);
  const itemTotal = (parseFloat(item.price) + totalModPrice) * item.quantity;

  // Group modifications by category for display
  const groupByCategory = (mods) => {
    const groups = {};
    mods.forEach(mod => {
      const cat = mod.category || 'general';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(mod);
    });
    return groups;
  };

  const categoryLabels = {
    removal: 'Remove',
    addition: 'Add',
    preparation: 'Preparation',
    temperature: 'Temperature',
    size: 'Size',
    allergy: 'Allergy/Dietary',
    general: 'Other'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modify Item</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Item Info */}
          <div className="mod-item-info">
            <div className="mod-item-name">{item.name}</div>
            <div className="mod-item-details">
              <span>Qty: {item.quantity}</span>
              <span>Base: {formatPrice(item.price).replace('+', '')}</span>
              {totalModPrice !== 0 && (
                <span className="mod-price-adjustment">
                  Mods: {formatPrice(totalModPrice)}
                </span>
              )}
              <span className="mod-item-total">
                Total: {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(itemTotal)}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="mod-loading">Loading modifications...</div>
          ) : (
            <>
              {/* Current Modifications */}
              {selectedMods.length > 0 && (
                <div className="mod-current">
                  <label>Current Modifications:</label>
                  <div className="mod-tags">
                    {selectedMods.map((mod, i) => (
                      <span key={i} className={`mod-tag ${mod.is_custom ? 'custom' : ''}`}>
                        {mod.display_name}
                        {mod.price !== 0 && (
                          <span className="mod-tag-price">{formatPrice(mod.price)}</span>
                        )}
                        <button onClick={() => removeMod(mod)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Groups (e.g., temperature, size) */}
              {availableMods.groups.length > 0 && (
                <div className="mod-groups">
                  {availableMods.groups.map((group, gi) => (
                    <div key={gi} className="mod-group">
                      <label>
                        {group.name}
                        {group.is_required && <span className="required-badge">Required</span>}
                      </label>
                      <div className="mod-group-options">
                        {group.options.map((opt, oi) => {
                          const selected = getGroupSelection(group);
                          const isSelected = selected && 
                            ((selected.id && selected.id === opt.id) || 
                             selected.display_name === opt.display_name);
                          
                          return (
                            <button
                              key={oi}
                              className={`mod-group-btn ${isSelected ? 'active' : ''}`}
                              onClick={() => selectGroupOption(group, opt)}
                            >
                              {opt.display_name}
                              {opt.price !== 0 && (
                                <span className="mod-btn-price">{formatPrice(opt.price)}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Modifications by Category */}
              {availableMods.modifications.length > 0 && (
                <div className="mod-section">
                  <label>Available Modifications:</label>
                  {Object.entries(groupByCategory(availableMods.modifications)).map(([cat, mods]) => (
                    <div key={cat} className="mod-category">
                      <div className="mod-category-label">{categoryLabels[cat] || cat}</div>
                      <div className="mod-quick-grid">
                        {mods.map((mod, i) => (
                          <button
                            key={i}
                            className={`mod-quick-btn ${isModSelected(mod) ? 'active' : ''}`}
                            onClick={() => toggleMod(mod)}
                          >
                            {mod.display_name}
                            {mod.price !== 0 && (
                              <span className="mod-btn-price">{formatPrice(mod.price)}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No modifications available message */}
              {availableMods.groups.length === 0 && availableMods.modifications.length === 0 && (
                <div className="mod-empty">
                  <p>No preset modifications for this item.</p>
                  <p>Use custom modification below or add special instructions.</p>
                </div>
              )}

              {/* Custom Modification */}
              <div className="mod-section">
                <label>Custom Modification:</label>
                <div className="mod-custom-input">
                  <input
                    type="text"
                    placeholder="Type custom modification..."
                    value={customMod}
                    onChange={(e) => setCustomMod(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomMod();
                      }
                    }}
                  />
                  <button onClick={addCustomMod} disabled={!customMod.trim()}>
                    Add
                  </button>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="mod-section">
                <label>Special Instructions:</label>
                <textarea
                  placeholder="Any special instructions for this item..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Modifications
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItemModificationsModal;
