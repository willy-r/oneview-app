import { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";

import { setupInterceptors, api } from '../services/api';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try load saved data on app start
  useEffect(() => {
    AsyncStorage.getItem('authToken').then((savedToken) => {
      if (savedToken) {
        const decoded = jwtDecode(savedToken);
        setUserId(decoded.sub);
        setToken(savedToken);
      }
      setupInterceptors(logout);
      setLoading(false);
    });
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
  
      const { token } = response.data;
  
      await AsyncStorage.setItem('authToken', token);
      const decoded = jwtDecode(token);
      setUserId(decoded.sub);
      setToken(token);
      return true;
    } catch (error) {
      console.error('Erro no login:', error?.response?.data || error.message);
      return false;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    setToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
