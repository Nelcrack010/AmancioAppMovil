// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Qué es: SesionContext: estado global de la sesión, disponible en toda la app con useSesion().
// Lo usan: App.jsx, BotonesEncabezado.jsx, MenuBar.jsx, MenuMas.jsx, ConexionContext.jsx, AppNavigator.jsx,
//     MenuNavigator.jsx, abrirNotificacion.js (+11 más)
//
// Para modificar:
//   Usuario que inició sesión (usuario.rol, usuario.username) y contadores de no leídos.
//   En una pantalla: const { usuario } = useSesion();
// <<< FIN GUÍA
import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { obtenerToken, registrarAlExpirarSesion } from '../services/api/apiClient';
import MensajesApi from '../services/api/mensajesApi';
import Almacenamiento from '../services/almacenamiento';
import SesionRepository from '../repositories/sesionRepository';
import MensajesRepository from '../repositories/mensajesRepository';
import {
  marcarTokenPushRegistrado, mostrarNotificacionLocal, obtenerTokenPushAsync,
} from '../services/notificacionesPushService';
import {
  conectarTiempoReal, desconectarTiempoReal, escucharTiempoReal,
} from '../services/tiempoRealService';
import { STORAGE_KEYS } from '../config/constants';
import { esperarServidor } from '../services/servidor';
import useTiempoReal from '../viewmodels/useTiempoReal';
import { CUALQUIER_PUSH, TIEMPO_REAL } from '../config/tiempoReal';

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
  // Mientras el usuario cierra sesión a mano, un 401 (por ejemplo, del propio logout con
  // un token ya vencido) no debe mostrar "Tu sesión expiró".
  const cerrandoSesion = useRef(false);
  useEffect(() => {
    registrarAlExpirarSesion(async () => {
      if (cerrandoSesion.current) return;
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
    cerrandoSesion.current = true;
    try {
      await SesionRepository.cerrarSesion({ borrarDatos: true });
    } finally {
      cerrandoSesion.current = false;
      setUsuario(null);
      setSesionVencida(false);
      setContadores(CONTADORES_VACIOS);
    }
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

  /** Pide al servidor los contadores (tras leer mensajes o avisos, y en tiempo real). */
  const refrescarContadores = useCallback(async () => {
    try {
      fijarContadores(await MensajesApi.contadores());
    } catch {
      // Sin conexión: se quedan los contadores anteriores.
    }
  }, [fijarContadores]);

  // Mientras haya sesión (y la contraseña ya no sea la inicial): pedir los contadores al
  // entrar y luego en tiempo real (cada TIEMPO_REAL.CONTADORES_MS y al llegar cualquier push).
  const sesionLista = Boolean(usuario) && !usuario.debe_cambiar_password;
  useEffect(() => {
    if (sesionLista) refrescarContadores();
  }, [sesionLista, refrescarContadores]);
  useTiempoReal(refrescarContadores, TIEMPO_REAL.CONTADORES_MS, {
    activo: sesionLista,
    tiposPush: CUALQUIER_PUSH,
  });

  // --- Tiempo real por WebSocket (src/services/tiempoRealService.js) ------------------
  // Con sesión: se abre la conexión con el token. Al cerrar sesión (o vencer), se cierra.
  // Cada notificación que llega se muestra en el celular al instante (si no la silenció).
  useEffect(() => {
    if (!sesionLista) return undefined;
    let cancelado = false;
    // Se espera a saber qué servidor usar (se puede cambiar en el login, ver servidor.js).
    Promise.all([
      obtenerToken() ? Promise.resolve(obtenerToken()) : Almacenamiento.leer(STORAGE_KEYS.AUTH_TOKEN),
      esperarServidor(),
    ])
      .then(([token]) => { if (!cancelado) conectarTiempoReal(token); })
      .catch(() => {});
    const dejarDeEscuchar = escucharTiempoReal('notificacion', mostrarNotificacionLocal);
    return () => {
      cancelado = true;
      dejarDeEscuchar();
      desconectarTiempoReal();
    };
  }, [sesionLista, usuario?.id_usuario]);

  // --- Registro del celular para recibir notificaciones push -------------------------
  // (Tocar una notificación lo maneja src/navigation/abrirNotificacion.js.)
  useEffect(() => {
    if (!sesionLista) return;
    marcarTokenPushRegistrado(false);
    obtenerTokenPushAsync()
      .then((token) => (token ? MensajesRepository.registrarTokenPush(token) : false))
      .then(marcarTokenPushRegistrado)
      .catch(() => {
        // Si falla el registro, la app funciona igual: los avisos llegan por el WebSocket.
      });
  }, [sesionLista]);

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