import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../apiConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Synchronize companion history between MongoDB and LocalStorage
  const syncCompanionHistory = (cloudHistory, authToken) => {
    try {
      const savedLocalStr = localStorage.getItem('focus_companion_history');
      const localHistory = savedLocalStr ? JSON.parse(savedLocalStr) : {};
      const validCloud = (cloudHistory && typeof cloudHistory === 'object') ? cloudHistory : {};

      const merged = { ...validCloud };
      let hasLocalAdvantage = false;

      for (const [key, val] of Object.entries(localHistory)) {
        const numVal = Number(val) || 0;
        const cloudVal = Number(validCloud[key]) || 0;
        if (numVal > cloudVal) {
          merged[key] = numVal;
          hasLocalAdvantage = true;
        }
      }

      localStorage.setItem('focus_companion_history', JSON.stringify(merged));

      // If local storage has higher count, sync back to cloud
      if (hasLocalAdvantage && authToken) {
        fetch(`${API_URL}/pomodoro/companion-history/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ localHistory: merged })
        }).catch(e => console.warn('Sync companion history error:', e));
      }
    } catch (err) {
      console.warn('Companion history sync error:', err);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          syncCompanionHistory(userData.companionHistory, token);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Connection failed. Server might be offline.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const register = async (username, email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
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

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      syncCompanionHistory(data.user?.companionHistory, data.token);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const loginWithGoogle = async (idToken) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      syncCompanionHistory(data.user?.companionHistory, data.token);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const loginWithGoogleOAuth = async (accessToken) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/google-oauth-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accessToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google OAuth login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('g_token', accessToken);
      sessionStorage.setItem('g_token', accessToken);
      setToken(data.token);
      setUser(data.user);
      syncCompanionHistory(data.user?.companionHistory, data.token);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('g_token');
    sessionStorage.removeItem('g_token');
    localStorage.removeItem('focus_targetEndTime');
    localStorage.setItem('focus_isActive', 'false');
    localStorage.setItem('focus_isBreak', 'false');
    localStorage.removeItem('focus_companion_history');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, error, register, login, loginWithGoogle, loginWithGoogleOAuth, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};
