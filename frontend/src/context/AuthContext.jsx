import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { jwtDecode } from 'jwt-decode'; // Ensure you have installed jwt-decode

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token on initial load
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
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

  const login = async (username, password) => {
    try {
      const response = await axios.post('/auth/signin', { username, password });
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        
        // Save the whole user profile minus token
        const userProfile = {
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            roles: response.data.roles
        }
        localStorage.setItem('user', JSON.stringify(userProfile));
        setUser(userProfile);
        return { success: true };
      }
      return { success: false, message: 'No token received' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('/auth/signup', {
        username,
        email,
        password,
        role: ["user"] // By default signing up as user
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
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
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
