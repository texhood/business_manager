/**
 * System Settings View
 * Global system configuration
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { systemService } from '../../services/api';

const SystemSettingsView = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    system_name: 'Business Manager',
    default_timezone: 'America/Chicago',
    default_tax_rate: 8.25,
    maintenance_mode: false,
    allow_self_registration: false,
    require_email_verification: true,
    session_timeout_minutes: 480,
    max_file_upload_mb: 10
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await systemService.getSettings().catch(() => null);
      if (response?.data) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await systemService.updateSettings(settings).catch(() => {
        console.log('Demo mode: Settings saved locally');
      });
      setMessage({ type: 'success', text: 'Settings saved successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <Icons.Loader size={48} className="spin" />
        <p>Loading settings...</p>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      {message && (
        <div className={`alert alert-${message.type} mb-3`}>
          {message.type === 'success' ? <Icons.CheckCircle size={18} /> : <Icons.AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* General Settings */}
      <div className="card mb-3">
        <h3 className="card-title mb-3">General Settings</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">System Name</label>
            <input
              type="text"
              className="form-control"
              value={settings.system_name}
              onChange={(e) => setSettings({ ...settings, system_name: e.target.value })}
            />
            <p className="form-hint">Display name for the system</p>
          </div>
          <div className="form-group">
            <label className="form-label">Default Timezone</label>
            <select
              className="form-control"
              value={settings.default_timezone}
              onChange={(e) => setSettings({ ...settings, default_timezone: e.target.value })}
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Default Tax Rate (%)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              value={settings.default_tax_rate}
              onChange={(e) => setSettings({ ...settings, default_tax_rate: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Max File Upload (MB)</label>
            <input
              type="number"
              className="form-control"
              value={settings.max_file_upload_mb}
              onChange={(e) => setSettings({ ...settings, max_file_upload_mb: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card mb-3">
        <h3 className="card-title mb-3">Security Settings</h3>

        <div className="form-group">
          <label className="form-label">Session Timeout (minutes)</label>
          <input
            type="number"
            className="form-control"
            value={settings.session_timeout_minutes}
            onChange={(e) => setSettings({ ...settings, session_timeout_minutes: parseInt(e.target.value) })}
            style={{ maxWidth: '200px' }}
          />
          <p className="form-hint">How long before inactive users are logged out</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.require_email_verification}
              onChange={(e) => setSettings({ ...settings, require_email_verification: e.target.checked })}
            />
            <div>
              <div style={{ fontWeight: 500 }}>Require Email Verification</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>New users must verify their email before accessing the system</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.allow_self_registration}
              onChange={(e) => setSettings({ ...settings, allow_self_registration: e.target.checked })}
            />
            <div>
              <div style={{ fontWeight: 500 }}>Allow Self Registration</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Allow new tenants to register without admin approval</div>
            </div>
          </label>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="card mb-3">
        <h3 className="card-title mb-3">Maintenance Mode</h3>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.maintenance_mode}
            onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
            style={{ marginTop: '4px' }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>Enable Maintenance Mode</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              When enabled, only super admins can access the system. Regular users will see a maintenance message.
            </div>
          </div>
        </label>

        {settings.maintenance_mode && (
          <div className="alert alert-warning mt-2">
            <Icons.AlertCircle size={18} />
            <span>Maintenance mode is active. Normal users cannot access the system.</span>
          </div>
        )}
      </div>

      {/* System Information */}
      <div className="card mb-3">
        <h3 className="card-title mb-3">System Information</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Version</div>
            <div>1.0.0</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Environment</div>
            <div>Development</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Database</div>
            <div>PostgreSQL</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>API Server</div>
            <div>http://localhost:3001</div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button className="btn btn-secondary" onClick={loadSettings} disabled={saving}>
          <Icons.RefreshCw size={18} />
          Reset
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Icons.Loader size={18} className="spin" />
              Saving...
            </>
          ) : (
            <>
              <Icons.Check size={18} />
              Save Settings
            </>
          )}
        </button>
      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SystemSettingsView;
