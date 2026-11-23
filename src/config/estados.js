// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Qué es: Textos y colores de los estados que devuelve la API.
// Lo usan: ResumenConducta.jsx, MenuMas.jsx, useRegistroAsistenciaViewModel.js, MiAsistenciaView.jsx,
//     MisCitasView.jsx, MisNotasView.jsx, RegistrarAsistenciaView.jsx, RegistrarReporteView.jsx (+14 más)
//
// Para modificar:
//   Textos y colores de cada estado (PENDIENTE, ATENDIDA...). Estado nuevo → agrégalo aquí.
// <<< FIN GUÍA
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

/**
 * JUSTIFICAR una tardanza o falta sin perder lo que pasó.
 * La API guarda J (justificada) y en `estado_original` lo que tenía antes (T o F).
 * En pantalla se ven los DOS marcados: por ejemplo "T" + "J" = tardanza justificada.
 */
export const JUSTIFICADA = 'J';
export const SE_PUEDEN_JUSTIFICAR = ['T', 'F'];
export const ORIGINAL_POR_DEFECTO = 'F';   // J sin nada antes = falta justificada

/**
 * Qué pasa al tocar un botón de asistencia. `marca` = { estado, original }.
 *   - P, T o F: queda ese estado (sin justificar).
 *   - J sobre una T o F: se justifica y la T/F queda marcada también.
 *   - J otra vez sobre una justificada: se quita la justificación (vuelve a T o F).
 *   - J sobre un presente: falta justificada.
 */
export function tocarAsistencia(marca, boton) {
  if (boton !== JUSTIFICADA) return { estado: boton, original: null };
  if (marca?.estado === JUSTIFICADA) return { estado: marca.original || ORIGINAL_POR_DEFECTO, original: null };
  const original = SE_PUEDEN_JUSTIFICAR.includes(marca?.estado) ? marca.estado : ORIGINAL_POR_DEFECTO;
  return { estado: JUSTIFICADA, original };
}

/** ¿El botón `boton` se ve marcado? (en una justificada se marcan J y su T/F) */
export function botonAsistenciaActivo(marca, boton) {
  return marca?.estado === boton || (marca?.estado === JUSTIFICADA && marca.original === boton);
}

/** Etiquetas para mostrar un registro: [Tardanza, Justificada] o solo [Presente]. */
export function etiquetasAsistencia({ estado, estado_original: original }) {
  const principal = infoEstado(ESTADOS_ASISTENCIA, estado);
  if (estado !== JUSTIFICADA) return [principal];
  return [infoEstado(ESTADOS_ASISTENCIA, original || ORIGINAL_POR_DEFECTO), principal];
}

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
