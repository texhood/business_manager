/**
 * LoginPage Component
 * Authentication page for the application
 * Supports TOTP two-factor authentication
 */

import React, { useState } from 'react';
import { authService } from '../../services/api';
import { Icons } from '../common/Icons';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.response?.data?.message || 'Invalid email or password');
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
      setError(err.response?.data?.message || 'Invalid verification code.');
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
              <Icons.AlertCircle />
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
                  <Icons.Loader className="animate-spin" />
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
          <h1>🌱 Hood Family Farms</h1>
          <p>Business Manager</p>
        </div>
        
        {error && (
          <div className="login-error">
            <Icons.AlertCircle />
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
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
                {showPassword ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <Icons.Loader className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Icons.LogIn />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
