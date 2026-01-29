/**
 * Site Designer View
 * Manage site theme, settings, and pages
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../common/Icons';
import Modal from '../common/Modal';
import './SiteDesignerView.css';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

// ============================================================================
// THEME SELECTOR
// ============================================================================

const ThemeSelector = ({ themes, currentThemeId, onSelect }) => {
  return (
    <div className="theme-selector">
      <h3>Site Theme</h3>
      <div className="theme-grid">
        {themes.map(theme => (
          <div 
            key={theme.id}
            className={`theme-card ${currentThemeId === theme.id ? 'selected' : ''}`}
            onClick={() => onSelect(theme.id)}
          >
            <div 
              className="theme-preview"
              style={{ 
                background: `linear-gradient(135deg, ${theme.default_colors?.primary || '#4a6741'} 0%, ${theme.default_colors?.secondary || '#8b7355'} 100%)`
              }}
            >
              <div className="theme-preview-header" style={{ background: theme.default_colors?.primary }}>
                <div className="preview-logo"></div>
                <div className="preview-nav">
                  <span></span><span></span><span></span>
                </div>
              </div>
              <div className="theme-preview-hero">
                <div className="preview-text-lg"></div>
                <div className="preview-text-sm"></div>
                <div className="preview-btn" style={{ background: theme.default_colors?.accent || theme.default_colors?.primary }}></div>
              </div>
            </div>
            <div className="theme-info">
              <h4>{theme.name}</h4>
              <p>{theme.description}</p>
              {currentThemeId === theme.id && (
                <span className="theme-active-badge">Active</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// SITE SETTINGS MODAL
// ============================================================================

const SiteSettingsModal = ({ settings, themes, onSave, onClose }) => {
  // Get default colors from selected theme
  const selectedTheme = themes?.find(t => t.id === settings?.theme_id);
  const themeColors = selectedTheme?.default_colors || {};
  const themeFonts = selectedTheme?.default_fonts || {};

  const [form, setForm] = useState({
    site_name: settings?.site_name || '',
    tagline: settings?.tagline || '',
    logo_url: settings?.logo_url || '',
    favicon_url: settings?.favicon_url || '',
    color_overrides: settings?.color_overrides || {},
    font_overrides: settings?.font_overrides || {},
    contact_info: settings?.contact_info || { phone: '', email: '', address: '' },
    social_links: settings?.social_links || { facebook: '', instagram: '', twitter: '', linkedin: '' },
    business_hours: settings?.business_hours || [],
    default_seo_title: settings?.default_seo_title || '',
    default_seo_description: settings?.default_seo_description || ''
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const updateColorOverride = (colorKey, value) => {
    setForm(prev => ({
      ...prev,
      color_overrides: { ...prev.color_overrides, [colorKey]: value }
    }));
  };

  const clearColorOverride = (colorKey) => {
    setForm(prev => {
      const newOverrides = { ...prev.color_overrides };
      delete newOverrides[colorKey];
      return { ...prev, color_overrides: newOverrides };
    });
  };

  const updateFontOverride = (fontKey, value) => {
    setForm(prev => ({
      ...prev,
      font_overrides: { ...prev.font_overrides, [fontKey]: value }
    }));
  };

  const updateContactInfo = (field, value) => {
    setForm(prev => ({
      ...prev,
      contact_info: { ...prev.contact_info, [field]: value }
    }));
  };

  const updateSocialLinks = (field, value) => {
    setForm(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [field]: value }
    }));
  };

  const addBusinessHour = () => {
    setForm(prev => ({
      ...prev,
      business_hours: [...prev.business_hours, { day: '', hours: '' }]
    }));
  };

  const updateBusinessHour = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      business_hours: prev.business_hours.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeBusinessHour = (index) => {
    setForm(prev => ({
      ...prev,
      business_hours: prev.business_hours.filter((_, i) => i !== index)
    }));
  };

  // Color configuration with labels
  const colorFields = [
    { key: 'primary', label: 'Primary Color', hint: 'Main brand color (buttons, links, headers)' },
    { key: 'secondary', label: 'Secondary Color', hint: 'Supporting color for accents' },
    { key: 'accent', label: 'Accent Color', hint: 'Highlight color for CTAs and emphasis' },
    { key: 'background', label: 'Background', hint: 'Main page background' },
    { key: 'backgroundAlt', label: 'Alt Background', hint: 'Alternate sections background' },
    { key: 'text', label: 'Text Color', hint: 'Primary text color' },
    { key: 'textLight', label: 'Light Text', hint: 'Secondary/muted text' },
  ];

  // Font options
  const fontOptions = [
    'Playfair Display', 'Open Sans', 'Inter', 'Roboto', 'Lato', 
    'Montserrat', 'Merriweather', 'Source Sans Pro', 'Georgia', 'Arial'
  ];

  return (
    <Modal isOpen={true} title="Site Settings" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="site-settings-form">
        <div className="settings-tabs">
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'branding' ? 'active' : ''}`}
            onClick={() => setActiveTab('branding')}
          >
            Branding
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'hours' ? 'active' : ''}`}
            onClick={() => setActiveTab('hours')}
          >
            Hours
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            Social
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'seo' ? 'active' : ''}`}
            onClick={() => setActiveTab('seo')}
          >
            SEO
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <div className="form-group">
                <label>Site Name</label>
                <input
                  type="text"
                  value={form.site_name}
                  onChange={(e) => setForm({ ...form, site_name: e.target.value })}
                  placeholder="My Business"
                />
              </div>
              <div className="form-group">
                <label>Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  placeholder="Your catchy tagline"
                />
              </div>
              <div className="form-group">
                <label>Logo URL</label>
                <input
                  type="text"
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  placeholder="/uploads/logo.png"
                />
                <span className="form-hint">Upload via Media Library, then paste URL here</span>
              </div>
              <div className="form-group">
                <label>Favicon URL</label>
                <input
                  type="text"
                  value={form.favicon_url}
                  onChange={(e) => setForm({ ...form, favicon_url: e.target.value })}
                  placeholder="/uploads/favicon.ico"
                />
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="settings-section">
              <h4>Colors</h4>
              <p className="section-hint">Override theme defaults. Leave blank to use theme colors.</p>
              
              <div className="color-grid">
                {colorFields.map(({ key, label, hint }) => (
                  <div key={key} className="form-group color-field">
                    <label>{label}</label>
                    <div className="color-input-group">
                      <input
                        type="color"
                        value={form.color_overrides[key] || themeColors[key] || '#ffffff'}
                        onChange={(e) => updateColorOverride(key, e.target.value)}
                        className="color-picker"
                      />
                      <input
                        type="text"
                        value={form.color_overrides[key] || ''}
                        onChange={(e) => updateColorOverride(key, e.target.value)}
                        placeholder={themeColors[key] || 'Theme default'}
                        className="color-text"
                      />
                      {form.color_overrides[key] && (
                        <button 
                          type="button" 
                          className="btn-icon btn-clear"
                          onClick={() => clearColorOverride(key)}
                          title="Reset to theme default"
                        >
                          <Icons.X />
                        </button>
                      )}
                    </div>
                    <span className="form-hint">{hint}</span>
                  </div>
                ))}
              </div>

              <h4 style={{ marginTop: '1.5rem' }}>Fonts</h4>
              <div className="form-group">
                <label>Heading Font</label>
                <select
                  value={form.font_overrides.heading || ''}
                  onChange={(e) => updateFontOverride('heading', e.target.value)}
                >
                  <option value="">Theme default ({themeFonts.heading || 'Not set'})</option>
                  {fontOptions.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Body Font</label>
                <select
                  value={form.font_overrides.body || ''}
                  onChange={(e) => updateFontOverride('body', e.target.value)}
                >
                  <option value="">Theme default ({themeFonts.body || 'Not set'})</option>
                  {fontOptions.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="settings-section">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={form.contact_info.phone}
                  onChange={(e) => updateContactInfo('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.contact_info.email}
                  onChange={(e) => updateContactInfo('email', e.target.value)}
                  placeholder="info@example.com"
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={form.contact_info.address}
                  onChange={(e) => updateContactInfo('address', e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                  rows={3}
                />
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="settings-section">
              <p className="section-hint">Add business hours, delivery schedules, or availability information.</p>
              
              <div className="business-hours-list">
                {form.business_hours.map((item, index) => (
                  <div key={index} className="business-hour-row">
                    <input
                      type="text"
                      value={item.day}
                      onChange={(e) => updateBusinessHour(index, 'day', e.target.value)}
                      placeholder="Day or Label (e.g., Monday, Delivery - Tyler)"
                      className="hour-day"
                    />
                    <input
                      type="text"
                      value={item.hours}
                      onChange={(e) => updateBusinessHour(index, 'hours', e.target.value)}
                      placeholder="Hours (e.g., 9am - 5pm, By appointment)"
                      className="hour-time"
                    />
                    <button 
                      type="button" 
                      className="btn-icon btn-danger"
                      onClick={() => removeBusinessHour(index)}
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                ))}
              </div>
              
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={addBusinessHour}
              >
                <Icons.Plus /> Add Hours Entry
              </button>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="settings-section">
              <div className="form-group">
                <label>Facebook URL</label>
                <input
                  type="url"
                  value={form.social_links.facebook}
                  onChange={(e) => updateSocialLinks('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div className="form-group">
                <label>Instagram URL</label>
                <input
                  type="url"
                  value={form.social_links.instagram}
                  onChange={(e) => updateSocialLinks('instagram', e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
              <div className="form-group">
                <label>Twitter / X URL</label>
                <input
                  type="url"
                  value={form.social_links.twitter}
                  onChange={(e) => updateSocialLinks('twitter', e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input
                  type="url"
                  value={form.social_links.linkedin}
                  onChange={(e) => updateSocialLinks('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="settings-section">
              <div className="form-group">
                <label>Default Page Title</label>
                <input
                  type="text"
                  value={form.default_seo_title}
                  onChange={(e) => setForm({ ...form, default_seo_title: e.target.value })}
                  placeholder="My Business - Tagline"
                />
                <span className="form-hint">Used when pages don't have a custom title</span>
              </div>
              <div className="form-group">
                <label>Default Meta Description</label>
                <textarea
                  value={form.default_seo_description}
                  onChange={(e) => setForm({ ...form, default_seo_description: e.target.value })}
                  placeholder="Describe your business in 150-160 characters"
                  rows={3}
                />
                <span className="form-hint">{form.default_seo_description.length}/160 characters</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ============================================================================
// PAGE LIST
// ============================================================================

const PageList = ({ pages, onEdit, onTogglePublish, onDelete, onCreate }) => {
  const pageTypeIcons = {
    home: Icons.Home || Icons.Dashboard,
    about: Icons.Users,
    contact: Icons.Phone || Icons.Mail,
    faq: Icons.HelpCircle || Icons.FileText,
    custom: Icons.FileText
  };

  return (
    <div className="page-list">
      <div className="page-list-header">
        <h3>Pages</h3>
        <button className="btn btn-primary btn-sm" onClick={onCreate}>
          <Icons.Plus /> Add Page
        </button>
      </div>
      
      <div className="pages-table">
        <div className="table-header">
          <span className="col-page">Page</span>
          <span className="col-slug">URL</span>
          <span className="col-status">Status</span>
          <span className="col-actions">Actions</span>
        </div>
        
        {pages.map(page => {
          const IconComponent = pageTypeIcons[page.page_type] || Icons.FileText;
          return (
            <div key={page.id} className="table-row">
              <div className="col-page">
                <IconComponent />
                <div>
                  <span className="page-title">{page.title}</span>
                  <span className="page-type">{page.page_type}</span>
                </div>
              </div>
              <div className="col-slug">
                /{page.slug || '(home)'}
              </div>
              <div className="col-status">
                <span className={`status-badge ${page.is_published ? 'published' : 'draft'}`}>
                  {page.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="col-actions">
                <button 
                  className="btn-icon" 
                  onClick={() => onEdit(page)}
                  title="Edit Page"
                >
                  <Icons.Edit />
                </button>
                <button 
                  className="btn-icon"
                  onClick={() => onTogglePublish(page)}
                  title={page.is_published ? 'Unpublish' : 'Publish'}
                >
                  {page.is_published ? <Icons.EyeOff /> : <Icons.Eye />}
                </button>
                {!page.is_system_page && (
                  <button 
                    className="btn-icon btn-danger"
                    onClick={() => onDelete(page)}
                    title="Delete Page"
                  >
                    <Icons.Trash />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// CREATE PAGE MODAL
// ============================================================================

const CreatePageModal = ({ onSave, onClose }) => {
  const [form, setForm] = useState({
    page_type: 'custom',
    title: '',
    slug: ''
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

// ============================================================================
// PAGE EDITOR
// ============================================================================

const PageEditor = ({ page, themeSections, onSave, onClose }) => {
  const [sections, setSections] = useState(page.sections || []);
  const [pageSettings, setPageSettings] = useState({
    title: page.title,
    slug: page.slug,
    seo_title: page.seo_title || '',
    seo_description: page.seo_description || ''
  });
  const [activeSection, setActiveSection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('sections');

  // Get the theme section definition for a given section type
  const getSectionDefinition = (sectionType) => {
    return themeSections?.find(s => s.section_type === sectionType);
  };

  const handleSectionToggle = (sectionId) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, is_enabled: !s.is_enabled } : s
    ));
  };

  const handleSectionSettingsChange = (sectionId, newSettings) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, settings: newSettings } : s
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(page.id, pageSettings, sections);
    setSaving(false);
  };

  // Render settings editor for a section
  const renderSectionEditor = (section) => {
    const definition = getSectionDefinition(section.section_type);
    if (!definition) return null;

    const schema = definition.settings_schema?.properties || {};
    const settings = section.settings || {};

    return (
      <div className="section-editor">
        <div className="section-editor-header">
          <h4>{definition.section_name}</h4>
          <button 
            className="btn-icon"
            onClick={() => setActiveSection(null)}
          >
            <Icons.X />
          </button>
        </div>
        <p className="section-description">{definition.description}</p>
        
        <div className="section-fields">
          {Object.entries(schema).map(([key, fieldSchema]) => (
            <div key={key} className="form-group">
              <label>{fieldSchema.title || key}</label>
              {renderField(key, fieldSchema, settings[key], (value) => {
                handleSectionSettingsChange(section.id, {
                  ...settings,
                  [key]: value
                });
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render a form field based on schema type
  const renderField = (key, schema, value, onChange) => {
    const type = schema.type;
    const format = schema.format;

    if (type === 'string' && format === 'textarea') {
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      );
    }

    if (type === 'string' && format === 'richtext') {
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          placeholder="Rich text content..."
        />
      );
    }

    if (type === 'string' && format === 'image') {
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/image.jpg"
        />
      );
    }

    if (type === 'string' && schema.enum) {
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {schema.enum.map(opt => (
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
          <span>Enabled</span>
        </label>
      );
    }

    if (type === 'number' || type === 'integer') {
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          min={schema.minimum}
          max={schema.maximum}
        />
      );
    }

    if (type === 'array') {
      return (
        <div className="array-field">
          <span className="array-hint">
            {Array.isArray(value) ? `${value.length} items` : '0 items'} 
            (Edit in JSON for now)
          </span>
          <textarea
            value={JSON.stringify(value || [], null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {}
            }}
            rows={6}
            className="json-editor"
          />
        </div>
      );
    }

    // Default: text input
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        maxLength={schema.maxLength}
      />
    );
  };

  return (
    <div className="page-editor-overlay">
      <div className="page-editor">
        <div className="page-editor-header">
          <div className="editor-title">
            <button className="btn-icon" onClick={onClose}>
              <Icons.ArrowLeft />
            </button>
            <h2>Edit: {page.title}</h2>
          </div>
          <div className="editor-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="page-editor-tabs">
          <button 
            className={`tab-btn ${activeTab === 'sections' ? 'active' : ''}`}
            onClick={() => setActiveTab('sections')}
          >
            Sections
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Page Settings
          </button>
          <button 
            className={`tab-btn ${activeTab === 'seo' ? 'active' : ''}`}
            onClick={() => setActiveTab('seo')}
          >
            SEO
          </button>
        </div>

        <div className="page-editor-content">
          {activeTab === 'sections' && (
            <div className="sections-layout">
              <div className="sections-list">
                <h3>Page Sections</h3>
                <p className="hint">Toggle sections on/off and click to edit content</p>
                
                {sections.map((section, index) => {
                  const definition = getSectionDefinition(section.section_type);
                  return (
                    <div 
                      key={section.id}
                      className={`section-item ${section.is_enabled ? 'enabled' : 'disabled'} ${activeSection === section.id ? 'active' : ''}`}
                    >
                      <div className="section-item-main" onClick={() => setActiveSection(section.id)}>
                        <div className="section-order">{index + 1}</div>
                        <div className="section-info">
                          <span className="section-name">{definition?.section_name || section.section_type}</span>
                          <span className="section-desc">{definition?.description}</span>
                        </div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={section.is_enabled}
                          onChange={() => handleSectionToggle(section.id)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="section-editor-panel">
                {activeSection ? (
                  renderSectionEditor(sections.find(s => s.id === activeSection))
                ) : (
                  <div className="no-section-selected">
                    <Icons.Edit />
                    <p>Select a section to edit its content</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="page-settings">
              <div className="form-group">
                <label>Page Title</label>
                <input
                  type="text"
                  value={pageSettings.title}
                  onChange={(e) => setPageSettings({ ...pageSettings, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>URL Slug</label>
                <div className="slug-input">
                  <span className="slug-prefix">/</span>
                  <input
                    type="text"
                    value={pageSettings.slug}
                    onChange={(e) => setPageSettings({ ...pageSettings, slug: e.target.value })}
                    disabled={page.is_system_page && page.page_type === 'home'}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="page-seo">
              <div className="form-group">
                <label>SEO Title</label>
                <input
                  type="text"
                  value={pageSettings.seo_title}
                  onChange={(e) => setPageSettings({ ...pageSettings, seo_title: e.target.value })}
                  placeholder="Page title for search engines"
                />
                <span className="form-hint">{pageSettings.seo_title?.length || 0}/60 characters</span>
              </div>
              <div className="form-group">
                <label>Meta Description</label>
                <textarea
                  value={pageSettings.seo_description}
                  onChange={(e) => setPageSettings({ ...pageSettings, seo_description: e.target.value })}
                  placeholder="Brief description for search results"
                  rows={3}
                />
                <span className="form-hint">{pageSettings.seo_description?.length || 0}/160 characters</span>
              </div>
              
              <div className="seo-preview">
                <h4>Search Preview</h4>
                <div className="search-result-preview">
                  <div className="preview-title">
                    {pageSettings.seo_title || pageSettings.title || 'Page Title'}
                  </div>
                  <div className="preview-url">
                    example.com/{pageSettings.slug || ''}
                  </div>
                  <div className="preview-description">
                    {pageSettings.seo_description || 'No description set. Add a meta description to improve click-through rates.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN SITE DESIGNER VIEW
// ============================================================================

const SiteDesignerView = () => {
  const [themes, setThemes] = useState([]);
  const [settings, setSettings] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [themeSections, setThemeSections] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const [themesRes, settingsRes, pagesRes] = await Promise.all([
        fetch(`${API_URL}/site-designer/themes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/site-designer/settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/site-designer/pages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (themesRes.ok) {
        const data = await themesRes.json();
        setThemes(data.data || []);
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data.data);
        
        // Fetch theme sections if we have a theme
        if (data.data?.theme_id) {
          const sectionsRes = await fetch(
            `${API_URL}/site-designer/themes/${data.data.theme_id}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (sectionsRes.ok) {
            const sectionsData = await sectionsRes.json();
            setThemeSections(sectionsData.data?.sections || {});
          }
        }
      }

      if (pagesRes.ok) {
        const data = await pagesRes.json();
        setPages(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching site designer data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleThemeSelect = async (themeId) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/site-designer/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ theme_id: themeId })
    });
    fetchData();
  };

  const handleSaveSettings = async (newSettings) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/site-designer/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newSettings)
    });
    setShowSettings(false);
    fetchData();
  };

  const handleCreatePage = async (pageData) => {
    const token = localStorage.getItem('token');
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
  };

  const handleEditPage = async (page) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/site-designer/pages/${page.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      const data = await res.json();
      setEditingPage(data.data);
    }
  };

  const handleSavePage = async (pageId, pageSettings, sections) => {
    const token = localStorage.getItem('token');
    
    // Update page settings
    await fetch(`${API_URL}/site-designer/pages/${pageId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pageSettings)
    });

    // Update sections
    for (const section of sections) {
      await fetch(`${API_URL}/site-designer/pages/${pageId}/sections/${section.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_enabled: section.is_enabled,
          settings: section.settings
        })
      });
    }

    setEditingPage(null);
    fetchData();
  };

  const handleTogglePublish = async (page) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/site-designer/pages/${page.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_published: !page.is_published })
    });
    fetchData();
  };

  const handleDeletePage = async (page) => {
    if (!window.confirm(`Are you sure you want to delete "${page.title}"?`)) return;
    
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/site-designer/pages/${page.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  const handleInitializePages = async () => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/site-designer/pages/initialize`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  if (loading) {
    return (
      <div className="site-designer-view loading">
        <Icons.Loader />
        <p>Loading site designer...</p>
      </div>
    );
  }

  return (
    <div className="site-designer-view">
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          <h2>Site Designer</h2>
          <span className="theme-name">
            Theme: {settings?.theme_name || 'None selected'}
          </span>
        </div>
        <div className="view-actions">
          <button className="btn btn-secondary" onClick={() => setShowSettings(true)}>
            <Icons.Settings /> Site Settings
          </button>
        </div>
      </div>

      {/* Theme Selector */}
      <ThemeSelector
        themes={themes}
        currentThemeId={settings?.theme_id}
        onSelect={handleThemeSelect}
      />

      {/* Pages */}
      {pages.length === 0 ? (
        <div className="empty-pages">
          <Icons.FileText />
          <h3>No Pages Yet</h3>
          <p>Initialize your site with default pages to get started.</p>
          <button className="btn btn-primary" onClick={handleInitializePages}>
            <Icons.Plus /> Initialize Default Pages
          </button>
        </div>
      ) : (
        <PageList
          pages={pages}
          onEdit={handleEditPage}
          onTogglePublish={handleTogglePublish}
          onDelete={handleDeletePage}
          onCreate={() => setShowCreatePage(true)}
        />
      )}

      {/* Modals */}
      {showSettings && (
        <SiteSettingsModal
          settings={settings}
          themes={themes}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showCreatePage && (
        <CreatePageModal
          onSave={handleCreatePage}
          onClose={() => setShowCreatePage(false)}
        />
      )}

      {editingPage && (
        <PageEditor
          page={editingPage}
          themeSections={themeSections[editingPage.page_type] || []}
          onSave={handleSavePage}
          onClose={() => setEditingPage(null)}
        />
      )}
    </div>
  );
};

export default SiteDesignerView;
