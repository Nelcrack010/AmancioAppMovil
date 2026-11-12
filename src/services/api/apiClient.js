import axios from 'axios';
import { API_CONFIG } from '../../config/constants';

/**
 * Cliente HTTP (Axios) de la API del campus. Equivale a la instancia de Retrofit en Android.
 *
 * Hace tres cosas por TODAS las peticiones, para que ninguna pantalla tenga que hacerlo:
 *   1. Agrega el token JWT en la cabecera Authorization (interceptor de petición).
 *   2. Traduce los errores HTTP a mensajes comprensibles (interceptor de respuesta).
 *   3. Si el token venció (401), avisa a la sesión para volver al inicio de sesión.
 */
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT_MS,
  headers: API_CONFIG.HEADERS,
});

// --- Token de la sesión --------------------------------------------------------------
// Se guarda en memoria para no leer el almacenamiento seguro en cada petición.
// Lo establece el SesionContext al iniciar sesión o al recuperar la sesión guardada.
let tokenActual = null;
let alExpirar = null;

export function establecerToken(token) {
  tokenActual = token;
}

/** El SesionContext registra aquí qué hacer cuando el servidor dice que el token venció. */
export function registrarAlExpirarSesion(funcion) {
  alExpirar = funcion;
}

// --- Error de la API ------------------------------------------------------------------
/**
 * Error que reciben los repositorios y pantallas.
 *   - mensaje:  texto listo para mostrar al usuario
 *   - status:   código HTTP (400, 401, 403, 404, 409, 500...) o null si no hubo respuesta
 *   - esDeRed:  true si no se pudo llegar al servidor (sin internet o tiempo agotado).
 *               Las operaciones que admiten modo sin conexión se guardan como pendientes
 *               solo en este caso.
 */
export class ErrorApi extends Error {
  constructor(mensaje, status = null, esDeRed = false) {
    super(mensaje);
    this.status = status;
    this.esDeRed = esDeRed;
  }
}

/** Mensaje por defecto de cada código HTTP (si la API no envía "detail"). */
const MENSAJES_HTTP = {
  400: 'Los datos enviados no son válidos.',
  401: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No se encontró lo que buscabas.',
  409: 'La operación entra en conflicto con datos existentes.',
  500: 'Error en el servidor. Intenta más tarde.',
  503: 'El servidor no está disponible en este momento.',
};

// --- 1. Interceptor de petición: agrega el JWT ----------------------------------------
apiClient.interceptors.request.use((config) => {
  if (tokenActual) {
    config.headers.Authorization = `Bearer ${tokenActual}`;
  }
  return config;
});

// --- 2 y 3. Interceptor de respuesta: traduce los errores --------------------------------
apiClient.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    // Sin respuesta del servidor: no hay internet, el servidor está apagado o tardó demasiado.
    if (!error.response) {
      const mensaje = error.code === 'ECONNABORTED'
        ? 'El servidor tardó demasiado en responder.'
        : 'No hay conexión con el servidor.';
      return Promise.reject(new ErrorApi(mensaje, null, true));
    }

    const { status, data } = error.response;
    // La API siempre responde los errores como { "detail": "mensaje" }.
    const detalle = typeof data?.detail === 'string' ? data.detail : null;
    const mensaje = detalle || MENSAJES_HTTP[status] || MENSAJES_HTTP[500];

    // 401 en una petición que llevaba token = el token venció o es inválido.
    // (En el login el 401 significa "credenciales inválidas" y no se cierra nada.)
    const llevabaToken = Boolean(error.config?.headers?.Authorization);
    if (status === 401 && llevabaToken && alExpirar) {
      alExpirar();
    }

    return Promise.reject(new ErrorApi(mensaje, status, false));
  }
);

/** Cabecera para las operaciones que admiten modo sin conexión (ver utils/idOperacion.js). */
export function conIdOperacion(idOperacion) {
  return idOperacion ? { headers: { 'X-Id-Operacion': idOperacion } } : {};
}

export default apiClient;
