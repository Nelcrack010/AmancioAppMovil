import MensajesApi from '../services/api/mensajesApi';
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
};

export default MensajesRepository;
