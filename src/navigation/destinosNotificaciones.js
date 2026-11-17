import { usuarioEnMemoria } from '../repositories/sesionRepository';

/**
 * Ícono asignado a cada tipo de notificación para la bandeja de avisos.
 */
export const TIPOS_NOTIFICACION = {
  TAREA: { icono: 'document-text' },
  CALIFICACION: { icono: 'star' },
  CLASE: { icono: 'videocam' },
  LIBRETA: { icono: 'ribbon' },
  CITA: { icono: 'heart' },
  CONDUCTA: { icono: 'shield' },
  MENSAJE: { icono: 'chatbubble' },
};

/**
 * Resuelve la pantalla y parámetros [nombrePantalla, params] según el tipo de notificación,
 * id_referencia y el rol del usuario.
 *
 * Si el tipo no cuenta con una pantalla de detalle específica o no tiene id_referencia,
 * cae de respaldo en la vista general correspondiente o en 'Notificaciones'.
 */
export function obtenerDestinoNotificacion(notificacion, rol) {
  if (!notificacion) return ['Notificaciones'];
  const rolActual = rol || usuarioEnMemoria()?.rol;
  const { tipo, id_referencia, titulo } = notificacion;

  switch (tipo) {
    case 'TAREA':
      if (id_referencia) {
        return rolActual === 'DOCENTE'
          ? ['Entregas', { idTarea: id_referencia, id: id_referencia, titulo }]
          : ['TareaDetalle', { idTarea: id_referencia, id: id_referencia, titulo }];
      }
      return ['Cursos'];

    case 'CALIFICACION':
      if (id_referencia) {
        return ['TareaDetalle', { idTarea: id_referencia, id: id_referencia, titulo }];
      }
      return ['MisNotas'];

    case 'MENSAJE':
      if (id_referencia) {
        return ['Chat', { idConversacion: id_referencia }];
      }
      return ['Mensajes'];

    case 'CITA':
      return [rolActual === 'PSICOLOGO' ? 'Agenda' : 'MisCitas'];

    case 'CONDUCTA':
      return [rolActual === 'ALUMNO' ? 'MiConducta' : 'Conducta'];

    case 'LIBRETA':
      return ['MisNotas'];

    case 'CLASE':
      return ['Cursos'];

    default:
      return ['Notificaciones'];
  }
}

/**
 * Convierte el payload de datos de una notificación push en una URL deep linking
 * con esquema `amancioapp://...`.
 */
export function urlDesdeNotificacion(data, rol) {
  if (!data) return 'amancioapp://notificaciones';
  if (typeof data === 'string') return data;

  const rolActual = rol || usuarioEnMemoria()?.rol;
  const tipo = data.tipo;
  const idRef = data.id_referencia ?? data.id;

  switch (tipo) {
    case 'TAREA':
      if (idRef) {
        return rolActual === 'DOCENTE'
          ? `amancioapp://entregas/${idRef}`
          : `amancioapp://tarea/${idRef}`;
      }
      return 'amancioapp://cursos';

    case 'CALIFICACION':
      if (idRef) {
        return `amancioapp://tarea/${idRef}`;
      }
      return 'amancioapp://mis-notas';

    case 'MENSAJE':
      if (idRef) {
        return `amancioapp://chat/${idRef}`;
      }
      return 'amancioapp://mensajes';

    case 'CITA':
      return rolActual === 'PSICOLOGO' ? 'amancioapp://agenda' : 'amancioapp://mis-citas';

    case 'CONDUCTA':
      return rolActual === 'ALUMNO' ? 'amancioapp://mi-conducta' : 'amancioapp://conducta';

    case 'LIBRETA':
      return 'amancioapp://mis-notas';

    case 'CLASE':
      return 'amancioapp://cursos';

    default:
      return 'amancioapp://notificaciones';
  }
}
