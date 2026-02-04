/**
 * LoginPage Component
 * Authentication page for the application
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

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
