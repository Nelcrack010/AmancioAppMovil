import apiClient, { conIdOperacion } from './apiClient';

/** Endpoints de asistencia. */
export const AsistenciaApi = {
  /** GET /asistencia/mia (alumno) → { registros: [{ fecha, estado }], resumen: { P, T, F, J } } */
  mia: async () => (await apiClient.get('/asistencia/mia')).data,

  /** GET /asistencia/seccion/<id>?fecha=AAAA-MM-DD → { seccion, fecha, registrada, registros } */
  deSeccion: async (idSeccion, fecha) =>
    (await apiClient.get(`/asistencia/seccion/${idSeccion}`, { params: { fecha } })).data,

  /**
   * GET /asistencia/seccion/<id>/resumen?desde=&hasta= → { seccion, alumnos: [{ P, T, F, J, porcentaje }] }
   * Incluye a TODOS los alumnos matriculados en la sección (aunque no tengan registros),
   * por eso también se usa para obtener la lista de alumnos de una sección.
   */
  resumen: async (idSeccion, desde, hasta) =>
    (await apiClient.get(`/asistencia/seccion/${idSeccion}/resumen`, { params: { desde, hasta } })).data,

  /**
   * POST /asistencia/lote → { id_seccion, fecha, registros: [{ id_alumno, estado, observacion }] }
   * Guarda la asistencia completa de la sección en una sola operación. Admite modo sin conexión.
   */
  registrarLote: async (datos, idOperacion) =>
    (await apiClient.post('/asistencia/lote', datos, conIdOperacion(idOperacion))).data,
};

export default AsistenciaApi;
