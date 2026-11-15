import { Platform } from 'react-native';
import MensajesApi from '../services/api/mensajesApi';
import Almacenamiento from '../services/almacenamiento';
import { STORAGE_KEYS } from '../config/constants';
import { fuente } from './cacheRepository';
import ColaRepository from './colaRepository';

/** MensajesRepository: mensajería interna y notificaciones. */
export const MensajesRepository = {
  // --- Mensajería ---------------------------------------------------------------------------
  contactos: () => fuente('contactos', MensajesApi.contactos),
  conversaciones: () => fuente('conversaciones', MensajesApi.conversaciones),
  conversacion: (id) => fuente(`conversacion:${id}`, () => MensajesApi.conversacion(id)),
  marcarLeida: MensajesApi.marcarLeida,

  /**
   * Envía un mensaje (admite modo sin conexión).
   * Con idConversacion responde en ella; si no, inicia una conversación con idUsuario.
   */
  enviar: ({ idConversacion, idUsuario, contenido, nombreContacto }) =>
    ColaRepository.enviar(
      'MENSAJE',
      { id_conversacion: idConversacion || null, id_usuario: idUsuario || null, contenido },
      `Mensaje para ${nombreContacto}`,
    ),

  // --- Notificaciones -----------------------------------------------------------------------
  notificaciones: () => fuente('notificaciones', MensajesApi.notificaciones),
  marcarNotificacionLeida: MensajesApi.marcarNotificacionLeida,
  marcarTodasLeidas: MensajesApi.marcarTodasLeidas,

  // --- Dispositivos Push --------------------------------------------------------------------
  /** Registra el token push en el backend y lo persiste en almacenamiento seguro. */
  async registrarTokenPush(token) {
    if (!token) return;
    const plataforma = Platform.OS === 'ios' ? 'ios' : 'android';
    await MensajesApi.registrarDispositivo(token, plataforma);
    await Almacenamiento.guardar(STORAGE_KEYS.PUSH_TOKEN, token);
  },

  /** Obtiene el token push guardado en el almacenamiento seguro. */
  async obtenerTokenPushGuardado() {
    return Almacenamiento.leer(STORAGE_KEYS.PUSH_TOKEN);
  },

  /** Desasocia el token push en el backend y lo borra del almacenamiento seguro. */
  async eliminarTokenPush() {
    const token = await Almacenamiento.leer(STORAGE_KEYS.PUSH_TOKEN);
    if (token) {
      try {
        await MensajesApi.eliminarDispositivo(token);
      } catch {
        // Si falla por red o token inexistente, se continúa con la limpieza local
      }
      await Almacenamiento.borrar(STORAGE_KEYS.PUSH_TOKEN);
    }
  },
};

export default MensajesRepository;
