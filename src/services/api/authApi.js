import apiClient from './apiClient';

/**
 * Endpoints de sesión: /usuarios y cambio de contraseña.
 * Cada función devuelve directamente el JSON de la respuesta.
 */
export const AuthApi = {
  /** POST /usuarios/login → { id_usuario, username, rol, access_token, debe_cambiar_password } */
  login: async (username, password) =>
    (await apiClient.post('/usuarios/login', { username, password })).data,

  /** GET /usuarios/mis-permisos → { rol, activo, permisos, debe_cambiar_password } */
  misPermisos: async () => (await apiClient.get('/usuarios/mis-permisos')).data,

  /** POST /usuarios/logout (el token de notificaciones es opcional) */
  logout: async (tokenDispositivo) =>
    (await apiClient.post('/usuarios/logout', tokenDispositivo ? { token_dispositivo: tokenDispositivo } : {})).data,

  /** POST /perfil/auth/change-password (obligatorio en el primer ingreso) */
  cambiarPassword: async (actual, nueva) =>
    (await apiClient.post('/perfil/auth/change-password', {
      current_password: actual,
      new_password: nueva,
    })).data,

  /** GET / → estado del servidor (para comprobar la conexión) */
  verificarSalud: async () => (await apiClient.get('/')).data,
};

export default AuthApi;
