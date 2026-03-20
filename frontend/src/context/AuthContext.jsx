import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (responseUser = {}) => {
    const roles = Array.isArray(responseUser.roles)
      ? responseUser.roles.map((role) => role?.name).filter(Boolean)
      : [];

    return {
      id: responseUser.id,
      name: responseUser.name,
      email: responseUser.email,
      image: responseUser.image,
      roles,
    };
  };

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

  const loginRequest = async (email, password) => {
    try {
      const response = await axios.post('/v1/auth/login', { email, password });
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);

        const userProfile = normalizeUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(userProfile));
        setUser(userProfile);
        return { success: true, user: userProfile };
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

  const login = async (email, password) => {
    return loginRequest(email, password);
  };

  const adminLogin = async (email, password) => {
    const result = await loginRequest(email, password);
    if (!result.success) {
      return result;
    }

    const isAdmin = result.user?.roles?.includes('ROLE_ADMIN');
    if (!isAdmin) {
      logout();
      return {
        success: false,
        message: 'Admin access is required for this page.',
      };
    }

    return result;
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('/v1/auth/register', {
        name: username,
        email,
        password,
      });
      return {
        success: true,
        message: response.data?.message || 'Registration successful',
        requiresEmailVerification: false,
        verificationToken: null,
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
