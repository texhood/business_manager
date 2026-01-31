/**
 * Site Builder View (Hybrid System)
 * Advanced page editor with templates, zones, and blocks
 * 
 * Location: site_back_office/src/components/views/SiteBuilderView.js
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../common/Icons';
import Modal from '../common/Modal';
import './SiteBuilderView.css';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

// ============================================================================
// INLINE STYLES FOR CRITICAL OVERLAY (fallback if CSS doesn't load)
// ============================================================================

const overlayStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: '#ffffff',
  zIndex: 99999,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
};

const builderStyles = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  overflow: 'hidden',
  backgroundColor: '#ffffff'
};

const builderHeaderStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  backgroundColor: '#f9fafb',
  borderBottom: '1px solid #e5e7eb',
  flexShrink: 0
};

const builderTabsStyles = {
  display: 'flex',
  gap: '4px',
  padding: '12px 24px',
  backgroundColor: '#f9fafb',
  borderBottom: '1px solid #e5e7eb',
  flexShrink: 0
};

const builderContentStyles = {
  flex: 1,
  overflowY: 'auto',
  padding: '24px',
  backgroundColor: '#ffffff'
};

// ============================================================================
// BLOCK TYPE ICONS MAP
// ============================================================================

const blockIcons = {
  hero: Icons.Image,
  text: Icons.FileText,
  image: Icons.Image,
  'feature-cards': Icons.Grid,
  gallery: Icons.Grid,
  testimonial: Icons.Star,
  'testimonials-carousel': Icons.Star,
  'product-grid': Icons.Package,
  'contact-info': Icons.Mail,
  cta: Icons.AlertCircle,
  spacer: Icons.Menu,
  video: Icons.Play,
  faq: Icons.FileText,
  form: Icons.Mail,
  'two-column': Icons.Layout,
  newsletter: Icons.Mail,
  html: Icons.FileText
};

const DefaultBlockIcon = Icons.Package;

// ============================================================================
// BLOCK TYPE PICKER
// ============================================================================

const BlockTypePicker = ({ blockTypes, allowedBlocks, onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'layout', 'content', 'media', 'commerce', 'forms'];

  const filteredBlocks = blockTypes.filter(block => {
    if (allowedBlocks && allowedBlocks.length > 0 && !allowedBlocks.includes(block.id)) {
      return false;
    }
    if (search && !block.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && block.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="block-type-picker">
      <div className="picker-header">
        <h3>Add Block</h3>
        <button className="btn-icon" onClick={onClose}>
          <Icons.X />
        </button>
      </div>
      
      <div className="picker-search">
        <Icons.Search />
        <input
          type="text"
          placeholder="Search blocks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="picker-categories">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="picker-blocks">
        {filteredBlocks.map(block => {
          const IconComponent = blockIcons[block.id] || DefaultBlockIcon;
          return (
            <button
              key={block.id}
              className="block-type-item"
              onClick={() => onSelect(block)}
            >
              <div className="block-type-icon">
                <IconComponent />
              </div>
              <div className="block-type-info">
                <span className="block-type-name">{block.name}</span>
                <span className="block-type-desc">{block.description}</span>
              </div>
            </button>
          );
        })}
        {filteredBlocks.length === 0 && (
          <div className="no-blocks">
            No blocks found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// BLOCK CONTENT EDITOR
// ============================================================================

const BlockContentEditor = ({ block, blockType, onSave, onClose }) => {
  const [content, setContent] = useState(block.content || {});
  const [settings, setSettings] = useState(block.settings || {});
  const [activeTab, setActiveTab] = useState('content');

  const schema = blockType?.content_schema?.properties || {};

  const handleSave = () => {
    onSave({ content, settings });
  };

  const updateContent = (key, value) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const renderField = (key, fieldSchema, value, onChange) => {
    const type = fieldSchema.type;
    const format = fieldSchema.format;

    if (type === 'object' && fieldSchema.properties) {
      return (
        <div className="nested-fields">
          {Object.entries(fieldSchema.properties).map(([childKey, childSchema]) => (
            <div key={childKey} className="form-group nested">
              <label>{childSchema.title || childKey}</label>
              {renderField(
                childKey,
                childSchema,
                value?.[childKey],
                (val) => onChange({ ...value, [childKey]: val })
              )}
            </div>
          ))}
        </div>
      );
    }

    if (type === 'array') {
      const items = value || [];
      const itemSchema = fieldSchema.items?.properties || {};
      
      return (
        <div className="array-editor">
          {items.map((item, idx) => (
            <div key={idx} className="array-item">
              <div className="array-item-header">
                <span>Item {idx + 1}</span>
                <button 
                  type="button"
                  className="btn-icon btn-danger"
                  onClick={() => {
                    const newItems = [...items];
                    newItems.splice(idx, 1);
                    onChange(newItems);
                  }}
                >
                  <Icons.Trash />
                </button>
              </div>
              {Object.entries(itemSchema).map(([itemKey, itemFieldSchema]) => (
                <div key={itemKey} className="form-group">
                  <label>{itemFieldSchema.title || itemKey}</label>
                  {renderField(
                    itemKey,
                    itemFieldSchema,
                    item[itemKey],
                    (val) => {
                      const newItems = [...items];
                      newItems[idx] = { ...newItems[idx], [itemKey]: val };
                      onChange(newItems);
                    }
                  )}
                </div>
              ))}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onChange([...items, {}])}
          >
            <Icons.Plus /> Add Item
          </button>
        </div>
      );
    }

    if (type === 'string' && (format === 'textarea' || format === 'richtext')) {
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={format === 'richtext' ? 8 : 4}
          placeholder={fieldSchema.title}
        />
      );
    }

    if (type === 'string' && format === 'image') {
      return (
        <div className="image-picker">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/uploads/image.jpg or https://..."
          />
          {value && (
            <div className="image-preview">
              <img src={value} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
        </div>
      );
    }

    if (type === 'string' && format === 'color') {
      return (
        <div className="color-picker">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
          />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
          />
        </div>
      );
    }

    if (type === 'string' && fieldSchema.enum) {
      return (
        <select
          value={value || fieldSchema.default || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {fieldSchema.enum.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (type === 'boolean') {
      return (
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{fieldSchema.title || 'Enabled'}</span>
        </label>
      );
    }

    if (type === 'number' || type === 'integer') {
      return (
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          min={fieldSchema.minimum}
          max={fieldSchema.maximum}
          step={type === 'integer' ? 1 : 'any'}
        />
      );
    }

    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={fieldSchema.title}
        maxLength={fieldSchema.maxLength}
      />
    );
  };

  return (
    <div className="block-content-editor">
      <div className="editor-header">
        <div className="editor-title">
          <h3>Edit {blockType?.name || 'Block'}</h3>
        </div>
        <button className="btn-icon" onClick={onClose}>
          <Icons.X />
        </button>
      </div>

      <div className="editor-tabs">
        <button
          className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button
          className={`tab-btn ${activeTab === 'style' ? 'active' : ''}`}
          onClick={() => setActiveTab('style')}
        >
          Style
        </button>
      </div>

      <div className="editor-content">
        {activeTab === 'content' && (
          <div className="content-fields">
            {Object.entries(schema).map(([key, fieldSchema]) => (
              <div key={key} className="form-group">
                <label>{fieldSchema.title || key}</label>
                {renderField(key, fieldSchema, content[key], (val) => updateContent(key, val))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'style' && (
          <div className="style-fields">
            <div className="form-group">
              <label>Background Color</label>
              <div className="color-picker">
                <input
                  type="color"
                  value={settings.backgroundColor || '#ffffff'}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                />
                <input
                  type="text"
                  value={settings.backgroundColor || ''}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Text Color</label>
              <div className="color-picker">
                <input
                  type="color"
                  value={settings.textColor || '#000000'}
                  onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                />
                <input
                  type="text"
                  value={settings.textColor || ''}
                  onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Padding</label>
              <select
                value={settings.padding || 'medium'}
                onChange={(e) => setSettings({ ...settings, padding: e.target.value })}
              >
                <option value="none">None</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div className="form-group">
              <label>Custom CSS Class</label>
              <input
                type="text"
                value={settings.customClass || ''}
                onChange={(e) => setSettings({ ...settings, customClass: e.target.value })}
                placeholder="my-custom-class"
              />
            </div>
          </div>
        )}
      </div>

      <div className="editor-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// BLOCK ITEM (Draggable)
// ============================================================================

const BlockItem = ({ block, blockType, onEdit, onDelete, onDuplicate, onToggleVisibility, isDragging }) => {
  const IconComponent = blockIcons[block.block_type] || DefaultBlockIcon;
  const GripIcon = Icons.GripVertical || Icons.Menu;
  
  return (
    <div className={`block-item ${isDragging ? 'dragging' : ''} ${!block.is_visible ? 'hidden-block' : ''}`}>
      <div className="block-drag-handle">
        <GripIcon />
      </div>
      <div className="block-icon">
        <IconComponent />
      </div>
      <div className="block-info">
        <span className="block-name">{blockType?.name || block.block_type}</span>
        <span className="block-preview">
          {block.content?.headline || block.content?.title || block.content?.content?.substring(0, 50) || 'No content'}
        </span>
      </div>
      <div className="block-actions">
        <button
          className="btn-icon"
          onClick={() => onToggleVisibility(block)}
          title={block.is_visible ? 'Hide' : 'Show'}
        >
          {block.is_visible ? <Icons.Eye /> : <Icons.EyeOff />}
        </button>
        <button className="btn-icon" onClick={() => onEdit(block)} title="Edit">
          <Icons.Edit />
        </button>
        <button className="btn-icon" onClick={() => onDuplicate(block)} title="Duplicate">
          <Icons.Copy />
        </button>
        <button className="btn-icon btn-danger" onClick={() => onDelete(block)} title="Delete">
          <Icons.Trash />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// ZONE EDITOR
// ============================================================================

const ZoneEditor = ({ 
  zone, 
  blocks, 
  blockTypes, 
  onAddBlock, 
  onEditBlock, 
  onDeleteBlock, 
  onDuplicateBlock,
  onToggleVisibility,
  onReorderBlocks 
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newBlocks = [...blocks];
    const draggedBlock = newBlocks[draggedIndex];
    newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(index, 0, draggedBlock);
    
    setDraggedIndex(index);
    onReorderBlocks(newBlocks.map((b, i) => ({ id: b.id, zone_key: zone.zone_key, display_order: i })));
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddBlock = (blockType) => {
    setShowPicker(false);
    onAddBlock(zone.zone_key, blockType);
  };

  return (
    <div className="zone-editor">
      <div className="zone-header">
        <h4>{zone.zone_name}</h4>
        <span className="zone-hint">{zone.description}</span>
        {zone.max_blocks && (
          <span className="zone-limit">
            {blocks.length}/{zone.max_blocks} blocks
          </span>
        )}
      </div>

      <div className="zone-blocks">
        {blocks.length === 0 ? (
          <div className="zone-empty">
            <p>No blocks in this zone</p>
          </div>
        ) : (
          blocks.map((block, index) => (
            <div
              key={block.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <BlockItem
                block={block}
                blockType={blockTypes.find(bt => bt.id === block.block_type)}
                onEdit={onEditBlock}
                onDelete={onDeleteBlock}
                onDuplicate={onDuplicateBlock}
                onToggleVisibility={onToggleVisibility}
                isDragging={draggedIndex === index}
              />
            </div>
          ))
        )}
      </div>

      {(!zone.max_blocks || blocks.length < zone.max_blocks) && (
        <button 
          className="btn btn-secondary btn-sm add-block-btn"
          onClick={() => setShowPicker(true)}
        >
          <Icons.Plus /> Add Block
        </button>
      )}

      {showPicker && (
        <Modal isOpen={true} title="Add Block" onClose={() => setShowPicker(false)} size="lg">
          <BlockTypePicker
            blockTypes={blockTypes}
            allowedBlocks={zone.allowed_blocks}
            onSelect={handleAddBlock}
            onClose={() => setShowPicker(false)}
          />
        </Modal>
      )}
    </div>
  );
};

// ============================================================================
// PAGE BUILDER (Full Screen Overlay)
// ============================================================================

const PageBuilder = ({ page, onClose, onSave }) => {
  const [zones, setZones] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [blockTypes, setBlockTypes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [activeTab, setActiveTab] = useState('blocks');
  const [pageSettings, setPageSettings] = useState({
    title: page.title,
    slug: page.slug,
    is_homepage: page.is_homepage || false,
    seo_title: page.seo_title || '',
    seo_description: page.seo_description || '',
    template_id: page.template_id
  });

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [blocksRes, typesRes, templatesRes] = await Promise.all([
        fetch(`${API_URL}/site-builder/pages/${page.id}/blocks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/site-builder/block-types`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/site-builder/templates`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (blocksRes.ok) {
        const data = await blocksRes.json();
        setBlocks(data.data.blocks || []);
        setZones(data.data.zones || []);
      }

      if (typesRes.ok) {
        const data = await typesRes.json();
        setBlockTypes(data.data || []);
      }

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching page data:', err);
    } finally {
      setLoading(false);
    }
  }, [page.id, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddBlock = async (zoneKey, blockType) => {
    try {
      const res = await fetch(`${API_URL}/site-builder/pages/${page.id}/blocks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          zone_key: zoneKey,
          block_type: blockType.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        setBlocks(prev => [...prev, data.data]);
      }
    } catch (err) {
      console.error('Error adding block:', err);
    }
  };

  const handleEditBlock = (block) => {
    setEditingBlock(block);
  };

  const handleSaveBlockContent = async ({ content, settings }) => {
    try {
      const res = await fetch(`${API_URL}/site-builder/pages/${page.id}/blocks/${editingBlock.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, settings })
      });

      if (res.ok) {
        const data = await res.json();
        setBlocks(prev => prev.map(b => b.id === editingBlock.id ? data.data : b));
        setEditingBlock(null);
      }
    } catch (err) {
      console.error('Error saving block:', err);
    }
  };

  const handleDeleteBlock = async (block) => {
    if (!window.confirm('Delete this block?')) return;

    try {
      await fetch(`${API_URL}/site-builder/pages/${page.id}/blocks/${block.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setBlocks(prev => prev.filter(b => b.id !== block.id));
    } catch (err) {
      console.error('Error deleting block:', err);
    }
  };

  const handleDuplicateBlock = async (block) => {
    try {
      const res = await fetch(`${API_URL}/site-builder/pages/${page.id}/blocks/${block.id}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setBlocks(prev => [...prev, data.data]);
      }
    } catch (err) {
      console.error('Error duplicating block:', err);
    }
  };

  const handleToggleVisibility = async (block) => {
    try {
      const res = await fetch(`${API_URL}/site-builder/pages/${page.id}/blocks/${block.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_visible: !block.is_visible })
      });

      if (res.ok) {
        const data = await res.json();
        setBlocks(prev => prev.map(b => b.id === block.id ? data.data : b));
      }
    } catch (err) {
      console.error('Error toggling visibility:', err);
    }
  };

  const handleReorderBlocks = async (reorderedBlocks) => {
    try {
      await fetch(`${API_URL}/site-builder/pages/${page.id}/blocks/reorder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ blocks: reorderedBlocks })
      });
    } catch (err) {
      console.error('Error reordering blocks:', err);
    }
  };

  const handleTemplateChange = async (templateId) => {
    try {
      const res = await fetch(`${API_URL}/site-builder/pages/${page.id}/template`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ template_id: templateId, initialize_blocks: blocks.length === 0 })
      });

      if (res.ok) {
        setPageSettings(prev => ({ ...prev, template_id: templateId }));
        fetchData();
      }
    } catch (err) {
      console.error('Error changing template:', err);
    }
  };

  const handleSavePage = async () => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/site-designer/pages/${page.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pageSettings)
      });

      onSave();
    } catch (err) {
      console.error('Error saving page:', err);
    } finally {
      setSaving(false);
    }
  };

  const getBlocksForZone = (zoneKey) => {
    return blocks
      .filter(b => b.zone_key === zoneKey)
      .sort((a, b) => a.display_order - b.display_order);
  };

  const effectiveZones = zones.length > 0 ? zones : [
    { zone_key: 'content', zone_name: 'Main Content', description: 'Add any blocks here', allowed_blocks: [] }
  ];

  if (loading) {
    return (
      <div style={overlayStyles}>
        <div style={{ ...builderStyles, justifyContent: 'center', alignItems: 'center' }}>
          <Icons.Loader style={{ animation: 'spin 1s linear infinite' }} />
          <p>Loading page builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyles} className="page-builder-overlay">
      <div style={builderStyles} className="page-builder">
        {/* Header */}
        <div style={builderHeaderStyles} className="builder-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="builder-title">
            <button className="btn-icon" onClick={onClose} style={{ padding: '8px' }}>
              <Icons.ArrowLeft />
            </button>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Edit: {page.title}</h2>
          </div>
          <div style={{ display: 'flex', gap: '12px' }} className="builder-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSavePage} disabled={saving}>
              {saving ? 'Saving...' : 'Save Page'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={builderTabsStyles} className="builder-tabs">
          <button
            className={`tab-btn ${activeTab === 'blocks' ? 'active' : ''}`}
            onClick={() => setActiveTab('blocks')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              border: 'none',
              background: activeTab === 'blocks' ? '#2d5016' : 'transparent',
              color: activeTab === 'blocks' ? 'white' : '#6b7280',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <Icons.Layout /> Page Content
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              border: 'none',
              background: activeTab === 'settings' ? '#2d5016' : 'transparent',
              color: activeTab === 'settings' ? 'white' : '#6b7280',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <Icons.Settings /> Page Settings
          </button>
          <button
            className={`tab-btn ${activeTab === 'seo' ? 'active' : ''}`}
            onClick={() => setActiveTab('seo')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              border: 'none',
              background: activeTab === 'seo' ? '#2d5016' : 'transparent',
              color: activeTab === 'seo' ? 'white' : '#6b7280',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <Icons.Search /> SEO
          </button>
        </div>

        {/* Content */}
        <div style={builderContentStyles} className="builder-content">
          {activeTab === 'blocks' && (
            <div className="blocks-layout" style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div className="template-selector" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <label style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>Page Template:</label>
                <select
                  value={pageSettings.template_id || ''}
                  onChange={(e) => handleTemplateChange(e.target.value || null)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    background: '#ffffff',
                    fontSize: '14px'
                  }}
                >
                  <option value="">No Template (Free-form)</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="zones-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {effectiveZones.map(zone => (
                  <ZoneEditor
                    key={zone.zone_key}
                    zone={zone}
                    blocks={getBlocksForZone(zone.zone_key)}
                    blockTypes={blockTypes}
                    onAddBlock={handleAddBlock}
                    onEditBlock={handleEditBlock}
                    onDeleteBlock={handleDeleteBlock}
                    onDuplicateBlock={handleDuplicateBlock}
                    onToggleVisibility={handleToggleVisibility}
                    onReorderBlocks={handleReorderBlocks}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="page-settings-tab" style={{ maxWidth: '600px' }}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Page Title</label>
                <input
                  type="text"
                  value={pageSettings.title}
                  onChange={(e) => setPageSettings({ ...pageSettings, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>URL Slug</label>
                <div className="slug-input" style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    padding: '10px 12px',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRight: 'none',
                    borderRadius: '6px 0 0 6px',
                    color: '#6b7280',
                    fontFamily: 'monospace'
                  }}>/</span>
                  <input
                    type="text"
                    value={pageSettings.slug}
                    onChange={(e) => setPageSettings({ ...pageSettings, slug: e.target.value })}
                    disabled={page.is_system_page && page.page_type === 'home'}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0 6px 6px 0',
                      fontSize: '14px',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={pageSettings.is_homepage}
                    onChange={(e) => setPageSettings({ ...pageSettings, is_homepage: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Set as Homepage</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="seo-settings-tab" style={{ maxWidth: '600px' }}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>SEO Title</label>
                <input
                  type="text"
                  value={pageSettings.seo_title}
                  onChange={(e) => setPageSettings({ ...pageSettings, seo_title: e.target.value })}
                  placeholder="Page title for search engines"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{pageSettings.seo_title?.length || 0}/60 characters</span>
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Meta Description</label>
                <textarea
                  value={pageSettings.seo_description}
                  onChange={(e) => setPageSettings({ ...pageSettings, seo_description: e.target.value })}
                  placeholder="Brief description for search results"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{pageSettings.seo_description?.length || 0}/160 characters</span>
              </div>

              <div className="seo-preview" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>Search Preview</h4>
                <div style={{
                  padding: '16px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '18px', color: '#1a0dab', marginBottom: '4px' }}>
                    {pageSettings.seo_title || pageSettings.title || 'Page Title'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#006621', marginBottom: '4px' }}>
                    example.com/{pageSettings.slug || ''}
                  </div>
                  <div style={{ fontSize: '14px', color: '#545454', lineHeight: 1.5 }}>
                    {pageSettings.seo_description || 'No description set.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {editingBlock && (
          <Modal isOpen={true} title="Edit Block" onClose={() => setEditingBlock(null)} size="lg">
            <BlockContentEditor
              block={editingBlock}
              blockType={blockTypes.find(bt => bt.id === editingBlock.block_type)}
              onSave={handleSaveBlockContent}
              onClose={() => setEditingBlock(null)}
            />
          </Modal>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN SITE BUILDER VIEW
// ============================================================================

const SiteBuilderView = () => {
  const [pages, setPages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(null);
  const [showCreatePage, setShowCreatePage] = useState(false);

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pagesRes, templatesRes] = await Promise.all([
        fetch(`${API_URL}/site-designer/pages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/site-builder/templates`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (pagesRes.ok) {
        const data = await pagesRes.json();
        setPages(data.data || []);
      }

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreatePage = async (pageData) => {
    try {
      const res = await fetch(`${API_URL}/site-designer/pages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pageData)
      });

      if (res.ok) {
        setShowCreatePage(false);
        fetchData();
      }
    } catch (err) {
      console.error('Error creating page:', err);
    }
  };

  const handleEditPage = (page) => {
    setEditingPage(page);
  };

  const handleTogglePublish = async (page) => {
    try {
      await fetch(`${API_URL}/site-designer/pages/${page.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_published: !page.is_published })
      });
      fetchData();
    } catch (err) {
      console.error('Error toggling publish:', err);
    }
  };

  const handleDeletePage = async (page) => {
    if (!window.confirm(`Delete "${page.title}"?`)) return;

    try {
      await fetch(`${API_URL}/site-designer/pages/${page.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting page:', err);
    }
  };

  const handleInitializePages = async () => {
    try {
      await fetch(`${API_URL}/site-designer/pages/initialize`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Error initializing pages:', err);
    }
  };

  if (loading) {
    return (
      <div className="site-builder-view loading">
        <Icons.Loader />
        <p>Loading site builder...</p>
      </div>
    );
  }

  return (
    <div className="site-builder-view">
      <div className="view-header">
        <div className="view-title">
          <h2>Site Builder</h2>
          <span className="subtitle">Build and customize your website pages</span>
        </div>
        <div className="view-actions">
          <button className="btn btn-primary" onClick={() => setShowCreatePage(true)}>
            <Icons.Plus /> New Page
          </button>
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="empty-state">
          <Icons.Layout />
          <h3>No Pages Yet</h3>
          <p>Get started by initializing your default pages or create a new one.</p>
          <div className="empty-actions">
            <button className="btn btn-primary" onClick={handleInitializePages}>
              <Icons.Plus /> Initialize Default Pages
            </button>
            <button className="btn btn-secondary" onClick={() => setShowCreatePage(true)}>
              <Icons.Plus /> Create Custom Page
            </button>
          </div>
        </div>
      ) : (
        <div className="pages-grid">
          {pages.map(page => (
            <div key={page.id} className="page-card">
              <div className="page-card-header">
                <div className="page-type-badge">{page.page_type}</div>
                <span className={`status-badge ${page.is_published ? 'published' : 'draft'}`}>
                  {page.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="page-card-body">
                <h3>{page.title}</h3>
                <span className="page-slug">/{page.slug || '(home)'}</span>
              </div>
              <div className="page-card-actions">
                <button className="btn btn-sm btn-primary" onClick={() => handleEditPage(page)}>
                  <Icons.Edit /> Edit
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleTogglePublish(page)}
                >
                  {page.is_published ? <Icons.EyeOff /> : <Icons.Eye />}
                  {page.is_published ? 'Unpublish' : 'Publish'}
                </button>
                {!page.is_system_page && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeletePage(page)}
                  >
                    <Icons.Trash />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreatePage && (
        <CreatePageModal
          templates={templates}
          onSave={handleCreatePage}
          onClose={() => setShowCreatePage(false)}
        />
      )}

      {editingPage && (
        <PageBuilder
          page={editingPage}
          onClose={() => setEditingPage(null)}
          onSave={() => {
            setEditingPage(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// CREATE PAGE MODAL
// ============================================================================

const CreatePageModal = ({ templates, onSave, onClose }) => {
  const [form, setForm] = useState({
    page_type: 'custom',
    title: '',
    slug: '',
    template_id: ''
  });
  const [saving, setSaving] = useState(false);

  const handleTitleChange = (title) => {
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setForm({ ...form, title, slug });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <Modal isOpen={true} title="Create New Page" onClose={onClose}>
      <form onSubmit={handleSubmit} className="create-page-form">
        <div className="form-group">
          <label>Page Template</label>
          <select
            value={form.template_id}
            onChange={(e) => setForm({ ...form, template_id: e.target.value })}
          >
            <option value="">No Template (Free-form)</option>
            {templates?.map(t => (
              <option key={t.id} value={t.id}>{t.name} - {t.description}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Page Type</label>
          <select
            value={form.page_type}
            onChange={(e) => setForm({ ...form, page_type: e.target.value })}
          >
            <option value="custom">Custom Page</option>
            <option value="about">About Page</option>
            <option value="contact">Contact Page</option>
            <option value="faq">FAQ Page</option>
          </select>
        </div>
        <div className="form-group">
          <label>Page Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="My New Page"
            required
          />
        </div>
        <div className="form-group">
          <label>URL Slug</label>
          <div className="slug-input">
            <span className="slug-prefix">/</span>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="my-new-page"
              required
            />
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Creating...' : 'Create Page'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SiteBuilderView;