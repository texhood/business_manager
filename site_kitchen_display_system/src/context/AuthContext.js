import React, { createContext, useContext, useState, useEffect } from 'react';
import { getHeaders, API_URL, checkSSOSession } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('kds_token'));
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount, or try SSO cookie
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('kds_token');
      const storedUser = localStorage.getItem('kds_user');
      let authenticated = false;

      if (storedToken && storedUser) {
        try {
          const response = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include',
            headers: getHeaders(storedToken)
          });

          if (response.ok) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            authenticated = true;
          } else {
            localStorage.removeItem('kds_token');
            localStorage.removeItem('kds_user');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Token verification error:', error);
          localStorage.removeItem('kds_token');
          localStorage.removeItem('kds_user');
          setToken(null);
          setUser(null);
        }
      }

      // If no valid local token, try SSO cookie
      if (!authenticated) {
        const ssoUser = await checkSSOSession();
        if (ssoUser) {
          setUser(ssoUser);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

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

    const { token: newToken, user: userData } = data.data;

    localStorage.setItem('kds_token', newToken);
    localStorage.setItem('kds_user', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem('kds_token');
    localStorage.removeItem('kds_user');
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
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
