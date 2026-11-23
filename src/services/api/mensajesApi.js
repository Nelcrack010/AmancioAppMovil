// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: API · una función por endpoint del backend (método HTTP + URL)
// Cadena: repositories/*Repository.js → [este archivo] → apiClient.js (axios + token) → backend Flask
//
// Métodos (endpoint → archivo del backend):
//   contactos()  GET /mensajes/contactos  → mensaje_routes.py · contactos()  roles: cualquiera con sesión
//   conversaciones()  GET /mensajes/conversaciones  → mensaje_routes.py · conversaciones()  roles: cualquiera
//       con sesión
//   conversacion()  GET /mensajes/conversaciones/${idConversacion}  → mensaje_routes.py · ver()  roles:
//       cualquiera con sesión
//   iniciar()  POST /mensajes/conversaciones  → mensaje_routes.py · iniciar()  roles: cualquiera con sesión
//   responder()  POST /mensajes/conversaciones/${idConversacion}  → mensaje_routes.py · enviar()  roles:
//       cualquiera con sesión
//   marcarLeida()  PATCH /mensajes/conversaciones/${idConversacion}/leido  → mensaje_routes.py · marcar_leidos()
//       roles: cualquiera con sesión
//   notificaciones()  GET /notificaciones  → notificacion_routes.py · mis_notificaciones()  roles: cualquiera
//       con sesión
//   contadores()  GET /notificaciones/contadores  → notificacion_routes.py · contadores()  roles: cualquiera con
//       sesión
//   marcarNotificacionLeida()  PATCH /notificaciones/${id}/leida  → notificacion_routes.py · marcar_leida()
//       roles: cualquiera con sesión
//   marcarTodasLeidas()  PATCH /notificaciones/leer-todas  → notificacion_routes.py · marcar_todas()  roles:
//       cualquiera con sesión
//   preferencias()  GET /notificaciones/preferencias  → notificacion_routes.py · preferencias()  roles:
//       cualquiera con sesión
//   guardarPreferencias()  PUT /notificaciones/preferencias  → notificacion_routes.py · guardar_preferencias()
//       roles: cualquiera con sesión
//   registrarDispositivo()  POST /dispositivos/token  → dispositivo_routes.py · registrar_token()  roles:
//       cualquiera con sesión
//   eliminarDispositivo()  DELETE /dispositivos/token  → dispositivo_routes.py · eliminar_token()  roles:
//       cualquiera con sesión
//
// Para modificar:
//   • Endpoint nuevo: nombre: async (id, datos) => (await apiClient.patch(`/x/${id}/accion`, datos)).data,
//   • Con filtro ?campo=: apiClient.get('/x', { params: { campo } })  (si campo es undefined no se envía).
//   • La URL y el método deben ser IGUALES a los del @bp.metodo("...") del backend (si no: 404/405).
//   • Después expórtalo en el repository: metodo: XApi.metodo (acciones) o fuente('clave', ...) (consultas).
// <<< FIN GUÍA
import apiClient, { conIdOperacion } from './apiClient';

/** Endpoints de mensajería interna y notificaciones. */
export const MensajesApi = {
  // --- Mensajería --------------------------------------------------------------------
  // PISTA: GET /mensajes/contactos → backend: mensaje_routes.py · contactos() · roles: cualquiera con sesión
  // PISTA: lo usa: MensajesRepository.contactos
  /** GET /mensajes/contactos → personas a las que puedo escribir (según mi rol) */
  contactos: async () => (await apiClient.get('/mensajes/contactos')).data,

  // PISTA: GET /mensajes/conversaciones → backend: mensaje_routes.py · conversaciones() · roles: cualquiera con
  //     sesión
  // PISTA: lo usa: MensajesRepository.conversaciones
  /** GET /mensajes/conversaciones → [{ id_conversacion, contacto, ultimo_mensaje, no_leidos }] */
  conversaciones: async () => (await apiClient.get('/mensajes/conversaciones')).data,

  // PISTA: GET /mensajes/conversaciones/${idConversacion} → backend: mensaje_routes.py · ver() · roles:
  //     cualquiera con sesión
  // PISTA: lo usa: MensajesRepository.conversacion, MensajesRepository.mensajesNuevos
  /**
   * GET /mensajes/conversaciones/<id>[?desde=<id_mensaje>]
   *   → { contacto, mensajes: [{ id_mensaje, contenido, mio, fecha_envio }], leidos_hasta }
   * Con `desde` solo llegan los mensajes nuevos (lo usa el chat en tiempo real).
   */
  conversacion: async (idConversacion, desde = null) =>
    (await apiClient.get(`/mensajes/conversaciones/${idConversacion}`, {
      params: desde ? { desde } : undefined,
    })).data,

  // PISTA: POST /mensajes/conversaciones → backend: mensaje_routes.py · iniciar() · roles: cualquiera con sesión
  // PISTA: lo usa: ColaRepository.MENSAJE
  /** POST /mensajes/conversaciones → { id_usuario, contenido } (primer mensaje a un contacto) */
  iniciar: async (idUsuario, contenido, idOperacion) =>
    (await apiClient.post('/mensajes/conversaciones', { id_usuario: idUsuario, contenido },
      conIdOperacion(idOperacion))).data,

  // PISTA: POST /mensajes/conversaciones/${idConversacion} → backend: mensaje_routes.py · enviar() · roles:
  //     cualquiera con sesión
  // PISTA: lo usa: ColaRepository.MENSAJE
  /** POST /mensajes/conversaciones/<id> → { contenido } (responder) */
  responder: async (idConversacion, contenido, idOperacion) =>
    (await apiClient.post(`/mensajes/conversaciones/${idConversacion}`, { contenido },
      conIdOperacion(idOperacion))).data,

  // PISTA: PATCH /mensajes/conversaciones/${idConversacion}/leido → backend: mensaje_routes.py · marcar_leidos()
  //     · roles: cualquiera con sesión
  // PISTA: lo usa: MensajesRepository.marcarLeida
  /** PATCH /mensajes/conversaciones/<id>/leido */
  marcarLeida: async (idConversacion) =>
    (await apiClient.patch(`/mensajes/conversaciones/${idConversacion}/leido`)).data,

  // --- Notificaciones ------------------------------------------------------------------
  // PISTA: GET /notificaciones → backend: notificacion_routes.py · mis_notificaciones() · roles: cualquiera con
  //     sesión
  // PISTA: lo usa: MensajesRepository.notificaciones
  /** GET /notificaciones → { no_leidas, notificaciones: [...] } */
  notificaciones: async () => (await apiClient.get('/notificaciones')).data,

  // PISTA: GET /notificaciones/contadores → backend: notificacion_routes.py · contadores() · roles: cualquiera
  //     con sesión
  /** GET /notificaciones/contadores → { mensajes_no_leidos, notificaciones_no_leidas } (liviano) */
  contadores: async () => (await apiClient.get('/notificaciones/contadores')).data,

  // PISTA: PATCH /notificaciones/${id}/leida → backend: notificacion_routes.py · marcar_leida() · roles:
  //     cualquiera con sesión
  // PISTA: lo usa: MensajesRepository.marcarNotificacionLeida
  /** PATCH /notificaciones/<id>/leida */
  marcarNotificacionLeida: async (id) => (await apiClient.patch(`/notificaciones/${id}/leida`)).data,

  // PISTA: PATCH /notificaciones/leer-todas → backend: notificacion_routes.py · marcar_todas() · roles:
  //     cualquiera con sesión
  // PISTA: lo usa: MensajesRepository.marcarTodasLeidas
  /** PATCH /notificaciones/leer-todas */
  marcarTodasLeidas: async () => (await apiClient.patch('/notificaciones/leer-todas')).data,

  // PISTA: GET /notificaciones/preferencias → backend: notificacion_routes.py · preferencias() · roles:
  //     cualquiera con sesión
  // PISTA: lo usa: MensajesRepository.preferencias
  /**
   * GET /notificaciones/preferencias
   *   → { silenciar_todo, pausado_hasta, no_molestar: {desde, hasta} | null,
   *       tipos: [{ tipo, nombre, descripcion, activo }], opciones_pausa_horas, recibe_ahora }
   */
  preferencias: async () => (await apiClient.get('/notificaciones/preferencias')).data,

  // PISTA: PUT /notificaciones/preferencias → backend: notificacion_routes.py · guardar_preferencias() · roles:
  //     cualquiera con sesión
  // PISTA: lo usa: MensajesRepository.guardarPreferencias
  /**
   * PUT /notificaciones/preferencias (todo opcional; lo que no se envía queda igual)
   *   { silenciar_todo, tipos_silenciados: ['CLASE'], pausar_horas: 8 (0 = quitar),
   *     no_molestar_desde: '22:00', no_molestar_hasta: '07:00' (null = sin horario) }
   */
  guardarPreferencias: async (datos) => (await apiClient.put('/notificaciones/preferencias', datos)).data,

  // --- Dispositivos (Push Tokens) -------------------------------------------------------
  // PISTA: POST /dispositivos/token → backend: dispositivo_routes.py · registrar_token() · roles: cualquiera con
  //     sesión
  // PISTA: lo usa: MensajesRepository.registrarTokenPush
  /** POST /dispositivos/token → { token, plataforma } */
  registrarDispositivo: async (token, plataforma) =>
    (await apiClient.post('/dispositivos/token', { token, plataforma })).data,

  // PISTA: DELETE /dispositivos/token → backend: dispositivo_routes.py · eliminar_token() · roles: cualquiera
  //     con sesión
  // PISTA: lo usa: MensajesRepository.eliminarTokenPush, SesionRepository.cerrarSesion
  /** DELETE /dispositivos/token → body: { token } */
  eliminarDispositivo: async (token) =>
    (await apiClient.delete('/dispositivos/token', { data: { token } })).data,
};

export default MensajesApi;
