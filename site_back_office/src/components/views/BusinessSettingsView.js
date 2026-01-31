/**
 * BusinessSettingsView.js
 * Allows tenant admins to manage their business settings
 * 
 * Location: back_office/src/components/views/BusinessSettingsView.js
 */

import React, { useState, useEffect, useCallback } from 'react';
import Icons from '../Icons';
import './BusinessSettingsView.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'UTC', label: 'UTC' }
];

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' }
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const DEFAULT_BUSINESS_HOURS = {
  monday: { open: '09:00', close: '17:00', closed: false },
  tuesday: { open: '09:00', close: '17:00', closed: false },
  wednesday: { open: '09:00', close: '17:00', closed: false },
  thursday: { open: '09:00', close: '17:00', closed: false },
  friday: { open: '09:00', close: '17:00', closed: false },
  saturday: { open: '10:00', close: '14:00', closed: false },
  sunday: { open: '', close: '', closed: true }
};

function BusinessSettingsView() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    primary_color: '#2d5016',
    secondary_color: '#4a7c59',
    tax_rate: 0.0825,
    currency: 'USD',
    timezone: 'America/Chicago',
    business_hours: DEFAULT_BUSINESS_HOURS
  });

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/tenant-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setSettings(data.data);
        setFormData({
          name: data.data.name || '',
          description: data.data.description || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          address: data.data.address || '',
          city: data.data.city || '',
          state: data.data.state || '',
          zip_code: data.data.zip_code || '',
          primary_color: data.data.primary_color || '#2d5016',
          secondary_color: data.data.secondary_color || '#4a7c59',
          tax_rate: data.data.tax_rate || 0.0825,
          currency: data.data.currency || 'USD',
          timezone: data.data.timezone || 'America/Chicago',
          business_hours: data.data.business_hours || DEFAULT_BUSINESS_HOURS
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSuccess(null);
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: {
          ...prev.business_hours[day],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
    setSuccess(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/tenant-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save settings');
      }

      setSettings(data.data);
      setHasChanges(false);
      setSuccess('Settings saved successfully');
      
      // Update the CSS custom property for primary color
      document.documentElement.style.setProperty('--accent-primary', formData.primary_color);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        name: settings.name || '',
        description: settings.description || '',
        email: settings.email || '',
        phone: settings.phone || '',
        address: settings.address || '',
        city: settings.city || '',
        state: settings.state || '',
        zip_code: settings.zip_code || '',
        primary_color: settings.primary_color || '#2d5016',
        secondary_color: settings.secondary_color || '#4a7c59',
        tax_rate: settings.tax_rate || 0.0825,
        currency: settings.currency || 'USD',
        timezone: settings.timezone || 'America/Chicago',
        business_hours: settings.business_hours || DEFAULT_BUSINESS_HOURS
      });
      setHasChanges(false);
      setError(null);
      setSuccess(null);
    }
  };

  if (loading) {
    return (
      <div className="business-settings-view">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-settings-view">
      <div className="page-header">
        <div className="header-content">
          <h1>Business Settings</h1>
          <p className="header-subtitle">Manage your business information, branding, and preferences</p>
        </div>
        <div className="header-actions">
          {hasChanges && (
            <button className="btn btn-secondary" onClick={handleReset}>
              <Icons.X size={16} />
              Discard Changes
            </button>
          )}
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <>
                <span className="spinner-small"></span>
                Saving...
              </>
            ) : (
              <>
                <Icons.Check size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <Icons.AlertCircle size={18} />
          {error}
          <button className="alert-close" onClick={() => setError(null)}>
            <Icons.X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <Icons.Check size={18} />
          {success}
        </div>
      )}

      <div className="settings-layout">
        <nav className="settings-nav">
          <button 
            className={`nav-item ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Icons.Building size={18} />
            General
          </button>
          <button 
            className={`nav-item ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <Icons.Mail size={18} />
            Contact Info
          </button>
          <button 
            className={`nav-item ${activeTab === 'branding' ? 'active' : ''}`}
            onClick={() => setActiveTab('branding')}
          >
            <Icons.Palette size={18} />
            Branding
          </button>
          <button 
            className={`nav-item ${activeTab === 'hours' ? 'active' : ''}`}
            onClick={() => setActiveTab('hours')}
          >
            <Icons.Clock size={18} />
            Business Hours
          </button>
          <button 
            className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <Icons.Settings size={18} />
            Preferences
          </button>
        </nav>

        <div className="settings-content">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="settings-panel">
              <h2>General Information</h2>
              <p className="panel-description">Basic information about your business</p>

              <div className="form-group">
                <label className="form-label">Business Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your Business Name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="A brief description of your business..."
                  rows={4}
                />
                <span className="form-hint">This may be displayed on your website and invoices</span>
              </div>

              <div className="info-box">
                <Icons.Info size={18} />
                <div>
                  <strong>Tenant ID:</strong> {settings?.id}<br />
                  <strong>Slug:</strong> {settings?.slug}<br />
                  <strong>Plan:</strong> {settings?.plan || 'starter'}
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="settings-panel">
              <h2>Contact Information</h2>
              <p className="panel-description">How customers can reach you</p>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@yourbusiness.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="form-row form-row-3">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <select
                    className="form-select"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  >
                    <option value="">Select state</option>
                    {US_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.zip_code}
                    onChange={(e) => handleInputChange('zip_code', e.target.value)}
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="settings-panel">
              <h2>Brand Colors</h2>
              <p className="panel-description">Customize the look and feel of your applications</p>

              <div className="color-pickers">
                <div className="color-picker-group">
                  <label className="form-label">Primary Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      className="color-input"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input color-text"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                  <span className="form-hint">Used for buttons, links, and accents</span>
                </div>

                <div className="color-picker-group">
                  <label className="form-label">Secondary Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      className="color-input"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input color-text"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                  <span className="form-hint">Used for hover states and secondary elements</span>
                </div>
              </div>

              <div className="color-preview">
                <h3>Preview</h3>
                <div className="preview-buttons">
                  <button 
                    className="preview-btn primary"
                    style={{ backgroundColor: formData.primary_color }}
                  >
                    Primary Button
                  </button>
                  <button 
                    className="preview-btn secondary"
                    style={{ backgroundColor: formData.secondary_color }}
                  >
                    Secondary Button
                  </button>
                  <a 
                    href="#preview" 
                    className="preview-link"
                    style={{ color: formData.primary_color }}
                    onClick={(e) => e.preventDefault()}
                  >
                    Link Text
                  </a>
                </div>
              </div>

              <div className="info-box">
                <Icons.Info size={18} />
                <div>
                  For logo and favicon uploads, visit the <strong>Branding Assets</strong> section 
                  under Site Management.
                </div>
              </div>
            </div>
          )}

          {/* Business Hours Tab */}
          {activeTab === 'hours' && (
            <div className="settings-panel">
              <h2>Business Hours</h2>
              <p className="panel-description">Set your regular operating hours</p>

              <div className="business-hours-list">
                {DAYS_OF_WEEK.map(({ key, label }) => (
                  <div key={key} className="hours-row">
                    <div className="hours-day">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={!formData.business_hours[key]?.closed}
                          onChange={(e) => handleBusinessHoursChange(key, 'closed', !e.target.checked)}
                        />
                        <span className="day-name">{label}</span>
                      </label>
                    </div>
                    
                    {formData.business_hours[key]?.closed ? (
                      <div className="hours-closed">Closed</div>
                    ) : (
                      <div className="hours-inputs">
                        <input
                          type="time"
                          className="form-input time-input"
                          value={formData.business_hours[key]?.open || '09:00'}
                          onChange={(e) => handleBusinessHoursChange(key, 'open', e.target.value)}
                        />
                        <span className="hours-separator">to</span>
                        <input
                          type="time"
                          className="form-input time-input"
                          value={formData.business_hours[key]?.close || '17:00'}
                          onChange={(e) => handleBusinessHoursChange(key, 'close', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="settings-panel">
              <h2>Business Preferences</h2>
              <p className="panel-description">Regional and financial settings</p>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select
                    className="form-select"
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select
                    className="form-select"
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                  >
                    {CURRENCIES.map(curr => (
                      <option key={curr.value} value={curr.value}>{curr.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ maxWidth: '200px' }}>
                <label className="form-label">Default Tax Rate</label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    className="form-input"
                    value={(formData.tax_rate * 100).toFixed(2)}
                    onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) / 100)}
                    step="0.01"
                    min="0"
                    max="100"
                  />
                  <span className="input-suffix">%</span>
                </div>
                <span className="form-hint">Applied to taxable items at checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BusinessSettingsView;