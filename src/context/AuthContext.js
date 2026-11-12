import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import ApiService from '../services/api/apiService';
import { STORAGE_KEYS } from '../config/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restaurar sesión al abrir la app
    const restoreSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        const storedUser = await SecureStore.getItemAsync(STORAGE_KEYS.USER_PROFILE);

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (e) {
        console.warn('Error al restaurar sesión previa:', e);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await ApiService.login(username, password);
      // El backend devuelve { access_token, user, token, etc. }
      const receivedToken = response.access_token || response.token || 'session_token';
      const receivedUser = response.usuario || response.user || {
        nombre: username,
        codigo: username,
        grado: '3ro A · Secundaria',
        iniciales: 'LR',
      };

      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, receivedToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_PROFILE, JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Credenciales inválidas o servidor no disponible',
      };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_PROFILE);
    } catch (e) {
      console.warn('Error al cerrar sesión:', e);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        user,
        token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
