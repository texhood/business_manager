/**
 * TwoFactorSettings Component - Kitchen Display System
 * Setup, disable, and manage TOTP two-factor authentication
 */

import React, { useState, useEffect } from 'react';
import { twoFactorService } from '../services/api';

const TwoFactorSettings = ({ onClose }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [setupData, setSetupData] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState(null);

  const [showDisable, setShowDisable] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');

  const [showRegenerate, setShowRegenerate] = useState(false);
  const [regenPassword, setRegenPassword] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadStatus(); }, []);

  const loadStatus = async () => {
    try { const data = await twoFactorService.getStatus(); setStatus(data); }
    catch (err) { setError('Failed to load 2FA status'); }
    finally { setLoading(false); }
  };

  const handleStartSetup = async () => {
    setError(''); setActionLoading(true);
    try { const data = await twoFactorService.setup(); setSetupData(data); }
    catch (err) { setError(err.response?.data?.message || 'Failed to start 2FA setup'); }
    finally { setActionLoading(false); }
  };

  const handleVerifySetup = async (e) => {
    e.preventDefault(); setError(''); setActionLoading(true);
    try {
      const result = await twoFactorService.verifySetup(verifyCode);
      setRecoveryCodes(result.data.recoveryCodes);
      setSetupData(null); setVerifyCode(''); setStatus({ enabled: true });
    } catch (err) { setError(err.response?.data?.message || 'Invalid code. Please try again.'); }
    finally { setActionLoading(false); }
  };

  const handleCancelSetup = () => { setSetupData(null); setVerifyCode(''); setError(''); };

  const handleDisable = async (e) => {
    e.preventDefault(); setError(''); setActionLoading(true);
    try {
      await twoFactorService.disable(disablePassword);
      setStatus({ enabled: false }); setShowDisable(false); setDisablePassword(''); setRecoveryCodes(null);
    } catch (err) { setError(err.response?.data?.message || 'Failed to disable 2FA'); }
    finally { setActionLoading(false); }
  };

  const handleRegenerate = async (e) => {
    e.preventDefault(); setError(''); setActionLoading(true);
    try {
      const data = await twoFactorService.regenerateRecovery(regenPassword);
      setRecoveryCodes(data.recoveryCodes); setShowRegenerate(false); setRegenPassword('');
    } catch (err) { setError(err.response?.data?.message || 'Failed to regenerate codes'); }
    finally { setActionLoading(false); }
  };

  const s = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: '#fff', borderRadius: 12, padding: 24, maxWidth: 480, width: '90%', maxHeight: '85vh', overflow: 'auto', color: '#1f2937' },
    heading: { fontSize: '1.1rem', fontWeight: 600, marginBottom: 4, color: '#1f2937' },
    subtext: { fontSize: '0.85rem', color: '#666', marginBottom: 16 },
    card: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, background: '#fafafa' },
    statusBadge: (enabled) => ({
      display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600,
      background: enabled ? '#dcfce7' : '#fee2e2', color: enabled ? '#166534' : '#991b1b',
    }),
    qrContainer: { textAlign: 'center', margin: '16px 0' },
    secretBox: { fontFamily: 'monospace', fontSize: '0.85rem', background: '#f3f4f6', padding: '8px 12px', borderRadius: 6, textAlign: 'center', wordBreak: 'break-all', margin: '8px 0' },
    input: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '1rem', boxSizing: 'border-box' },
    codeInput: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '1.2rem', letterSpacing: '0.3em', textAlign: 'center', boxSizing: 'border-box' },
    btnPrimary: { padding: '8px 20px', background: 'var(--brand-color, #2563eb)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 },
    btnDanger: { padding: '8px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 },
    btnSecondary: { padding: '8px 20px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem' },
    error: { color: '#dc2626', fontSize: '0.85rem', marginBottom: 12 },
    recoveryBox: { fontFamily: 'monospace', fontSize: '0.9rem', background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: 8, padding: 16, margin: '12px 0' },
    recoveryCode: { padding: '2px 0', fontSize: '0.95rem' },
    warning: { fontSize: '0.8rem', color: '#92400e', marginTop: 8 },
    formGroup: { marginBottom: 12 },
    label: { display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 4, color: '#374151' },
    actions: { display: 'flex', gap: 8, marginTop: 12 },
    closeRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: 8 },
    closeBtn: { background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#6b7280', padding: 0, lineHeight: 1 },
  };

  const renderContent = () => {
    if (loading) return <p>Loading 2FA settings…</p>;

    if (recoveryCodes) {
      return (
        <>
          <h3 style={s.heading}>🔑 Recovery Codes</h3>
          <p style={s.subtext}>Save these codes in a secure place. Each code can only be used once.</p>
          <div style={s.recoveryBox}>
            {recoveryCodes.map((code, i) => <div key={i} style={s.recoveryCode}>{code}</div>)}
          </div>
          <p style={s.warning}>⚠ These codes will not be shown again.</p>
          <button style={{ ...s.btnPrimary, marginTop: 12 }} onClick={() => setRecoveryCodes(null)}>I've saved my codes</button>
        </>
      );
    }

    if (setupData) {
      return (
        <>
          <h3 style={s.heading}>Set Up Two-Factor Authentication</h3>
          <p style={s.subtext}>Scan the QR code with your authenticator app</p>
          <div style={s.qrContainer}><img src={setupData.qrCode} alt="TOTP QR Code" style={{ width: 200, height: 200 }} /></div>
          <p style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center', marginBottom: 8 }}>Can't scan? Enter this key manually:</p>
          <div style={s.secretBox}>{setupData.secret}</div>
          {error && <p style={s.error}>{error}</p>}
          <form onSubmit={handleVerifySetup}>
            <div style={s.formGroup}>
              <label style={s.label}>Enter the 6-digit code from your app</label>
              <input type="text" inputMode="numeric" autoComplete="one-time-code" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))} placeholder="123456" maxLength={6} required autoFocus style={s.codeInput} />
            </div>
            <div style={s.actions}>
              <button type="submit" style={s.btnPrimary} disabled={actionLoading || verifyCode.length !== 6}>{actionLoading ? 'Verifying…' : 'Verify & Enable'}</button>
              <button type="button" style={s.btnSecondary} onClick={handleCancelSetup}>Cancel</button>
            </div>
          </form>
        </>
      );
    }

    if (showDisable) {
      return (
        <>
          <h3 style={s.heading}>Disable Two-Factor Authentication</h3>
          <p style={s.subtext}>Enter your password to confirm.</p>
          {error && <p style={s.error}>{error}</p>}
          <form onSubmit={handleDisable}>
            <div style={s.formGroup}>
              <label style={s.label}>Current Password</label>
              <input type="password" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} required autoFocus style={s.input} />
            </div>
            <div style={s.actions}>
              <button type="submit" style={s.btnDanger} disabled={actionLoading}>{actionLoading ? 'Disabling…' : 'Disable 2FA'}</button>
              <button type="button" style={s.btnSecondary} onClick={() => { setShowDisable(false); setError(''); }}>Cancel</button>
            </div>
          </form>
        </>
      );
    }

    if (showRegenerate) {
      return (
        <>
          <h3 style={s.heading}>Regenerate Recovery Codes</h3>
          <p style={s.subtext}>This will invalidate existing codes. Enter your password to confirm.</p>
          {error && <p style={s.error}>{error}</p>}
          <form onSubmit={handleRegenerate}>
            <div style={s.formGroup}>
              <label style={s.label}>Current Password</label>
              <input type="password" value={regenPassword} onChange={(e) => setRegenPassword(e.target.value)} required autoFocus style={s.input} />
            </div>
            <div style={s.actions}>
              <button type="submit" style={s.btnPrimary} disabled={actionLoading}>{actionLoading ? 'Generating…' : 'Generate New Codes'}</button>
              <button type="button" style={s.btnSecondary} onClick={() => { setShowRegenerate(false); setError(''); }}>Cancel</button>
            </div>
          </form>
        </>
      );
    }

    // Main status view
    return (
      <>
        <h3 style={s.heading}>Two-Factor Authentication</h3>
        <p style={s.subtext}>Add an extra layer of security to your account.</p>
        {error && <p style={s.error}>{error}</p>}
        <div style={s.card}>
          <div><strong>Status:</strong>{' '}<span style={s.statusBadge(status?.enabled)}>{status?.enabled ? 'Enabled' : 'Disabled'}</span></div>
          {status?.enabled && status.verifiedAt && (
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 8 }}>Enabled since {new Date(status.verifiedAt).toLocaleDateString()}</p>
          )}
        </div>
        {status?.enabled ? (
          <div style={s.actions}>
            <button style={s.btnSecondary} onClick={() => setShowRegenerate(true)}>Regenerate Recovery Codes</button>
            <button style={s.btnDanger} onClick={() => setShowDisable(true)}>Disable 2FA</button>
          </div>
        ) : (
          <button style={s.btnPrimary} onClick={handleStartSetup} disabled={actionLoading}>{actionLoading ? 'Setting up…' : 'Enable Two-Factor Authentication'}</button>
        )}
      </>
    );
  };

  return (
    <div style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.modal}>
        <div style={s.closeRow}>
          <button style={s.closeBtn} onClick={onClose} title="Close">✕</button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default TwoFactorSettings;
