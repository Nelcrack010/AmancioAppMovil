import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import ColaRepository, { suscribirCambiosCola } from '../repositories/colaRepository';
import { useSesion } from './SesionContext';

/**
 * ConexionContext: detecta si hay internet y lleva la cuenta de las operaciones pendientes.
 *
 *   enLinea       → true/false según NetInfo
 *   pendientes    → cuántas operaciones esperan ser enviadas
 *   conError      → cuántas rechazó el servidor (hay que revisarlas)
 *   sincronizando → true mientras se envía la cola
 *   sincronizar() → envía la cola ahora
 *
 * La cola se envía sola: al iniciar sesión y cada vez que vuelve la conexión.
 */
const ConexionContext = createContext(null);

export function ConexionProvider({ children }) {
  const { usuario } = useSesion();
  const [enLinea, setEnLinea] = useState(true);
  const [cola, setCola] = useState({ pendientes: 0, conError: 0 });
  const [sincronizando, setSincronizando] = useState(false);
  const enLineaAntes = useRef(true);   // para detectar el momento en que VUELVE la red

  const sesionLista = Boolean(usuario) && !usuario.debe_cambiar_password;

  /** Vuelve a contar las operaciones de la cola. */
  const contarCola = useCallback(async () => {
    const operaciones = await ColaRepository.listar();
    setCola({
      pendientes: operaciones.filter((o) => o.estado === 'PENDIENTE').length,
      conError: operaciones.filter((o) => o.estado === 'ERROR').length,
    });
  }, []);

  const sincronizar = useCallback(async () => {
    setSincronizando(true);
    try {
      return await ColaRepository.sincronizar();
    } finally {
      setSincronizando(false);
    }
  }, []);

  // Contar la cola cuando cambia (se agregó, envió o descartó una operación).
  useEffect(() => suscribirCambiosCola(contarCola), [contarCola]);

  // Al iniciar sesión: contar y enviar lo que quedó pendiente.
  useEffect(() => {
    if (!sesionLista) {
      setCola({ pendientes: 0, conError: 0 });
      return;
    }
    contarCola().then(sincronizar);
  }, [sesionLista, contarCola, sincronizar]);

  // Escuchar los cambios de red. Al volver la conexión, enviar la cola.
  useEffect(() => {
    const desuscribir = NetInfo.addEventListener((estado) => {
      const conectado = estado.isConnected !== false && estado.isInternetReachable !== false;
      if (!enLineaAntes.current && conectado && sesionLista) sincronizar();
      enLineaAntes.current = conectado;
      setEnLinea(conectado);
    });
    return desuscribir;
  }, [sesionLista, sincronizar]);

  const valor = useMemo(() => ({
    enLinea, sincronizando, sincronizar,
    pendientes: cola.pendientes, conError: cola.conError,
  }), [enLinea, sincronizando, sincronizar, cola]);

  return <ConexionContext.Provider value={valor}>{children}</ConexionContext.Provider>;
}

export function useConexion() {
  const contexto = useContext(ConexionContext);
  if (!contexto) throw new Error('useConexion debe usarse dentro de <ConexionProvider>');
  return contexto;
}
