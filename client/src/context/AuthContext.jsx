import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on first render
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('crms_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get('/auth/me');
        setUser(res.data.data);
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('crms_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password, portalRole) => {
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      const { data } = res.data;
      
      // Portal Security Mismatch Check
      if (portalRole && data.role !== portalRole) {
         toast.error(`Access Denied: You belong to the ${data.role} portal, not ${portalRole}.`);
         return { success: false, error: 'Portal mismatch' };
      }

      localStorage.setItem('crms_token', data.token);
      setUser(data);
      toast.success('Session Authenticated!');
      return { success: true, role: data.role };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axiosInstance.post('/auth/register', userData);
      const { data } = res.data;
      
      localStorage.setItem('crms_token', data.token);
      setUser(data);
      toast.success('Registration successful!');
      return { success: true, role: data.role };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('crms_token');
    setUser(null);
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
