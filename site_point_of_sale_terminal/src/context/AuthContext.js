import React, { createContext, useContext, useState, useEffect } from 'react';
import { getHeaders, checkSSOSession } from '../services/api';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pos_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        await validateToken();
      } else {
        // No local token — try SSO cookie
        const ssoUser = await checkSSOSession();
        if (ssoUser) {
          setUser(ssoUser);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const validateToken = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
        headers: getHeaders(token)
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        localStorage.removeItem('pos_token');
        setToken(null);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('pos_token');
      setToken(null);
    }
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Check if user has staff role
    if (!['admin', 'staff'].includes(data.data.user.role)) {
      throw new Error('Access denied. Staff access required.');
    }

    localStorage.setItem('pos_token', data.data.token);
    setToken(data.data.token);
    setUser(data.data.user);

    return data.data.user;
  };

  const logout = () => {
    localStorage.removeItem('pos_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
