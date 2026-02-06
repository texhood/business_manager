import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import './LayoutSettingsModal.css';

function LayoutSettingsModal({ currentLayoutId, onSelectLayout, onEditLayout, onCreateLayout, onClose }) {
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchLayouts();
  }, []);

  const fetchLayouts = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/pos-layouts');

      if (response.ok) {
        const data = await response.json();
        setLayouts(data.data);
      } else {
        // If 404 or error, layouts feature may not be available
        setLayouts([]);
      }
    } catch (err) {
      console.error('Failed to fetch layouts:', err);
      setLayouts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (layoutId) => {
    try {
      const response = await apiFetch(`/pos-layouts/${layoutId}`, {
        method: 'PUT',
        body: JSON.stringify({ is_default: true })
      });

      if (response.ok) {
        fetchLayouts();
      }
    } catch (err) {
      console.error('Failed to set default:', err);
    }
  };

  const handleDelete = async (layoutId) => {
    if (!window.confirm('Are you sure you want to delete this layout?')) {
      return;
    }

    try {
      setDeletingId(layoutId);
      const response = await apiFetch(`/pos-layouts/${layoutId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // If deleted layout was selected, clear selection
        if (currentLayoutId === layoutId) {
          onSelectLayout(null);
        }
        fetchLayouts();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete layout');
      }
    } catch (err) {
      setError('Failed to delete layout');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (layout) => {
    const newName = window.prompt('Enter name for the new layout:', `${layout.name} (Copy)`);
    if (!newName) return;

    try {
      const response = await apiFetch(`/pos-layouts/${layout.id}/duplicate`, {
        method: 'POST',
        body: JSON.stringify({ name: newName })
      });

      if (response.ok) {
        fetchLayouts();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to duplicate layout');
      }
    } catch (err) {
      setError('Failed to duplicate layout');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="layout-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Layout Settings</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError(null)} style={{ marginLeft: '10px' }}>×</button>
            </div>
          )}

          <div className="layout-actions-top">
            <button className="btn btn-primary" onClick={onCreateLayout}>
              + Create New Layout
            </button>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading layouts...</p>
            </div>
          ) : layouts.length === 0 ? (
            <div className="no-layouts">
              <div className="no-layouts-icon">📋</div>
              <p>No layouts yet</p>
              <p className="hint">Create a layout to customize which items appear on the POS</p>
            </div>
          ) : (
            <div className="layouts-list">
              {layouts.map(layout => (
                <div 
                  key={layout.id} 
                  className={`layout-item ${currentLayoutId === layout.id ? 'selected' : ''}`}
                >
                  <div className="layout-info" onClick={() => onSelectLayout(layout.id)}>
                    <div className="layout-name">
                      {layout.name}
                      {layout.is_default && <span className="default-badge">Default</span>}
                    </div>
                    <div className="layout-meta">
                      {layout.item_count} items
                      {layout.description && ` • ${layout.description}`}
                    </div>
                  </div>
                  
                  <div className="layout-actions">
                    {currentLayoutId === layout.id && (
                      <span className="selected-indicator">✓ Active</span>
                    )}
                    
                    <button
                      className="btn-icon"
                      onClick={() => onEditLayout(layout)}
                      title="Edit layout"
                    >
                      ✏️
                    </button>
                    
                    <button
                      className="btn-icon"
                      onClick={() => handleDuplicate(layout)}
                      title="Duplicate layout"
                    >
                      📋
                    </button>
                    
                    {!layout.is_default && (
                      <button
                        className="btn-icon"
                        onClick={() => handleSetDefault(layout.id)}
                        title="Set as default"
                      >
                        ⭐
                      </button>
                    )}
                    
                    {!layout.is_default && (
                      <button
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleDelete(layout.id)}
                        disabled={deletingId === layout.id}
                        title="Delete layout"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="layout-settings-help">
            <p><strong>Tip:</strong> Click on a layout to use it. The default layout is used when you first log in.</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LayoutSettingsModal;
