// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Qué es: Utilidades de fechas.
// Lo usan: Estados.jsx, Items.jsx, ResumenConducta.jsx, useNotasCursoViewModel.js,
//     useRegistroAsistenciaViewModel.js, MiAsistenciaView.jsx, MisCitasView.jsx, MisNotasView.jsx (+23 más)
//
// Para modificar:
//   formatearFecha, formatearFechaHora, hoyISO, esFechaValida... Úsalas para mostrar fechas.
// <<< FIN GUÍA
/**
 * Utilidades de fechas.
 *
 * La API envía las fechas como texto ISO: "2026-10-07" o "2026-10-04T18:05:00".
 * Aquí se formatean "a mano" (sin Intl) para que se vean igual en Android, iOS y web.
 */

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** Agrega un cero a la izquierda: 7 → "07". */
const dosDigitos = (n) => String(n).padStart(2, '0');

/** "2026-10-07" o "2026-10-07T08:30:00" → "7 oct 2026" */
export function formatearFecha(iso) {
  if (!iso) return '—';
  const [anio, mes, dia] = String(iso).slice(0, 10).split('-').map(Number);
  if (!anio || !mes || !dia) return String(iso);
  return `${dia} ${MESES[mes - 1]} ${anio}`;
}

/**
 * "2026-10-04T18:05:00" → "4 oct, 18:05"  (si es del año en curso, el año no se muestra
 * para que el texto sea más corto)  ·  "2025-10-04T18:05:00" → "4 oct 2025, 18:05"
 */
export function formatearFechaHora(iso) {
  if (!iso) return '—';
  const texto = String(iso);
  const hora = texto.length >= 16 ? texto.slice(11, 16) : '';
  let fecha = formatearFecha(texto);
  if (texto.slice(0, 4) === String(new Date().getFullYear())) fecha = fecha.replace(/ \d{4}$/, '');
  return hora ? `${fecha}, ${hora}` : fecha;
}

/** "2026-10-04T18:05:00" → "18:05" */
export function soloHora(iso) {
  return iso && String(iso).length >= 16 ? String(iso).slice(11, 16) : '';
}

/** Momento guardado por el celular (new Date().toISOString(), en UTC) → "4 oct 2026, 18:05" en hora local. */
export function formatearMomentoLocal(isoUtc) {
  const d = new Date(isoUtc);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}, ${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}`;
}

/** Fecha de hoy en formato de la API: "AAAA-MM-DD" (hora local del celular). */
export function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
}

/** Suma (o resta) días a una fecha "AAAA-MM-DD" y la devuelve en el mismo formato. */
export function sumarDias(iso, dias) {
  const [a, m, d] = iso.split('-').map(Number);
  const fecha = new Date(a, m - 1, d + dias);
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

/** Nombre del día de la semana de una fecha "AAAA-MM-DD": "Lunes", "Martes"... */
export function nombreDia(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return DIAS[new Date(a, m - 1, d).getDay()];
}

/** true si el texto es una fecha real con formato "AAAA-MM-DD". */
export function esFechaValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto || '')) return false;
  const [a, m, d] = texto.split('-').map(Number);
  const fecha = new Date(a, m - 1, d);
  return fecha.getFullYear() === a && fecha.getMonth() === m - 1 && fecha.getDate() === d;
}

/** true si el texto es una hora "HH:MM" válida (00:00 a 23:59). */
export function esHoraValida(texto) {
  if (!/^\d{2}:\d{2}$/.test(texto || '')) return false;
  const [h, min] = texto.split(':').map(Number);
  return h <= 23 && min <= 59;
}

/** Une fecha y hora en el formato que espera la API: "2026-11-20T23:59". */
export function unirFechaHora(fecha, hora) {
  return `${fecha}T${hora}`;
}

/**
 * Número del bimestre en curso: el último cuya fecha de inicio ya llegó.
 * `bimestres` es la lista que trae GET /academico/anio-activo.
 */
export function bimestreActual(bimestres = []) {
  const hoy = hoyISO();
  const iniciados = bimestres.filter((b) => b.fecha_inicio <= hoy);
  return iniciados.length ? iniciados[iniciados.length - 1].numero : 1;
}
