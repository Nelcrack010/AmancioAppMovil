import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG, STORAGE_KEYS } from '../../config/constants';

/**
 * Cliente HTTP Axios configurado para la API REST del colegio Amancio Varona.
 * Equivalente a la instancia de Retrofit en Android.
 */
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT_MS,
  headers: API_CONFIG.HEADERS,
});

// Interceptor para inyectar automáticamente el token JWT en cada petición
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('No se pudo recuperar el token de sesión:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejo unificado de respuestas y errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Error en la comunicación con el servidor';
    return Promise.reject(new Error(errorMsg));
  }
);

export default apiClient;
