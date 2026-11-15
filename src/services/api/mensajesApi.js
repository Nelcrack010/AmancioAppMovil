import apiClient, { conIdOperacion } from './apiClient';

/** Endpoints de mensajería interna y notificaciones. */
export const MensajesApi = {
  // --- Mensajería --------------------------------------------------------------------
  /** GET /mensajes/contactos → personas a las que puedo escribir (según mi rol) */
  contactos: async () => (await apiClient.get('/mensajes/contactos')).data,

  /** GET /mensajes/conversaciones → [{ id_conversacion, contacto, ultimo_mensaje, no_leidos }] */
  conversaciones: async () => (await apiClient.get('/mensajes/conversaciones')).data,

  /** GET /mensajes/conversaciones/<id> → { contacto, mensajes: [{ contenido, mio, fecha_envio }] } */
  conversacion: async (idConversacion) =>
    (await apiClient.get(`/mensajes/conversaciones/${idConversacion}`)).data,

  /** POST /mensajes/conversaciones → { id_usuario, contenido } (primer mensaje a un contacto) */
  iniciar: async (idUsuario, contenido, idOperacion) =>
    (await apiClient.post('/mensajes/conversaciones', { id_usuario: idUsuario, contenido },
      conIdOperacion(idOperacion))).data,

  /** POST /mensajes/conversaciones/<id> → { contenido } (responder) */
  responder: async (idConversacion, contenido, idOperacion) =>
    (await apiClient.post(`/mensajes/conversaciones/${idConversacion}`, { contenido },
      conIdOperacion(idOperacion))).data,

  /** PATCH /mensajes/conversaciones/<id>/leido */
  marcarLeida: async (idConversacion) =>
    (await apiClient.patch(`/mensajes/conversaciones/${idConversacion}/leido`)).data,

  // --- Notificaciones ------------------------------------------------------------------
  /** GET /notificaciones → { no_leidas, notificaciones: [...] } */
  notificaciones: async () => (await apiClient.get('/notificaciones')).data,

  /** PATCH /notificaciones/<id>/leida */
  marcarNotificacionLeida: async (id) => (await apiClient.patch(`/notificaciones/${id}/leida`)).data,

  /** PATCH /notificaciones/leer-todas */
  marcarTodasLeidas: async () => (await apiClient.patch('/notificaciones/leer-todas')).data,

  // --- Dispositivos (Push Tokens) -------------------------------------------------------
  /** POST /dispositivos/token → { token, plataforma } */
  registrarDispositivo: async (token, plataforma) =>
    (await apiClient.post('/dispositivos/token', { token, plataforma })).data,

  /** DELETE /dispositivos/token → body: { token } */
  eliminarDispositivo: async (token) =>
    (await apiClient.delete('/dispositivos/token', { data: { token } })).data,
};

export default MensajesApi;
