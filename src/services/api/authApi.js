// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: API · una función por endpoint del backend (método HTTP + URL)
// Cadena: repositories/*Repository.js → [este archivo] → apiClient.js (axios + token) → backend Flask
//
// Métodos (endpoint → archivo del backend):
//   login()  POST /usuarios/login  → auth_routes.py · login()  roles: público (sin token)
//   misPermisos()  GET /usuarios/mis-permisos  → auth_routes.py · mis_permisos()  roles: cualquiera con sesión
//   logout()  POST /usuarios/logout  → auth_routes.py · logout()  roles: cualquiera con sesión
//   cambiarPassword()  POST /perfil/auth/change-password  → perfil_routes.py · change_password()  roles:
//       cualquiera con sesión
//   verificarSalud()  GET /  → —
//
// Para modificar:
//   • Endpoint nuevo: nombre: async (id, datos) => (await apiClient.patch(`/x/${id}/accion`, datos)).data,
//   • Con filtro ?campo=: apiClient.get('/x', { params: { campo } })  (si campo es undefined no se envía).
//   • La URL y el método deben ser IGUALES a los del @bp.metodo("...") del backend (si no: 404/405).
//   • Después expórtalo en el repository: metodo: XApi.metodo (acciones) o fuente('clave', ...) (consultas).
// <<< FIN GUÍA
import apiClient from './apiClient';

/**
 * Endpoints de sesión: /usuarios y cambio de contraseña.
 * Cada función devuelve directamente el JSON de la respuesta.
 */
export const AuthApi = {
  // PISTA: POST /usuarios/login → backend: auth_routes.py · login() · roles: público (sin token)
  // PISTA: lo usa: SesionRepository.iniciarSesion
  /** POST /usuarios/login → { id_usuario, username, rol, access_token, debe_cambiar_password } */
  login: async (username, password) =>
    (await apiClient.post('/usuarios/login', { username, password })).data,

  // PISTA: GET /usuarios/mis-permisos → backend: auth_routes.py · mis_permisos() · roles: cualquiera con sesión
  /** GET /usuarios/mis-permisos → { rol, activo, permisos, debe_cambiar_password } */
  misPermisos: async () => (await apiClient.get('/usuarios/mis-permisos')).data,

  // PISTA: POST /usuarios/logout → backend: auth_routes.py · logout() · roles: cualquiera con sesión
  // PISTA: lo usa: SesionRepository.cerrarSesion
  /** POST /usuarios/logout (el token de notificaciones es opcional) */
  logout: async (tokenDispositivo) =>
    (await apiClient.post('/usuarios/logout', tokenDispositivo ? { token_dispositivo: tokenDispositivo } : {})).data,

  // PISTA: POST /perfil/auth/change-password → backend: perfil_routes.py · change_password() · roles: cualquiera
  //     con sesión
  // PISTA: lo usa: SesionRepository.cambiarPassword
  /** POST /perfil/auth/change-password (obligatorio en el primer ingreso) */
  cambiarPassword: async (actual, nueva) =>
    (await apiClient.post('/perfil/auth/change-password', {
      current_password: actual,
      new_password: nueva,
    })).data,

  // PISTA: GET / → backend: —
  /** GET / → estado del servidor (para comprobar la conexión) */
  verificarSalud: async () => (await apiClient.get('/')).data,
};

export default AuthApi;
