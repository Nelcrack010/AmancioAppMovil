// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: general   ·   Capa: VIEWMODEL · lógica de una pantalla (estado, cargar, guardar) separada del dibujo
// Qué es: useTiempoReal: ejecuta `funcion` para mantener una pantalla al día.
// Lo usan: SesionContext.jsx, useChatViewModel.js, useConsulta.js
//
// Para modificar: lo que la pantalla muestra se lee de lo que devuelve este hook (return { ... } al final).
//   Un dato o acción nueva → agrégalo aquí y devuélvelo; luego úsalo en la pantalla.
// <<< FIN GUÍA
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { CUALQUIER_PUSH, TIEMPO_REAL } from '../config/tiempoReal';
import {
  escucharConexionTiempoReal, escucharTiempoReal, tiempoRealConectado,
} from '../services/tiempoRealService';

/**
 * useTiempoReal: ejecuta `funcion` para mantener una pantalla al día.
 *
 *     useTiempoReal(traerMensajesNuevos, TIEMPO_REAL.CHAT_MS, {
 *       activo: pantallaEnFoco,      // solo mientras la pantalla se ve
 *       tiposPush: ['MENSAJE'],      // al instante si llega una notificación de mensaje
 *     });
 *
 * Se ejecuta:
 *   - AL INSTANTE cuando llega una notificación de esos tipos, por WebSocket o por push;
 *   - cada `cadaMs` si el WebSocket NO está conectado (respaldo), o cada
 *     TIEMPO_REAL.RESPALDO_CON_WEBSOCKET_MS si sí lo está;
 *   - al volver la app a primer plano.
 * Se pausa con la app en segundo plano y nunca se ejecutan dos a la vez.
 * Con cadaMs = 0 o null no hace nada (así se puede usar siempre, sin "if").
 * Los intervalos están en src/config/tiempoReal.js.
 */
export function useTiempoReal(funcion, cadaMs, { activo = true, tiposPush = null } = {}) {
  const ultimaFuncion = useRef(funcion);
  const enCurso = useRef(false);
  const [appActiva, setAppActiva] = useState(AppState.currentState !== 'background');
  const [conWebSocket, setConWebSocket] = useState(tiempoRealConectado());

  // Siempre se usa la versión más reciente de la función (sin reiniciar el intervalo).
  useEffect(() => { ultimaFuncion.current = funcion; });

  const ejecutar = useCallback(async () => {
    if (enCurso.current) return;
    enCurso.current = true;
    try {
      await ultimaFuncion.current();
    } catch {
      // Un fallo (por ejemplo, sin red) no detiene el tiempo real: se reintenta en la próxima vuelta.
    } finally {
      enCurso.current = false;
    }
  }, []);

  const habilitado = activo && Boolean(cadaMs);
  const habilitadoRef = useRef(habilitado);
  useEffect(() => { habilitadoRef.current = habilitado; }, [habilitado]);

  // 1. App en primer plano / segundo plano. Al volver, actualizar enseguida.
  const appActivaRef = useRef(appActiva);
  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estado) => {
      const activa = estado === 'active';
      if (activa && !appActivaRef.current && habilitadoRef.current) ejecutar();
      appActivaRef.current = activa;
      setAppActiva(activa);
    });
    return () => suscripcion.remove();
  }, [ejecutar]);

  // 2. Repetir (respaldo). Con WebSocket conectado, mucho menos seguido.
  useEffect(() => escucharConexionTiempoReal(setConWebSocket), []);
  const intervalo = conWebSocket ? Math.max(cadaMs || 0, TIEMPO_REAL.RESPALDO_CON_WEBSOCKET_MS) : cadaMs;
  useEffect(() => {
    if (!habilitado || !appActiva) return undefined;
    const id = setInterval(ejecutar, intervalo);
    return () => clearInterval(id);
  }, [habilitado, appActiva, intervalo, ejecutar]);

  // 3. Notificación recibida (WebSocket o push) → actualizar al instante.
  const tipos = Array.isArray(tiposPush) ? tiposPush.join(',') : (tiposPush || '');
  useEffect(() => {
    if (!activo || !tipos) return undefined;
    const interesa = (tipo) => tipos === CUALQUIER_PUSH || tipos.split(',').includes(tipo);

    const dejarWebSocket = escucharTiempoReal('notificacion', (aviso) => {
      if (interesa(aviso?.tipo)) ejecutar();
    });
    let suscripcionPush = null;
    if (Platform.OS !== 'web') {
      try {
        suscripcionPush = Notifications.addNotificationReceivedListener((notificacion) => {
          if (interesa(notificacion?.request?.content?.data?.tipo)) ejecutar();
        });
      } catch {
        // Sin soporte de push (por ejemplo, Expo Go): queda el WebSocket.
      }
    }
    return () => {
      dejarWebSocket();
      suscripcionPush?.remove();
    };
  }, [activo, tipos, ejecutar]);

  return ejecutar;
}

export default useTiempoReal;
