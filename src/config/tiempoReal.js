/**
 * Tiempo real: mensajes, avisos y globos de no leídos al instante.
 *
 * Cómo funciona (de lo más rápido a lo de respaldo):
 *   1. WEBSOCKET (src/services/tiempoRealService.js): con la app abierta hay una conexión
 *      permanente con el backend. Cuando llega un mensaje o una notificación, el servidor
 *      lo envía en ese mismo momento y la pantalla se actualiza sin preguntar nada.
 *      Funciona con el backend local (python run.py): no necesita internet.
 *   2. RESPALDO: si el WebSocket no está conectado (por ejemplo, el servidor no lo
 *      tiene), cada pantalla pregunta cada cierto tiempo (los valores *_MS de abajo).
 *      Con el WebSocket conectado, igual pregunta, pero muy de vez en cuando
 *      (RESPALDO_CON_WEBSOCKET_MS), por si se perdió algún evento.
 *   3. Con la app cerrada, los avisos llegan como notificación push (development build).
 *
 * Todo se pausa con la app en segundo plano y se actualiza al volver.
 */
export const TIEMPO_REAL = {
  CHAT_MS: 2500,             // conversación abierta: mensajes nuevos y "leído"
  CONVERSACIONES_MS: 5000,   // lista de conversaciones (último mensaje y no leídos)
  AVISOS_MS: 10000,          // lista de avisos (notificaciones)
  CONTADORES_MS: 15000,      // globos de no leídos de la barra de menú
  RESPALDO_CON_WEBSOCKET_MS: 30000,   // con WebSocket conectado, solo una revisión de seguridad
};

/** Usar en `tiposPush` para reaccionar a CUALQUIER notificación (push o WebSocket). */
export const CUALQUIER_PUSH = '*';
