/**
 * Login Page Component
 */

import React, { useState } from 'react';
import { Icons } from '../common/Icons';
import { authService } from '../../services/api';

const LoginPage = ({ onLogin }) => {
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
      
      // Check if user has staff/admin/super_admin role
      if (!['admin', 'staff', 'super_admin'].includes(user.role)) {
        authService.logout();
        setError('Access denied. Staff or admin role required.');
        setLoading(false);
        return;
      }
      
      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <h1>🐄 Herds, Flocks & Pastures</h1>
          <p>Hood Family Farms Livestock Management</p>
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
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
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
