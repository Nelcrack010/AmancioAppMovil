import apiClient, { conIdOperacion } from './apiClient';

/** Endpoints de mensajería interna y notificaciones. */
export const MensajesApi = {
  // --- Mensajería --------------------------------------------------------------------
  /** GET /mensajes/contactos → personas a las que puedo escribir (según mi rol) */
  contactos: async () => (await apiClient.get('/mensajes/contactos')).data,

  /** GET /mensajes/conversaciones → [{ id_conversacion, contacto, ultimo_mensaje, no_leidos }] */
  conversaciones: async () => (await apiClient.get('/mensajes/conversaciones')).data,

  /**
   * GET /mensajes/conversaciones/<id>[?desde=<id_mensaje>]
   *   → { contacto, mensajes: [{ id_mensaje, contenido, mio, fecha_envio }], leidos_hasta }
   * Con `desde` solo llegan los mensajes nuevos (lo usa el chat en tiempo real).
   */
  conversacion: async (idConversacion, desde = null) =>
    (await apiClient.get(`/mensajes/conversaciones/${idConversacion}`, {
      params: desde ? { desde } : undefined,
    })).data,

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

  /** GET /notificaciones/contadores → { mensajes_no_leidos, notificaciones_no_leidas } (liviano) */
  contadores: async () => (await apiClient.get('/notificaciones/contadores')).data,

  /** PATCH /notificaciones/<id>/leida */
  marcarNotificacionLeida: async (id) => (await apiClient.patch(`/notificaciones/${id}/leida`)).data,

  /** PATCH /notificaciones/leer-todas */
  marcarTodasLeidas: async () => (await apiClient.patch('/notificaciones/leer-todas')).data,

  /**
   * GET /notificaciones/preferencias
   *   → { silenciar_todo, pausado_hasta, no_molestar: {desde, hasta} | null,
   *       tipos: [{ tipo, nombre, descripcion, activo }], opciones_pausa_horas, recibe_ahora }
   */
  preferencias: async () => (await apiClient.get('/notificaciones/preferencias')).data,

  /**
   * PUT /notificaciones/preferencias (todo opcional; lo que no se envía queda igual)
   *   { silenciar_todo, tipos_silenciados: ['CLASE'], pausar_horas: 8 (0 = quitar),
   *     no_molestar_desde: '22:00', no_molestar_hasta: '07:00' (null = sin horario) }
   */
  guardarPreferencias: async (datos) => (await apiClient.put('/notificaciones/preferencias', datos)).data,

  // --- Dispositivos (Push Tokens) -------------------------------------------------------
  /** POST /dispositivos/token → { token, plataforma } */
  registrarDispositivo: async (token, plataforma) =>
    (await apiClient.post('/dispositivos/token', { token, plataforma })).data,

  /** DELETE /dispositivos/token → body: { token } */
  eliminarDispositivo: async (token) =>
    (await apiClient.delete('/dispositivos/token', { data: { token } })).data,
};

export default MensajesApi;
