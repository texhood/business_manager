/**
 * Login Component - Kitchen Display System
 * Standardized login with TOTP two-factor authentication
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const LogInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);

const LoaderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const Login = () => {
  const { login, verify2FA, twoFactorPending, cancelTwoFactor } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [totpCode, setTotpCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verify2FA(totpCode);
    } catch (err) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    cancelTwoFactor();
    setTotpCode('');
    setError('');
    setPassword('');
  };

  // ── 2FA Verification Screen ──
  if (twoFactorPending) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-logo">
            <h1>🔐 Verification Required</h1>
            <p>Enter the 6-digit code from your authenticator app</p>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircleIcon />
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleVerify2FA}>
            <div className="form-group">
              <label>Verification Code</label>
              <input
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

            <p style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', margin: '0 0 12px' }}>
              You can also use a recovery code
            </p>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <LoaderIcon />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              style={{
                background: 'none', border: 'none', color: 'var(--brand-color, #2563eb)',
                cursor: 'pointer', fontSize: '0.85rem', textAlign: 'center', width: '100%', marginTop: '12px',
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
      <div className="login-container">
        <div className="login-logo">
          <h1>🍳 Kitchen Display</h1>
          <p>Kitchen Display System</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircleIcon />
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <LoaderIcon />
                Signing in...
              </>
            ) : (
              <>
                <LogInIcon />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
