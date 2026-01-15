import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('kds_token'));
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('kds_token');
      const storedUser = localStorage.getItem('kds_user');

      if (storedToken && storedUser) {
        try {
          // Verify token is still valid
          const response = await fetch('/api/v1/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token invalid, clear storage
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
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
    isAuthenticated: !!token
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
