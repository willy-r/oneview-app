import { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { setupInterceptors, api } from '../services/api';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved token on app start
  useEffect(() => {
    AsyncStorage.getItem('authToken').then((savedToken) => {
      if (savedToken) {
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
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
