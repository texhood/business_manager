/**
 * TwoFactorSettings Component
 * Setup, disable, and manage TOTP two-factor authentication
 * Consistent component used across all sites
 */

import React, { useState, useEffect } from 'react';
import { twoFactorService } from '../services/api';

const TwoFactorSettings = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Setup flow state
  const [setupData, setSetupData] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState(null);

  // Disable flow state
  const [showDisable, setShowDisable] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');

  // Regenerate recovery codes state
  const [showRegenerate, setShowRegenerate] = useState(false);
  const [regenPassword, setRegenPassword] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await twoFactorService.getStatus();
      setStatus(data);
    } catch (err) {
      setError('Failed to load 2FA status');
    } finally {
      setLoading(false);
    }
  };

  // ── Setup Flow ──

  const handleStartSetup = async () => {
    setError('');
    setActionLoading(true);
    try {
      const data = await twoFactorService.setup();
      setSetupData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start 2FA setup');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifySetup = async (e) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);
    try {
      const result = await twoFactorService.verifySetup(verifyCode);
      setRecoveryCodes(result.data.recoveryCodes);
      setSetupData(null);
      setVerifyCode('');
      setStatus({ enabled: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSetup = () => {
    setSetupData(null);
    setVerifyCode('');
    setError('');
  };

  // ── Disable Flow ──

  const handleDisable = async (e) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);
    try {
      await twoFactorService.disable(disablePassword);
      setStatus({ enabled: false });
      setShowDisable(false);
      setDisablePassword('');
      setRecoveryCodes(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Regenerate Recovery Codes ──

  const handleRegenerate = async (e) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);
    try {
      const data = await twoFactorService.regenerateRecovery(regenPassword);
      setRecoveryCodes(data.recoveryCodes);
      setShowRegenerate(false);
      setRegenPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to regenerate codes');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Styles ──

  const styles = {
    container: { padding: '20px', maxWidth: 520 },
    heading: { fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 },
    subtext: { fontSize: '0.85rem', color: '#666', marginBottom: 16 },
    card: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, background: '#fafafa' },
    statusBadge: (enabled) => ({
      display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600,
      background: enabled ? '#dcfce7' : '#fee2e2', color: enabled ? '#166534' : '#991b1b',
    }),
    qrContainer: { textAlign: 'center', margin: '16px 0' },
    secretBox: {
      fontFamily: 'monospace', fontSize: '0.85rem', background: '#f3f4f6', padding: '8px 12px',
      borderRadius: 6, textAlign: 'center', wordBreak: 'break-all', margin: '8px 0',
    },
    input: {
      width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6,
      fontSize: '1rem', boxSizing: 'border-box',
    },
    codeInput: {
      width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6,
      fontSize: '1.2rem', letterSpacing: '0.3em', textAlign: 'center', boxSizing: 'border-box',
    },
    btnPrimary: {
      padding: '8px 20px', background: 'var(--color-primary, #2563eb)', color: '#fff',
      border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
    },
    btnDanger: {
      padding: '8px 20px', background: '#dc2626', color: '#fff',
      border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
    },
    btnSecondary: {
      padding: '8px 20px', background: '#fff', color: '#374151',
      border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem',
    },
    error: { color: '#dc2626', fontSize: '0.85rem', marginBottom: 12 },
    recoveryBox: {
      fontFamily: 'monospace', fontSize: '0.9rem', background: '#fffbeb', border: '1px solid #fbbf24',
      borderRadius: 8, padding: 16, margin: '12px 0',
    },
    recoveryCode: { padding: '2px 0', fontSize: '0.95rem' },
    warning: { fontSize: '0.8rem', color: '#92400e', marginTop: 8 },
    formGroup: { marginBottom: 12 },
    label: { display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 4, color: '#374151' },
    actions: { display: 'flex', gap: 8, marginTop: 12 },
  };

  if (loading) {
    return <div style={styles.container}><p>Loading 2FA settings…</p></div>;
  }

  // ── Recovery Codes Display ──
  if (recoveryCodes) {
    return (
      <div style={styles.container}>
        <h3 style={styles.heading}>🔑 Recovery Codes</h3>
        <p style={styles.subtext}>
          Save these codes in a secure place. Each code can only be used once to sign in if you lose access to your authenticator app.
        </p>
        <div style={styles.recoveryBox}>
          {recoveryCodes.map((code, i) => (
            <div key={i} style={styles.recoveryCode}>{code}</div>
          ))}
        </div>
        <p style={styles.warning}>
          ⚠ These codes will not be shown again. If you lose them, you can regenerate new ones from your security settings.
        </p>
        <button
          style={{ ...styles.btnPrimary, marginTop: 12 }}
          onClick={() => setRecoveryCodes(null)}
        >
          I've saved my codes
        </button>
      </div>
    );
  }

  // ── Setup Flow: QR Code + Verify ──
  if (setupData) {
    return (
      <div style={styles.container}>
        <h3 style={styles.heading}>Set Up Two-Factor Authentication</h3>
        <p style={styles.subtext}>
          Scan the QR code below with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
        </p>

        <div style={styles.qrContainer}>
          <img src={setupData.qrCode} alt="TOTP QR Code" style={{ width: 200, height: 200 }} />
        </div>

        <p style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center', marginBottom: 8 }}>
          Can't scan? Enter this key manually:
        </p>
        <div style={styles.secretBox}>{setupData.secret}</div>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleVerifySetup}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="verifyCode">Enter the 6-digit code from your app</label>
            <input
              id="verifyCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              maxLength={6}
              required
              autoFocus
              style={styles.codeInput}
            />
          </div>
          <div style={styles.actions}>
            <button type="submit" style={styles.btnPrimary} disabled={actionLoading || verifyCode.length !== 6}>
              {actionLoading ? 'Verifying…' : 'Verify & Enable'}
            </button>
            <button type="button" style={styles.btnSecondary} onClick={handleCancelSetup}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Disable Confirmation ──
  if (showDisable) {
    return (
      <div style={styles.container}>
        <h3 style={styles.heading}>Disable Two-Factor Authentication</h3>
        <p style={styles.subtext}>
          Enter your password to confirm. This will remove 2FA protection from your account.
        </p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleDisable}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="disablePassword">Current Password</label>
            <input
              id="disablePassword"
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              required
              autoFocus
              style={styles.input}
            />
          </div>
          <div style={styles.actions}>
            <button type="submit" style={styles.btnDanger} disabled={actionLoading}>
              {actionLoading ? 'Disabling…' : 'Disable 2FA'}
            </button>
            <button type="button" style={styles.btnSecondary} onClick={() => { setShowDisable(false); setError(''); }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Regenerate Recovery Codes ──
  if (showRegenerate) {
    return (
      <div style={styles.container}>
        <h3 style={styles.heading}>Regenerate Recovery Codes</h3>
        <p style={styles.subtext}>
          This will invalidate your existing recovery codes and generate new ones. Enter your password to confirm.
        </p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleRegenerate}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="regenPassword">Current Password</label>
            <input
              id="regenPassword"
              type="password"
              value={regenPassword}
              onChange={(e) => setRegenPassword(e.target.value)}
              required
              autoFocus
              style={styles.input}
            />
          </div>
          <div style={styles.actions}>
            <button type="submit" style={styles.btnPrimary} disabled={actionLoading}>
              {actionLoading ? 'Generating…' : 'Generate New Codes'}
            </button>
            <button type="button" style={styles.btnSecondary} onClick={() => { setShowRegenerate(false); setError(''); }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Main Status View ──
  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Two-Factor Authentication</h3>
      <p style={styles.subtext}>
        Add an extra layer of security to your account by requiring a code from an authenticator app when you sign in.
      </p>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Status:</strong>{' '}
            <span style={styles.statusBadge(status?.enabled)}>
              {status?.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {status?.enabled && status.verifiedAt && (
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 8 }}>
            Enabled since {new Date(status.verifiedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {status?.enabled ? (
        <div style={styles.actions}>
          <button style={styles.btnSecondary} onClick={() => setShowRegenerate(true)}>
            Regenerate Recovery Codes
          </button>
          <button style={styles.btnDanger} onClick={() => setShowDisable(true)}>
            Disable 2FA
          </button>
        </div>
      ) : (
        <button style={styles.btnPrimary} onClick={handleStartSetup} disabled={actionLoading}>
          {actionLoading ? 'Setting up…' : 'Enable Two-Factor Authentication'}
        </button>
      )}
    </div>
  );
};

export default TwoFactorSettings;
