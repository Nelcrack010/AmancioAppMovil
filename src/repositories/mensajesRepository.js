// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: REPOSITORY · de dónde salen los datos: caché del celular, la API o la cola sin conexión
// Cadena: vistas/viewmodels → [este archivo] → services/api/*Api.js → backend
//
// Métodos (→ endpoint · lo usan):
//   contactos()  → GET /mensajes/contactos  · lo usan: ContactosView.jsx
//   conversaciones()  → GET /mensajes/conversaciones  · lo usan: useChatViewModel.js, MensajesView.jsx
//   conversacion()  → GET /mensajes/conversaciones/${idConversacion}  · lo usan: useChatViewModel.js
//   mensajesNuevos()  → GET /mensajes/conversaciones/${idConversacion}  · lo usan: useChatViewModel.js
//   marcarLeida()  → PATCH /mensajes/conversaciones/${idConversacion}/leido  · lo usan: useChatViewModel.js
//   enviar()  → solo en el celular  · lo usan: useChatViewModel.js
//   notificaciones()  → GET /notificaciones  · lo usan: NotificacionesView.jsx
//   marcarNotificacionLeida()  → PATCH /notificaciones/${id}/leida  · lo usan: abrirNotificacion.js,
//       NotificacionesView.jsx
//   marcarTodasLeidas()  → PATCH /notificaciones/leer-todas  · lo usan: NotificacionesView.jsx
//   preferencias()  → GET /notificaciones/preferencias  · lo usan: AjustesNotificacionesView.jsx
//   guardarPreferencias()  → PUT /notificaciones/preferencias  · lo usan: AjustesNotificacionesView.jsx
//   registrarTokenPush()  → POST /dispositivos/token  · lo usan: SesionContext.jsx
//   obtenerTokenPushGuardado()  → solo en el celular  · lo usan: —
//   eliminarTokenPush()  → DELETE /dispositivos/token  · lo usan: —
//
// Para modificar:
//   • CONSULTA (mostrar datos): metodo: (a) => fuente(`clave:${a}`, () => XApi.metodo(a)),
//     la clave de caché debe cambiar si cambia el parámetro (si no, se ven datos de otro filtro).
//   • ACCIÓN (guardar/borrar): metodo: XApi.metodo,   (se pasa tal cual).
//   • Que funcione sin conexión: ColaRepository.enviar('TIPO', payload, descripcion) + agregar TIPO en ENVIOS
//       (colaRepository.js).
// <<< FIN GUÍA
import { Platform } from 'react-native';
import MensajesApi from '../services/api/mensajesApi';
import Almacenamiento from '../services/almacenamiento';
import { STORAGE_KEYS } from '../config/constants';
import { fuente } from './cacheRepository';
import ColaRepository from './colaRepository';

/** MensajesRepository: mensajería interna y notificaciones. */
export const MensajesRepository = {
  // --- Mensajería ---------------------------------------------------------------------------
  // PISTA: contactos() → GET /mensajes/contactos (backend: mensaje_routes.py → contactos()) · caché «contactos»
  //     · lo usan: ContactosView.jsx
  contactos: () => fuente('contactos', MensajesApi.contactos),
  // PISTA: conversaciones() → GET /mensajes/conversaciones (backend: mensaje_routes.py → conversaciones()) ·
  //     caché «conversaciones» · lo usan: useChatViewModel.js, MensajesView.jsx
  conversaciones: () => fuente('conversaciones', MensajesApi.conversaciones),
  // PISTA: conversacion() → GET /mensajes/conversaciones/<int:id_conversacion> (backend: mensaje_routes.py →
  //     ver()) · caché «conversacion:${id}» · lo usan: useChatViewModel.js
  conversacion: (id) => fuente(`conversacion:${id}`, () => MensajesApi.conversacion(id)),
  // PISTA: mensajesNuevos() → GET /mensajes/conversaciones/<int:id_conversacion> (backend: mensaje_routes.py →
  //     ver()) · lo usan: useChatViewModel.js
  /** Solo los mensajes posteriores a `desde` (id del último que ya se tiene). */
  mensajesNuevos: (id, desde) => MensajesApi.conversacion(id, desde),
  // PISTA: marcarLeida() → PATCH /mensajes/conversaciones/<int:id_conversacion>/leido (backend:
  //     mensaje_routes.py → marcar_leidos()) · lo usan: useChatViewModel.js
  marcarLeida: MensajesApi.marcarLeida,

  // PISTA: enviar() → solo en el celular · lo usan: useChatViewModel.js
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
  // PISTA: notificaciones() → GET /notificaciones (backend: notificacion_routes.py → mis_notificaciones()) ·
  //     caché «notificaciones» · lo usan: NotificacionesView.jsx
  notificaciones: () => fuente('notificaciones', MensajesApi.notificaciones),
  // PISTA: marcarNotificacionLeida() → PATCH /notificaciones/<int:id_notificacion>/leida (backend:
  //     notificacion_routes.py → marcar_leida()) · lo usan: abrirNotificacion.js, NotificacionesView.jsx
  marcarNotificacionLeida: MensajesApi.marcarNotificacionLeida,
  // PISTA: marcarTodasLeidas() → PATCH /notificaciones/leer-todas (backend: notificacion_routes.py →
  //     marcar_todas()) · lo usan: NotificacionesView.jsx
  marcarTodasLeidas: MensajesApi.marcarTodasLeidas,
  // PISTA: preferencias() → GET /notificaciones/preferencias (backend: notificacion_routes.py → preferencias())
  //     · caché «preferencias-notificaciones» · lo usan: AjustesNotificacionesView.jsx
  /** Qué notificaciones push recibe el usuario (silenciar, pausar, tipos, no molestar). */
  preferencias: () => fuente('preferencias-notificaciones', MensajesApi.preferencias),
  // PISTA: guardarPreferencias() → PUT /notificaciones/preferencias (backend: notificacion_routes.py →
  //     guardar_preferencias()) · lo usan: AjustesNotificacionesView.jsx
  guardarPreferencias: MensajesApi.guardarPreferencias,

  // --- Dispositivos Push --------------------------------------------------------------------
  // PISTA: registrarTokenPush() → POST /dispositivos/token (backend: dispositivo_routes.py → registrar_token())
  //     · lo usan: SesionContext.jsx
  /** Registra el token push en el backend y lo persiste en almacenamiento seguro. */
  async registrarTokenPush(token) {
    if (!token) return false;
    const plataforma = Platform.OS === 'ios' ? 'ios' : 'android';
    await MensajesApi.registrarDispositivo(token, plataforma);
    await Almacenamiento.guardar(STORAGE_KEYS.PUSH_TOKEN, token);
    return true;
  },

  // PISTA: obtenerTokenPushGuardado() → solo en el celular · lo usan: —
  /** Obtiene el token push guardado en el almacenamiento seguro. */
  async obtenerTokenPushGuardado() {
    return Almacenamiento.leer(STORAGE_KEYS.PUSH_TOKEN);
  },

  // PISTA: eliminarTokenPush() → DELETE /dispositivos/token (backend: dispositivo_routes.py → eliminar_token())
  //     · lo usan: —
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
