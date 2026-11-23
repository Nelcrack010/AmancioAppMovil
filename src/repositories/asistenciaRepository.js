// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: REPOSITORY · de dónde salen los datos: caché del celular, la API o la cola sin conexión
// Cadena: vistas/viewmodels → [este archivo] → services/api/*Api.js → backend
//
// Métodos (→ endpoint · lo usan):
//   mia()  → GET /asistencia/mia  · lo usan: MiAsistenciaView.jsx
//   deSeccion()  → GET /asistencia/seccion/${idSeccion}  · lo usan: useRegistroAsistenciaViewModel.js
//   resumen()  → GET /asistencia/seccion/${idSeccion}/resumen  · lo usan: ReporteAsistenciaView.jsx
//   alumnosDeSeccion()  → GET /asistencia/seccion/${idSeccion}/resumen  · lo usan:
//       useRegistroAsistenciaViewModel.js, ConductaView.jsx
//   registrarLote()  → POST /asistencia/lote  · lo usan: useRegistroAsistenciaViewModel.js
//
// Para modificar:
//   • CONSULTA (mostrar datos): metodo: (a) => fuente(`clave:${a}`, () => XApi.metodo(a)),
//     la clave de caché debe cambiar si cambia el parámetro (si no, se ven datos de otro filtro).
//   • ACCIÓN (guardar/borrar): metodo: XApi.metodo,   (se pasa tal cual).
//   • Que funcione sin conexión: ColaRepository.enviar('TIPO', payload, descripcion) + agregar TIPO en ENVIOS
//       (colaRepository.js).
// <<< FIN GUÍA
import AsistenciaApi from '../services/api/asistenciaApi';
import { fuente } from './cacheRepository';
import ColaRepository from './colaRepository';

/** AsistenciaRepository: consulta y registro de asistencia. */
export const AsistenciaRepository = {
  // PISTA: mia() → GET /asistencia/mia (backend: asistencia_routes.py → mi_asistencia()) · caché
  //     «asistencia-mia» · lo usan: MiAsistenciaView.jsx
  /** Asistencia del alumno que inició sesión. */
  mia: () => fuente('asistencia-mia', AsistenciaApi.mia),

  // PISTA: deSeccion() → GET /asistencia/seccion/<int:id_seccion> (backend: asistencia_routes.py → de_seccion())
  //     · caché «asistencia:${idSeccion}:${fecha}» · lo usan: useRegistroAsistenciaViewModel.js
  /** Lo registrado en una sección en una fecha. */
  deSeccion: (idSeccion, fecha) =>
    fuente(`asistencia:${idSeccion}:${fecha}`, () => AsistenciaApi.deSeccion(idSeccion, fecha)),

  // PISTA: resumen() → GET /asistencia/seccion/<int:id_seccion>/resumen (backend: asistencia_routes.py →
  //     resumen_de_seccion()) · caché «asistencia-resumen:${idSeccion}:${desde}:${hasta}» · lo usan:
  //     ReporteAsistenciaView.jsx
  /** Reporte por alumno entre dos fechas. */
  resumen: (idSeccion, desde, hasta) =>
    fuente(`asistencia-resumen:${idSeccion}:${desde}:${hasta}`,
      () => AsistenciaApi.resumen(idSeccion, desde, hasta)),

  // PISTA: alumnosDeSeccion() → GET /asistencia/seccion/<int:id_seccion>/resumen (backend: asistencia_routes.py
  //     → resumen_de_seccion()) · caché «alumnos-seccion:${idSeccion}» · lo usan:
  //     useRegistroAsistenciaViewModel.js, ConductaView.jsx
  /**
   * Alumnos matriculados en una sección: [{ id_alumno, nombres, apellidos }].
   * Se obtienen del reporte de un solo día, que siempre trae a todos los matriculados.
   */
  alumnosDeSeccion: (idSeccion, fecha) =>
    fuente(`alumnos-seccion:${idSeccion}`, async () => {
      const r = await AsistenciaApi.resumen(idSeccion, fecha, fecha);
      return r.alumnos.map(({ id_alumno, nombres, apellidos }) => ({ id_alumno, nombres, apellidos }));
    }),

  // PISTA: registrarLote() → POST /asistencia/lote (backend: asistencia_routes.py → registrar_lote()) · sin
  //     conexión: cola ASISTENCIA · lo usan: useRegistroAsistenciaViewModel.js
  /** Guarda la asistencia completa de la sección (admite modo sin conexión). */
  registrarLote: (datos, descripcion) => ColaRepository.enviar('ASISTENCIA', datos, descripcion),
};

export default AsistenciaRepository;
