import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // on mount, grab any saved token
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('userToken');
      if (stored) setToken(stored);
      setLoading(false);
    })();
  }, []);

  // call this to log in
  const login = async (newToken) => {
    await AsyncStorage.setItem('userToken', newToken);
    setToken(newToken);
  };

  // call this to log out
  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
