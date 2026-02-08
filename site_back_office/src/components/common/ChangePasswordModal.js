/**
 * ChangePasswordModal Component
 * Self-service password change for the logged-in user
 * Uses PUT /auth/password endpoint
 * 
 * Fully self-contained with inline styles so it works
 * across all apps (Back Office, Herds, POS, KDS, etc.)
 */

import React, { useState } from 'react';

const ChangePasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from current password.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/password`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- inline styles ----------
  const styles = {
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 10000,
    },
    modal: {
      background: '#fff', borderRadius: 10, width: '100%', maxWidth: 420,
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
    },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
    },
    title: { margin: 0, fontSize: 18, fontWeight: 600, color: '#111827' },
    closeBtn: {
      background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
      color: '#6b7280', lineHeight: 1, padding: 4,
    },
    body: { padding: '20px' },
    errorBox: {
      background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
      padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 14,
    },
    formGroup: { marginBottom: 16 },
    label: {
      display: 'block', fontSize: 14, fontWeight: 500, color: '#374151',
      marginBottom: 6,
    },
    inputWrap: { position: 'relative' },
    input: {
      width: '100%', padding: '10px 40px 10px 12px', border: '1px solid #d1d5db',
      borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    },
    toggleBtn: {
      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', cursor: 'pointer', color: '#666',
      padding: 4, fontSize: 16,
    },
    hint: { color: '#888', fontSize: 12, marginTop: 4 },
    footer: {
      display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20,
    },
    btnSecondary: {
      padding: '10px 18px', borderRadius: 6, border: '1px solid #d1d5db',
      background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 14,
      fontWeight: 500,
    },
    btnPrimary: {
      padding: '10px 18px', borderRadius: 6, border: 'none',
      background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 14,
      fontWeight: 500,
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Change Password</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.body}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <p style={{ fontSize: 16, color: '#2e7d32' }}>Password changed successfully!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div style={styles.errorBox}>{error}</div>}

              <div style={styles.formGroup}>
                <label style={styles.label}>Current Password</label>
                <div style={styles.inputWrap}>
                  <input
                    style={styles.input}
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoFocus
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    style={styles.toggleBtn}
                  >
                    {showCurrent ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>New Password</label>
                <div style={styles.inputWrap}>
                  <input
                    style={styles.input}
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    style={styles.toggleBtn}
                  >
                    {showNew ? '🙈' : '👁️'}
                  </button>
                </div>
                <div style={styles.hint}>Minimum 8 characters</div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Confirm New Password</label>
                <input
                  style={styles.input}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div style={styles.footer}>
                <button type="button" style={styles.btnSecondary} onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...styles.btnPrimary,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
