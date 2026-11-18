/**
 * Tipos de notificación: el ícono que se muestra en "Avisos" y la pantalla que se abre
 * al tocar el aviso (tanto en la lista de Avisos como en la notificación push del celular).
 *
 * El backend envía en cada aviso:
 *   - tipo:          'TAREA', 'CALIFICACION', 'CITA'... (las claves de esta tabla)
 *   - id_referencia: el id del elemento relacionado (qué significa depende del tipo)
 *
 * `destino({ referencia, rol })` devuelve ['NombreDePantalla', params], o null para
 * quedarse en la lista de avisos. Los nombres de pantalla son los de
 * src/navigation/pantallas.js.
 *
 * PARA CAMBIAR EL ÍCONO O LA PANTALLA DE UN TIPO, SOLO SE EDITA ESTA TABLA.
 * (El nombre y la descripción de cada tipo, y quién lo recibe, están en el backend:
 * TIPOS en app/services/notificacion_service.py. Un tipo nuevo se agrega en los dos.)
 */
export const TIPOS_NOTIFICACION = {
  // referencia = id_tarea. El docente ve las entregas; el alumno, el detalle para entregar.
  TAREA: {
    icono: 'document-text',
    destino: ({ referencia, rol }) => {
      if (!referencia) return ['Cursos'];
      return rol === 'DOCENTE'
        ? ['Entregas', { idTarea: referencia }]
        : ['TareaDetalle', { idTarea: referencia }];
    },
  },

  // referencia = id_tarea calificada: se abre la tarea con la nota y el comentario.
  CALIFICACION: {
    icono: 'star',
    destino: ({ referencia }) => (referencia ? ['TareaDetalle', { idTarea: referencia }] : ['MisNotas']),
  },

  // referencia = id_conversacion: se abre el chat.
  MENSAJE: {
    icono: 'chatbubble',
    destino: ({ referencia }) => (referencia ? ['Chat', { idConversacion: referencia }] : ['Mensajes']),
  },

  // referencia = id_cita. El alumno ve sus citas; el psicólogo, su agenda.
  CITA: {
    icono: 'heart',
    destino: ({ rol }) => [rol === 'PSICOLOGO' ? 'Agenda' : 'MisCitas'],
  },

  // referencia = id_reporte. El alumno ve su conducta.
  CONDUCTA: {
    icono: 'shield',
    destino: ({ rol }) => [rol === 'ALUMNO' ? 'MiConducta' : 'Conducta'],
  },

  // referencia = id_carga del curso cuyo bimestre se cerró.
  LIBRETA: {
    icono: 'ribbon',
    destino: () => ['MisNotas'],
  },

  // referencia = id_clase_virtual (las clases se ven dentro de cada curso).
  CLASE: {
    icono: 'videocam',
    destino: () => ['Cursos'],
  },
};

/** Ícono para un tipo que no esté en la tabla (por ejemplo, uno nuevo del backend). */
export const ICONO_POR_DEFECTO = 'notifications';

/**
 * Horario «no molestar» que se propone la primera vez (en Mi perfil → Notificaciones).
 * El usuario lo puede cambiar; se guarda en el servidor.
 */
export const HORARIO_NO_MOLESTAR_SUGERIDO = { desde: '22:00', hasta: '07:00' };
