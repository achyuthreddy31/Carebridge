import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('curasync_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('curasync_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('curasync_token');
      if (storedToken) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          localStorage.setItem('curasync_user', JSON.stringify(userData));
        } catch (err) {
          console.warn('Auth token expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginWithOTP = async (phone, otp) => {
    const data = await authService.verifyOTP(phone, otp);
    setToken(data.access_token);
    localStorage.setItem('curasync_token', data.access_token);
    
    // Fetch full user profile
    const profile = await authService.getCurrentUser();
    setUser(profile);
    localStorage.setItem('curasync_user', JSON.stringify(profile));
    return profile;
  };

  const registerPatient = async (regData) => {
    const data = await authService.registerPatient(regData);
    setToken(data.access_token);
    localStorage.setItem('curasync_token', data.access_token);

    const profile = await authService.getCurrentUser();
    setUser(profile);
    localStorage.setItem('curasync_user', JSON.stringify(profile));
    return profile;
  };

  const loginWithPassword = async (email, password) => {
    const data = await authService.login(email, password);
    setToken(data.access_token);
    localStorage.setItem('curasync_token', data.access_token);

    const profile = await authService.getCurrentUser();
    setUser(profile);
    localStorage.setItem('curasync_user', JSON.stringify(profile));
    return profile;
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('curasync_token');
    localStorage.removeItem('curasync_user');
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    loginWithOTP,
    registerPatient,
    loginWithPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
