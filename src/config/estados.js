import { COLORES } from './tema';

/**
 * Textos y colores de los estados que devuelve la API.
 *
 * El "tono" es el color de la etiqueta (ver componente <Etiqueta>):
 * exito (verde), alerta (ámbar), error (rojo), info (azul) o neutro (gris).
 * Si la API agrega un estado nuevo, basta con añadirlo aquí.
 */

/** Asistencia: P, T, F, J */
export const ESTADOS_ASISTENCIA = {
  P: { texto: 'Presente', corto: 'P', tono: 'exito' },
  T: { texto: 'Tardanza', corto: 'T', tono: 'alerta' },
  F: { texto: 'Falta', corto: 'F', tono: 'error' },
  J: { texto: 'Justificada', corto: 'J', tono: 'info' },
};

/** Estado de una tarea para el alumno (y de cada entrega para el docente). */
export const ESTADOS_TAREA = {
  PENDIENTE: { texto: 'Pendiente', tono: 'alerta' },
  ENTREGADA: { texto: 'Entregada', tono: 'info' },
  CALIFICADA: { texto: 'Calificada', tono: 'exito' },
  VENCIDA: { texto: 'Vencida', tono: 'error' },
};

/** Citas de psicología. */
export const ESTADOS_CITA = {
  PENDIENTE: { texto: 'Pendiente', tono: 'alerta' },
  PROGRAMADA: { texto: 'Programada', tono: 'info' },
  ATENDIDA: { texto: 'Atendida', tono: 'exito' },
  CANCELADA: { texto: 'Cancelada', tono: 'error' },
};

/** Reportes de conducta. */
export const ESTADOS_REPORTE = {
  REGISTRADO: { texto: 'Registrado', tono: 'alerta' },
  ANULADO: { texto: 'Anulado', tono: 'neutro' },
};

/** Gravedad de las faltas del catálogo. */
export const TIPOS_FALTA = {
  Leve: { tono: 'info' },
  Grave: { tono: 'alerta' },
  'Muy grave': { tono: 'error' },
};

/** Nombre legible de cada rol. */
export const NOMBRES_ROL = {
  ALUMNO: 'Estudiante',
  DOCENTE: 'Docente',
  AUXILIAR: 'Auxiliar',
  PSICOLOGO: 'Psicología',
  ADMIN: 'Administración',
};

/** Busca un estado en una de las tablas de arriba; si no existe, lo muestra tal cual. */
export function infoEstado(tabla, estado) {
  return tabla[estado] || { texto: estado || '—', tono: 'neutro' };
}

/** Color de una nota vigesimal: desaprobatoria (menos de 11) en rojo; aprobatoria en azul. */
export const NOTA_APROBATORIA = 11;
export function colorNota(valor) {
  if (valor === null || valor === undefined) return COLORES.textoSuave;
  return valor < NOTA_APROBATORIA ? COLORES.error : COLORES.azul;
}
