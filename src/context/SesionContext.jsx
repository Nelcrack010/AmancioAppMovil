import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { registrarAlExpirarSesion } from '../services/api/apiClient';
import PerfilApi from '../services/api/perfilApi';
import SesionRepository from '../repositories/sesionRepository';
import MensajesRepository from '../repositories/mensajesRepository';
import { obtenerTokenPushAsync } from '../services/notificacionesPushService';
import { navigate } from '../navigation/navegacionGlobal';

/**
 * SesionContext: estado global de la sesión, disponible en toda la app con useSesion().
 *
 *   usuario            → { id_usuario, username, rol, debe_cambiar_password } o null
 *   recuperando        → true mientras se lee la sesión guardada al abrir la app
 *   iniciarSesion()    → valida con la API y guarda el token
 *   cerrarSesion()     → borra token, caché y pendientes del usuario
 *   cambiarPassword()  → cambia la clave (obligatorio en el primer ingreso)
 *   contadores         → { mensajes, notificaciones } no leídos (globos de la barra de menú)
 *   refrescarContadores() / fijarContadores()
 */
const SesionContext = createContext(null);

const CONTADORES_VACIOS = { mensajes: 0, notificaciones: 0 };
const CADA_DOS_MINUTOS = 120000;

export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [recuperando, setRecuperando] = useState(true);
  const [sesionVencida, setSesionVencida] = useState(false);
  const [contadores, setContadores] = useState(CONTADORES_VACIOS);

  // Al abrir la app: recuperar la sesión guardada (si la hay).
  useEffect(() => {
    SesionRepository.recuperarSesion()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setRecuperando(false));
  }, []);

  // Si el servidor responde 401 (token vencido), se vuelve al inicio de sesión
  // SIN borrar las operaciones pendientes (se enviarán al volver a entrar).
  useEffect(() => {
    registrarAlExpirarSesion(async () => {
      await SesionRepository.cerrarSesion({ borrarDatos: false });
      setUsuario(null);
      setSesionVencida(true);
      setContadores(CONTADORES_VACIOS);
    });
  }, []);

  const iniciarSesion = useCallback(async (username, password) => {
    const nuevo = await SesionRepository.iniciarSesion(username, password);
    setSesionVencida(false);
    setUsuario(nuevo);
    return nuevo;
  }, []);

  const cerrarSesion = useCallback(async () => {
    await SesionRepository.cerrarSesion({ borrarDatos: true });
    setUsuario(null);
    setContadores(CONTADORES_VACIOS);
  }, []);

  const cambiarPassword = useCallback(async (actual, nueva) => {
    setUsuario(await SesionRepository.cambiarPassword(actual, nueva));
  }, []);

  // --- Contadores de no leídos ---------------------------------------------------------
  /** Usa los contadores que ya trae una respuesta de /inicio (sin pedir nada más). */
  const fijarContadores = useCallback((datosInicio) => {
    setContadores({
      mensajes: datosInicio?.mensajes_no_leidos ?? 0,
      notificaciones: datosInicio?.notificaciones_no_leidas ?? 0,
    });
  }, []);

  /** Pide al servidor los contadores (se llama tras leer mensajes o avisos). */
  const refrescarContadores = useCallback(async () => {
    try {
      fijarContadores(await PerfilApi.inicio());
    } catch {
      // Sin conexión: se quedan los contadores anteriores.
    }
  }, [fijarContadores]);

  // Mientras haya sesión (y la contraseña ya no sea la inicial), refrescar cada 2 minutos.
  const sesionLista = Boolean(usuario) && !usuario.debe_cambiar_password;
  useEffect(() => {
    if (!sesionLista) return undefined;
    refrescarContadores();
    const intervalo = setInterval(refrescarContadores, CADA_DOS_MINUTOS);
    return () => clearInterval(intervalo);
  }, [sesionLista, refrescarContadores]);

  // --- Registro de token push y listeners de notificaciones ----------------------------
  const procesandoRespuestaPush = useRef(false);

  useEffect(() => {
    if (!sesionLista) return undefined;

    let suscripcionRecibida = null;
    let suscripcionRespuesta = null;

    try {
      // 1. Obtener y registrar el token push en el backend
      obtenerTokenPushAsync()
        .then((token) => {
          if (token) {
            return MensajesRepository.registrarTokenPush(token);
          }
        })
        .catch(() => {
          // Fallos de registro no deben interrumpir el uso de la app
        });

      // 2. Listener cuando llega una notificación con la app en primer plano
      try {
        suscripcionRecibida = Notifications.addNotificationReceivedListener(() => {
          try {
            refrescarContadores();
          } catch {
            // No romper si falla refrescar contadores
          }
        });
      } catch {
        // Ignorar si el listener no puede agregarse
      }

      // Función auxiliar para navegar a NotificacionesView al interactuar con una notificación
      const manejarRespuestaNotificacion = (response) => {
        try {
          if (!response) return;
          const data = response.notification?.request?.content?.data || {};
          const { tipo, id_referencia } = data;
          refrescarContadores();
          navigate('Notificaciones', { tipo, id_referencia });
        } catch {
          // Si falla la navegación o los contadores, no detener la app
        }
      };

      // 3. Listener cuando el usuario toca la notificación
      try {
        suscripcionRespuesta = Notifications.addNotificationResponseReceivedListener(
          manejarRespuestaNotificacion
        );
      } catch {
        // Ignorar si el listener no puede agregarse
      }

      // 4. Si la app se abrió desde una notificación estando cerrada
      if (!procesandoRespuestaPush.current) {
        procesandoRespuestaPush.current = true;
        try {
          Notifications.getLastNotificationResponseAsync()
            .then((lastResponse) => {
              if (lastResponse) {
                manejarRespuestaNotificacion(lastResponse);
              }
            })
            .catch(() => {});
        } catch {
          // Ignorar si falla la llamada
        }
      }
    } catch {
      // Cualquier fallo en el setup de notificaciones es completamente silencioso
    }

    return () => {
      try {
        if (suscripcionRecibida) suscripcionRecibida.remove();
        if (suscripcionRespuesta) suscripcionRespuesta.remove();
      } catch {
        // Ignorar en cleanup
      }
    };
  }, [sesionLista, refrescarContadores]);

  const valor = useMemo(() => ({
    usuario, recuperando, sesionVencida, contadores,
    iniciarSesion, cerrarSesion, cambiarPassword, fijarContadores, refrescarContadores,
  }), [usuario, recuperando, sesionVencida, contadores,
    iniciarSesion, cerrarSesion, cambiarPassword, fijarContadores, refrescarContadores]);

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

/** Hook para usar la sesión desde cualquier pantalla o componente. */
export function useSesion() {
  const contexto = useContext(SesionContext);
  if (!contexto) throw new Error('useSesion debe usarse dentro de <SesionProvider>');
  return contexto;
}