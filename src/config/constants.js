// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Qué es: Configuración global de la aplicación.
// Lo usan: ConexionContext.jsx, SesionContext.jsx, mensajesRepository.js, sesionRepository.js, apiClient.js,
//     archivos.js, servidor.js, tiempoRealService.js (+1 más)
//
// Para modificar:
//   Dirección del servidor (API) y otros valores fijos.
// <<< FIN GUÍA
/**
 * Configuración global de la aplicación.
 *
 * Dirección de la API:
 *   - Se puede cambiar SIN tocar el código con la variable EXPO_PUBLIC_API_URL en un
 *     archivo .env.local (no se sube a Git). Ver .env.example.
 *   - Si no está definida, se usa el servidor del equipo en Oracle Cloud.
 *   - En la app se puede cambiar desde el inicio de sesión ("Servidor: ... · Cambiar"),
 *     sin volver a compilar (ver src/services/servidor.js).
 */
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://146.181.54.237',
  TIMEOUT_MS: 15000,
  TIMEOUT_ARCHIVOS_MS: 90000,   // subir un archivo puede tardar más (datos móviles)
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

/** Claves con las que se guarda la sesión en el almacenamiento seguro del celular. */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'amancio_auth_token',
  USER_PROFILE: 'amancio_user_profile',
  PUSH_TOKEN: 'amancio_push_token',
  SERVIDOR: 'amancio_servidor',   // dirección del backend elegida en el login (ver src/services/servidor.js)
};

/** Nombre visible de la app (cabeceras, pantalla de acceso). */
export const NOMBRE_APP = 'Campus AV Móvil';
