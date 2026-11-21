import { API_CONFIG, STORAGE_KEYS } from '../config/constants';
import Almacenamiento from './almacenamiento';

/**
 * Dirección del SERVIDOR (backend Flask) que usa la app.
 *
 * Por defecto es EXPO_PUBLIC_API_URL (archivo .env.local) o la de src/config/constants.js.
 * En la pantalla de inicio de sesión se puede cambiar ("Servidor: ... · Cambiar"): así el
 * mismo APK funciona en cualquier PC, escribiendo su IP, por ejemplo http://192.168.1.20:5000.
 * La dirección elegida se guarda en el celular y se usa también al volver a abrir la app.
 *
 * Todo lo que habla con el servidor lee API_CONFIG.BASE_URL en el momento de usarlo
 * (apiClient, WebSocket, enlaces de archivos y la detección de conexión).
 */

const POR_DEFECTO = API_CONFIG.BASE_URL;
const oyentes = new Set();

/** "192.168.1.20:5000/" → "http://192.168.1.20:5000" (sin barra final; http:// si falta). */
export function normalizarServidor(texto) {
  let url = String(texto || '').trim().replace(/\/+$/, '');
  if (url && !/^https?:\/\//i.test(url)) url = `http://${url}`;
  return url;
}

/** La dirección que se está usando ahora. */
export function servidorActual() {
  return API_CONFIG.BASE_URL;
}

function aplicar(url) {
  API_CONFIG.BASE_URL = url;
  oyentes.forEach((f) => f(url));
}

/** Avisa cuando cambia la dirección (lo usa la detección de conexión). Devuelve cómo dejar de escuchar. */
export function escucharCambioServidor(funcion) {
  oyentes.add(funcion);
  return () => oyentes.delete(funcion);
}

// Al abrir la app se lee la dirección guardada. Las peticiones esperan a que termine
// (ver apiClient.js), para no ir al servidor equivocado en el primer instante.
const carga = (async () => {
  try {
    const guardado = await Almacenamiento.leer(STORAGE_KEYS.SERVIDOR);
    if (guardado) aplicar(guardado);
  } catch {
    // Sin almacenamiento: se usa la dirección por defecto.
  }
})();

/** Promesa que termina cuando ya se sabe qué servidor usar. */
export function esperarServidor() {
  return carga;
}

/**
 * ¿Responde el backend en esa dirección? (GET / → {"status": "ok"}). Nunca lanza errores.
 */
export async function probarServidor(url, msMaximo = 6000) {
  const controlador = new AbortController();
  const reloj = setTimeout(() => controlador.abort(), msMaximo);
  try {
    const respuesta = await fetch(`${url}/`, { signal: controlador.signal });
    const datos = await respuesta.json();
    return respuesta.ok && datos?.status === 'ok';
  } catch {
    return false;
  } finally {
    clearTimeout(reloj);
  }
}

/** Guarda y empieza a usar una dirección nueva (ya normalizada). */
export async function cambiarServidor(url) {
  await Almacenamiento.guardar(STORAGE_KEYS.SERVIDOR, url);
  aplicar(url);
}

/** Vuelve a la dirección por defecto (la de .env.local o constants.js). */
export async function restablecerServidor() {
  await Almacenamiento.borrar(STORAGE_KEYS.SERVIDOR);
  aplicar(POR_DEFECTO);
}

/** La dirección por defecto (para mostrarla en la pantalla de inicio de sesión). */
export const SERVIDOR_POR_DEFECTO = POR_DEFECTO;
