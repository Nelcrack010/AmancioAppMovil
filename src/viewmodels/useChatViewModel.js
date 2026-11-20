import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import CacheRepository from '../repositories/cacheRepository';
import ColaRepository, { suscribirCambiosCola } from '../repositories/colaRepository';
import MensajesRepository from '../repositories/mensajesRepository';
import { useSesion } from '../context/SesionContext';
import { fijarChatAbierto } from '../services/notificacionesPushService';
import { escucharTiempoReal } from '../services/tiempoRealService';
import useTiempoReal from './useTiempoReal';
import { TIEMPO_REAL } from '../config/tiempoReal';

/**
 * useChatViewModel: estado de una conversación EN TIEMPO REAL.
 *
 * Se abre de dos formas:
 *   - con idConversacion (desde la lista de conversaciones o una notificación);
 *   - con un contacto nuevo (desde "Nuevo mensaje"): no hay conversación hasta enviar
 *     el primer mensaje; el servidor la crea (o reutiliza la que ya existía).
 *
 * Tiempo real (ver src/config/tiempoReal.js):
 *   1. Al abrir se cargan todos los mensajes (primero los guardados en el celular).
 *   2. WEBSOCKET: el servidor envía cada mensaje nuevo ('mensaje') y el "leído" ('leido')
 *      en el mismo momento; se agregan a la pantalla sin pedir nada. No se muestra la
 *      notificación de esta conversación porque ya está en pantalla.
 *   3. Respaldo: si el WebSocket no está conectado, cada TIEMPO_REAL.CHAT_MS se piden
 *      SOLO los mensajes nuevos (?desde=<último id>).
 *   4. Al enviar, el mensaje aparece enseguida como "Enviando..." (sin esperar al servidor).
 * Los mensajes enviados sin conexión quedan en `enCola` marcados como pendientes; cuando la
 * cola los envía (al volver la red), se quitan de ahí y aparecen como mensajes normales.
 */
export function useChatViewModel({ idConversacionInicial, contacto }) {
  const { refrescarContadores } = useSesion();
  const [idConversacion, setIdConversacion] = useState(idConversacionInicial || null);
  const [datos, setDatos] = useState(null);             // { contacto, mensajes, leidos_hasta }
  const [cargando, setCargando] = useState(Boolean(idConversacionInicial));
  const [error, setError] = useState(null);
  const [enviandose, setEnviandose] = useState([]);     // mensajes que se están enviando ahora
  const [enCola, setEnCola] = useState([]);             // mensajes guardados sin conexión
  const datosRef = useRef(null);                        // última versión de `datos` (para el intervalo)
  const enColaRef = useRef([]);
  useEffect(() => { enColaRef.current = enCola; }, [enCola]);

  /** Reemplaza los datos (y los guarda en el celular para abrir el chat sin conexión). */
  const fijarDatos = useCallback((nuevos) => {
    datosRef.current = nuevos;
    setDatos(nuevos);
    if (idConversacion) CacheRepository.guardarLocal(MensajesRepository.conversacion(idConversacion), nuevos);
  }, [idConversacion]);

  /** Si hay mensajes del otro sin leer, los marca como leídos (y baja el globo del menú). */
  const marcarLeidos = useCallback(async (mensajes) => {
    if (!mensajes.some((m) => !m.mio && !m.leido)) return;
    try {
      await MensajesRepository.marcarLeida(idConversacion);
      refrescarContadores();
    } catch {
      // se volverá a intentar con el próximo mensaje
    }
  }, [idConversacion, refrescarContadores]);

  /** Carga TODA la conversación (al abrir el chat). */
  const cargarTodo = useCallback(async () => {
    if (!idConversacion) return;
    const fuente = MensajesRepository.conversacion(idConversacion);
    const local = await CacheRepository.leerLocal(fuente);
    if (local && !datosRef.current) {
      datosRef.current = local.valor;
      setDatos(local.valor);
      setCargando(false);
    }
    try {
      const delServidor = await CacheRepository.actualizar(fuente);
      // Mensajes que llegaron por WebSocket MIENTRAS se cargaba: no se pierden.
      const ultimo = delServidor.mensajes.length
        ? delServidor.mensajes[delServidor.mensajes.length - 1].id_mensaje : 0;
      const llegaronMientras = (datosRef.current?.mensajes || []).filter((m) => m.id_mensaje > ultimo);
      const nuevos = llegaronMientras.length
        ? { ...delServidor, mensajes: [...delServidor.mensajes, ...llegaronMientras] }
        : delServidor;
      datosRef.current = nuevos;
      setDatos(nuevos);
      setError(null);
      await marcarLeidos(nuevos.mensajes);
    } catch (e) {
      if (!datosRef.current) setError(e);
    } finally {
      setCargando(false);
    }
  }, [idConversacion, marcarLeidos]);

  /** Trae solo los mensajes NUEVOS y los agrega al final (lo llama el tiempo real). */
  const traerNuevos = useCallback(async () => {
    const actuales = datosRef.current;
    if (!idConversacion) return;
    if (!actuales) {
      await cargarTodo();
      return;
    }
    const ultimo = actuales.mensajes.length ? actuales.mensajes[actuales.mensajes.length - 1].id_mensaje : 0;
    const respuesta = await MensajesRepository.mensajesNuevos(idConversacion, ultimo);
    // Se compara con lo más reciente (otra consulta pudo agregar mensajes mientras tanto).
    const base = datosRef.current || actuales;
    const conocidos = new Set(base.mensajes.map((m) => m.id_mensaje));
    const llegaron = respuesta.mensajes.filter((m) => !conocidos.has(m.id_mensaje));
    if (llegaron.length === 0 && respuesta.leidos_hasta === base.leidos_hasta) return;   // nada nuevo
    fijarDatos({
      ...base,
      contacto: respuesta.contacto || base.contacto,
      mensajes: [...base.mensajes, ...llegaron],
      leidos_hasta: respuesta.leidos_hasta,
    });
    setError(null);
    await marcarLeidos(llegaron);
  }, [idConversacion, cargarTodo, fijarDatos, marcarLeidos]);

  // Al abrir (o volver) al chat: cargar todo y avisar qué chat está en pantalla.
  // (Como depende de idConversacion, cuando se crea la conversación con el primer
  // mensaje esto se vuelve a ejecutar solo y la carga.)
  useFocusEffect(useCallback(() => {
    cargarTodo();
    fijarChatAbierto(idConversacion);
    return () => fijarChatAbierto(null);
  }, [cargarTodo, idConversacion]));

  // Respaldo: si el WebSocket no está conectado, preguntar por mensajes nuevos cada pocos segundos.
  const enFoco = useIsFocused();
  const enFocoRef = useRef(enFoco);
  useEffect(() => { enFocoRef.current = enFoco; }, [enFoco]);
  useTiempoReal(traerNuevos, TIEMPO_REAL.CHAT_MS, {
    activo: enFoco && Boolean(idConversacion),
  });

  // WEBSOCKET: el servidor envía cada mensaje nuevo y el "leído" en el mismo momento.
  useEffect(() => {
    if (!idConversacion) return undefined;
    const esDeEsteChat = (evento) => Number(evento?.id_conversacion) === Number(idConversacion);

    const dejarMensajes = escucharTiempoReal('mensaje', (evento) => {
      const base = datosRef.current;
      if (!esDeEsteChat(evento) || !base) return;
      if (base.mensajes.some((m) => m.id_mensaje === evento.mensaje.id_mensaje)) return;   // ya estaba
      fijarDatos({ ...base, mensajes: [...base.mensajes, evento.mensaje] });
      // Si el chat está a la vista, el mensaje del otro queda leído enseguida.
      if (enFocoRef.current) marcarLeidos([evento.mensaje]);
    });

    const dejarLeido = escucharTiempoReal('leido', (evento) => {
      const base = datosRef.current;
      if (!esDeEsteChat(evento) || !base) return;
      fijarDatos({ ...base, leidos_hasta: evento.leidos_hasta });
    });

    return () => {
      dejarMensajes();
      dejarLeido();
    };
  }, [idConversacion, fijarDatos, marcarLeidos]);

  // MENSAJES SIN CONEXIÓN: cuando la cola cambia (se envió o el servidor rechazó algo), se
  // revisa cuáles de los mensajes pendientes de este chat siguen en la cola. Los que ya se
  // enviaron se quitan (si no, se veían dos veces: "Pendiente" y el mensaje real) y se traen
  // los mensajes reales. Si era el PRIMER mensaje a un contacto, se busca la conversación
  // que el servidor acaba de crear.
  useEffect(() => {
    if (enCola.length === 0) return undefined;
    let activo = true;
    const revisar = async () => {
      const estados = new Map((await ColaRepository.listar()).map((op) => [op.id_operacion, op.estado]));
      if (!activo) return;
      const antes = enColaRef.current;
      const ahora = antes
        .filter((m) => estados.has(m.idOperacion))
        .map((m) => ({ ...m, estado: estados.get(m.idOperacion) }));
      const cambio = ahora.length !== antes.length || ahora.some((m, i) => m.estado !== antes[i].estado);
      if (!cambio) return;
      setEnCola(ahora);
      if (ahora.length === antes.length) return;      // solo cambió el estado (rechazado)
      try {
        if (idConversacion) {
          await traerNuevos();
        } else if (contacto?.id_usuario) {
          const lista = await MensajesRepository.conversaciones().cargarDeApi();
          const nueva = lista.find((c) => c.id_contacto === contacto.id_usuario);
          if (activo && nueva) setIdConversacion(nueva.id_conversacion);
        }
      } catch {
        // sin red: se verá al volver a abrir el chat
      }
    };
    const dejarDeEscuchar = suscribirCambiosCola(revisar);
    return () => {
      activo = false;
      dejarDeEscuchar();
    };
  }, [enCola.length, idConversacion, contacto, traerNuevos]);

  /** Envía un mensaje. Devuelve true si se aceptó (enviado o guardado en la cola). */
  const enviar = useCallback(async (contenido) => {
    const texto = contenido.trim();
    if (!texto) return false;
    const clave = `${Date.now()}-${Math.random()}`;
    setEnviandose((lista) => [...lista, { clave, contenido: texto }]);   // se ve al instante
    setError(null);
    try {
      const resultado = await MensajesRepository.enviar({
        idConversacion,
        idUsuario: contacto?.id_usuario,
        contenido: texto,
        nombreContacto: datosRef.current?.contacto?.nombre || contacto?.nombre || 'contacto',
      });
      if (resultado.enviado) {
        // Si era el primer mensaje, ahora ya existe la conversación (y se carga sola).
        if (!idConversacion) setIdConversacion(resultado.respuesta.id_conversacion);
        else await traerNuevos();
      } else {
        setEnCola((cola) => [...cola, {
          contenido: texto, fecha: new Date().toISOString(), idOperacion: resultado.idOperacion, estado: 'PENDIENTE',
        }]);
      }
      return true;
    } catch (e) {
      setError(e);
      return false;
    } finally {
      setEnviandose((lista) => lista.filter((m) => m.clave !== clave));
    }
  }, [idConversacion, contacto, traerNuevos]);

  const leidosHasta = datos?.leidos_hasta || 0;
  return {
    contacto: datos?.contacto || contacto,
    // `leido` de mis mensajes: el servidor dice hasta cuál leyó el otro.
    mensajes: (datos?.mensajes || []).map((m) => (m.mio && !m.leido && m.id_mensaje <= leidosHasta
      ? { ...m, leido: true } : m)),
    enviandose,
    enCola,
    cargando,
    error,
    enviar,
  };
}

export default useChatViewModel;
