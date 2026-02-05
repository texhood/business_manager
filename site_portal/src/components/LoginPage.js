/**
 * LoginPage Component
 * Tenant-branded login page for the portal
 */

import React, { useState } from 'react';
import { authService } from '../services/api';

const LoginPage = ({ tenant, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.login(email, password);
      onLogin(user);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const tenantName = tenant?.name || 'Business Manager';
  const initial = tenantName.charAt(0).toUpperCase();

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
