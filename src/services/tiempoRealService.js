import { io } from 'socket.io-client';
import { API_CONFIG } from '../config/constants';

/**
 * Conexión en TIEMPO REAL con el servidor (WebSocket con Socket.IO).
 *
 * Al iniciar sesión, la app abre UNA conexión con el backend (la misma dirección de la
 * API) y envía su token. El servidor le manda eventos en cuanto algo pasa:
 *
 *     'mensaje'       { id_conversacion, mensaje: { id_mensaje, contenido, mio, fecha_envio, ... } }
 *     'leido'         { id_conversacion, leidos_hasta }   el otro leyó mis mensajes
 *     'notificacion'  { id_notificacion, tipo, titulo, mensaje, id_referencia, mostrar, push_enviado }
 *
 * Uso desde cualquier parte de la app:
 *
 *     const dejarDeEscuchar = escucharTiempoReal('mensaje', (datos) => { ... });
 *     // ... al salir de la pantalla:
 *     dejarDeEscuchar();
 *
 * Si el WebSocket no se puede conectar (servidor sin WebSocket, sin red...), la app sigue
 * funcionando: las pantallas preguntan cada pocos segundos (ver src/config/tiempoReal.js).
 * La conexión se reintenta sola.
 */

let socket = null;
let conectado = false;
const oyentesEventos = new Map();     // 'mensaje' → Set de funciones
const oyentesEstado = new Set();      // funciones que quieren saber si se conectó o no

function cambiarEstado(nuevo) {
  if (conectado === nuevo) return;
  conectado = nuevo;
  oyentesEstado.forEach((f) => f(nuevo));
}

/** Abre la conexión con el token de la sesión (si ya había una, la reemplaza). */
export function conectarTiempoReal(token) {
  desconectarTiempoReal();
  if (!token) return;
  socket = io(API_CONFIG.BASE_URL, {
    transports: ['websocket'],     // en el celular, WebSocket directo (sin "long polling")
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 8000,
  });
  socket.on('connect', () => cambiarEstado(true));
  socket.on('disconnect', () => cambiarEstado(false));
  socket.on('connect_error', () => cambiarEstado(false));
  // Cualquier evento del servidor se reparte a quienes lo escuchan.
  socket.onAny((evento, datos) => {
    oyentesEventos.get(evento)?.forEach((f) => {
      try {
        f(datos);
      } catch {
        // un error en una pantalla no debe afectar a las demás
      }
    });
  });
}

/** Cierra la conexión (al cerrar sesión). */
export function desconectarTiempoReal() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  cambiarEstado(false);
}

/** Escucha un evento del servidor. Devuelve la función para dejar de escucharlo. */
export function escucharTiempoReal(evento, funcion) {
  if (!oyentesEventos.has(evento)) oyentesEventos.set(evento, new Set());
  oyentesEventos.get(evento).add(funcion);
  return () => oyentesEventos.get(evento)?.delete(funcion);
}

/** ¿Está conectado el WebSocket ahora? */
export function tiempoRealConectado() {
  return conectado;
}

/** Avisa cada vez que el WebSocket se conecta o se desconecta. Devuelve cómo dejar de escuchar. */
export function escucharConexionTiempoReal(funcion) {
  oyentesEstado.add(funcion);
  return () => oyentesEstado.delete(funcion);
}
