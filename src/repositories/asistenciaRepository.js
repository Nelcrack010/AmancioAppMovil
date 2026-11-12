import AsistenciaApi from '../services/api/asistenciaApi';
import { fuente } from './cacheRepository';
import ColaRepository from './colaRepository';

/** AsistenciaRepository: consulta y registro de asistencia. */
export const AsistenciaRepository = {
  /** Asistencia del alumno que inició sesión. */
  mia: () => fuente('asistencia-mia', AsistenciaApi.mia),

  /** Lo registrado en una sección en una fecha. */
  deSeccion: (idSeccion, fecha) =>
    fuente(`asistencia:${idSeccion}:${fecha}`, () => AsistenciaApi.deSeccion(idSeccion, fecha)),

  /** Reporte por alumno entre dos fechas. */
  resumen: (idSeccion, desde, hasta) =>
    fuente(`asistencia-resumen:${idSeccion}:${desde}:${hasta}`,
      () => AsistenciaApi.resumen(idSeccion, desde, hasta)),

  /**
   * Alumnos matriculados en una sección: [{ id_alumno, nombres, apellidos }].
   * Se obtienen del reporte de un solo día, que siempre trae a todos los matriculados.
   */
  alumnosDeSeccion: (idSeccion, fecha) =>
    fuente(`alumnos-seccion:${idSeccion}`, async () => {
      const r = await AsistenciaApi.resumen(idSeccion, fecha, fecha);
      return r.alumnos.map(({ id_alumno, nombres, apellidos }) => ({ id_alumno, nombres, apellidos }));
    }),

  /** Guarda la asistencia completa de la sección (admite modo sin conexión). */
  registrarLote: (datos, descripcion) => ColaRepository.enviar('ASISTENCIA', datos, descripcion),
};

export default AsistenciaRepository;
