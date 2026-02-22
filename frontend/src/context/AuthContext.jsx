import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const loginRequest = async (endpoint, username, password) => {
    try {
      const response = await axios.post(endpoint, { username, password });
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);

        const userProfile = {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          roles: response.data.roles,
        };
        localStorage.setItem('user', JSON.stringify(userProfile));
        setUser(userProfile);
        return { success: true };
      }
      return { success: false, message: 'No token received' };
    } catch (error) {
      if (!error.response) {
        return {
          success: false,
          message: 'Cannot connect to backend server. Please ensure backend is running on port 8080.',
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const login = async (username, password) => {
    return loginRequest('/auth/signin', username, password);
  };

  const adminLogin = async (username, password) => {
    return loginRequest('/auth/admin-signin', username, password);
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('/auth/signup', {
        username,
        email,
        password,
      });
      return {
        success: true,
        message: response.data.message,
        requiresEmailVerification: !!response.data.requiresEmailVerification,
        verificationToken: response.data.verificationToken || null,
      };
    } catch (error) {
      if (!error.response) {
        return {
          success: false,
          message: 'Cannot connect to backend server. Please ensure backend is running on port 8080.',
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    adminLogin,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
