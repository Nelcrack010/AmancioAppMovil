import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import CacheRepository from '../repositories/cacheRepository';
import MensajesRepository from '../repositories/mensajesRepository';
import { useSesion } from '../context/SesionContext';

const CADA_15_SEGUNDOS = 15000;

/**
 * useChatViewModel: estado de una conversación.
 *
 * Se abre de dos formas:
 *   - con idConversacion (desde la lista de conversaciones o una notificación);
 *   - con un contacto nuevo (desde "Nuevo mensaje"): no hay conversación hasta enviar
 *     el primer mensaje; el servidor la crea (o reutiliza la que ya existía).
 *
 * Mientras la pantalla está abierta revisa cada 15 s si llegaron mensajes nuevos.
 * Los mensajes enviados sin conexión quedan en `enCola` marcados como pendientes.
 */
export function useChatViewModel({ idConversacionInicial, contacto }) {
  const { refrescarContadores } = useSesion();
  const [idConversacion, setIdConversacion] = useState(idConversacionInicial || null);
  const [datos, setDatos] = useState(null);           // { contacto, mensajes }
  const [cargando, setCargando] = useState(Boolean(idConversacionInicial));
  const [error, setError] = useState(null);
  const [enCola, setEnCola] = useState([]);           // mensajes guardados sin conexión
  const [enviando, setEnviando] = useState(false);

  /** Carga los mensajes (primero lo guardado, luego el servidor) y los marca como leídos. */
  const cargar = useCallback(async () => {
    if (!idConversacion) return;
    const fuente = MensajesRepository.conversacion(idConversacion);
    const local = await CacheRepository.leerLocal(fuente);
    if (local) {
      setDatos((d) => d || local.valor);
      setCargando(false);
    }
    try {
      const nuevos = await CacheRepository.actualizar(fuente);
      setDatos(nuevos);
      setError(null);
      // Marcar como leídos los mensajes del otro (si hay alguno sin leer).
      if (nuevos.mensajes.some((m) => !m.mio && !m.leido)) {
        await MensajesRepository.marcarLeida(idConversacion);
        refrescarContadores();
      }
    } catch (e) {
      setError(e);
    } finally {
      setCargando(false);
    }
  }, [idConversacion, refrescarContadores]);

  // Cargar al abrir/enfocar y revisar mensajes nuevos cada 15 segundos.
  // (Como `cargar` depende de idConversacion, cuando se crea la conversación con el
  // primer mensaje esto se vuelve a ejecutar solo y la carga.)
  useFocusEffect(useCallback(() => {
    cargar();
    const intervalo = setInterval(cargar, CADA_15_SEGUNDOS);
    return () => clearInterval(intervalo);
  }, [cargar]));

  /** Envía un mensaje. Devuelve true si se aceptó (enviado o guardado en la cola). */
  const enviar = useCallback(async (contenido) => {
    const texto = contenido.trim();
    if (!texto) return false;
    setEnviando(true);
    setError(null);
    try {
      const resultado = await MensajesRepository.enviar({
        idConversacion,
        idUsuario: contacto?.id_usuario,
        contenido: texto,
        nombreContacto: datos?.contacto?.nombre || contacto?.nombre || 'contacto',
      });
      if (resultado.enviado) {
        // Si era el primer mensaje, ahora ya existe la conversación.
        if (!idConversacion) setIdConversacion(resultado.respuesta.id_conversacion);
        else await cargar();
      } else {
        setEnCola((cola) => [...cola, { contenido: texto, fecha: new Date().toISOString() }]);
      }
      return true;
    } catch (e) {
      setError(e);
      return false;
    } finally {
      setEnviando(false);
    }
  }, [idConversacion, contacto, datos, cargar]);

  return {
    contacto: datos?.contacto || contacto,
    mensajes: datos?.mensajes || [],
    enCola,
    cargando,
    error,
    enviando,
    enviar,
  };
}

export default useChatViewModel;
