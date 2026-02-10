/**
 * LoginPage Component
 * Tenant-branded login page for the portal
 * Supports TOTP two-factor authentication
 */

import React, { useState } from 'react';
import { authService } from '../services/api';

const LoginPage = ({ tenant, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [twoFactorPending, setTwoFactorPending] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.login(email, password);

      if (result.requires2FA) {
        setTwoFactorPending(true);
        setTwoFactorToken(result.twoFactorToken);
      } else {
        onLogin(result);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.verify2FA(twoFactorToken, totpCode);
      onLogin(user);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid verification code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setTwoFactorPending(false);
    setTwoFactorToken('');
    setTotpCode('');
    setError('');
    setPassword('');
  };

  const tenantName = tenant?.name || 'Business Manager';
  const initial = tenantName.charAt(0).toUpperCase();

  // ── 2FA Verification Screen ──
  if (twoFactorPending) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <div className="logo" style={{ fontSize: '28px' }}>🔐</div>
            <h1>Two-Factor Authentication</h1>
            <p>Enter the 6-digit code from your authenticator app</p>
          </div>

          <form className="login-form" onSubmit={handleVerify2FA}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="totpCode">Verification Code</label>
              <input
                id="totpCode"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9A-Za-z-]/g, ''))}
                placeholder="123456"
                maxLength={10}
                required
                autoFocus
                style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.25rem' }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: 'var(--color-text-secondary, #666)' }}>
              You can also use a recovery code
            </p>

            <button
              type="button"
              onClick={handleBackToLogin}
              style={{
                background: 'none', border: 'none', color: 'var(--color-primary, #2563eb)',
                cursor: 'pointer', fontSize: '0.85rem', textAlign: 'center', width: '100%', marginTop: '8px',
              }}
            >
              ← Back to login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Standard Login Screen ──
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          {tenant?.logo_url ? (
            <img 
              src={tenant.logo_url} 
              alt={tenantName} 
              style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', margin: '0 auto 16px', display: 'block' }}
            />
          ) : (
            <div className="logo">{initial}</div>
          )}
          <h1>{tenantName}</h1>
          <p>Sign in to access your applications</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
