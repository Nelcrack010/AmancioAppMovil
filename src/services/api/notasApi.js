import apiClient, { conIdOperacion } from './apiClient';

/** Endpoints de notas por bimestre y libreta. */
export const NotasApi = {
  // --- Alumno ----------------------------------------------------------------------
  /** GET /notas/mis-notas?bimestre=n → { bimestre, cursos: [{ curso, evaluaciones, promedio }] } */
  misNotas: async (bimestre) => (await apiClient.get('/notas/mis-notas', { params: { bimestre } })).data,

  /** GET /notas/mi-libreta → { anio, cursos: [{ curso, nota_bimestre1..4, promedio_final }] } */
  miLibreta: async () => (await apiClient.get('/notas/mi-libreta')).data,

  // --- Docente ---------------------------------------------------------------------
  /** GET /notas/<id_carga>?bimestre=n → { curso, bimestre, cerrado, alumnos: [...] } */
  delCurso: async (idCarga, bimestre) =>
    (await apiClient.get(`/notas/${idCarga}`, { params: { bimestre } })).data,

  /**
   * POST /notas/<id_carga> → { bimestre, evaluacion, notas: [{ id_alumno, valor }] }
   * Registra (o corrige) una evaluación para varios alumnos. Admite modo sin conexión.
   */
  registrar: async (idCarga, datos, idOperacion) =>
    (await apiClient.post(`/notas/${idCarga}`, datos, conIdOperacion(idOperacion))).data,

  /** POST /notas/<id_carga>/cerrar-bimestre → { bimestre } */
  cerrarBimestre: async (idCarga, bimestre) =>
    (await apiClient.post(`/notas/${idCarga}/cerrar-bimestre`, { bimestre })).data,
};

export default NotasApi;
