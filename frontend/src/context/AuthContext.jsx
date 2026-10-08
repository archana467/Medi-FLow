import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, loginUser, registerUser, logoutUser } from '../services/auth.service';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await getCurrentUser();
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data.user);
          } else {
            localStorage.removeItem('accessToken');
          }
        } catch {
          localStorage.removeItem('accessToken');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await loginUser({ email, password });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        setCurrentUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message || data.errors?.[0] || 'Login failed' };
    } catch (err) {
      return { success: false, message: 'Server error or invalid response.' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await registerUser(userData);
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        setCurrentUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message || data.errors?.[0] || 'Registration failed' };
    } catch (err) {
      return { success: false, message: 'Server error or invalid response.' };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      // best-effort
    } finally {
      localStorage.removeItem('accessToken');
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
