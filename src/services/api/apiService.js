import apiClient from './apiClient';

/**
 * ApiService: Define todos los endpoints de la API REST.
 * Equivalente a la interfaz de Retrofit en Android.
 */
export const ApiService = {
  // Comprobación de salud / estado del servidor
  verificarSalud: async () => {
    const response = await apiClient.get('/');
    return response.data;
  },

  // Autenticación
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },

  // Perfil del usuario autenticado
  obtenerPerfil: async () => {
    const response = await apiClient.get('/perfil');
    return response.data;
  },

  // Panel de inicio por rol
  obtenerInicio: async () => {
    const response = await apiClient.get('/inicio');
    return response.data;
  },

  // Cursos académicos
  obtenerCursos: async () => {
    const response = await apiClient.get('/cursos');
    return response.data;
  },

  // Horario semanal
  obtenerHorario: async () => {
    const response = await apiClient.get('/horario');
    return response.data;
  },

  // Notificaciones
  obtenerNotificaciones: async () => {
    const response = await apiClient.get('/notificaciones');
    return response.data;
  },

  // Registro de token para notificaciones push Expo
  registrarTokenPush: async (tokenPush, dispositivo) => {
    const response = await apiClient.post('/dispositivos/token', {
      token: tokenPush,
      dispositivo,
    });
    return response.data;
  },
};

export default ApiService;
