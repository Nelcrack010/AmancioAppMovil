import apiClient from './apiClient';

/** Endpoints de consulta académica: año escolar, secciones y horario. */
export const AcademicoApi = {
  /** GET /academico/anio-activo → año escolar con sus 4 bimestres */
  anioActivo: async () => (await apiClient.get('/academico/anio-activo')).data,

  /** GET /academico/secciones → secciones del año actual [{ id_seccion, grado, nombre, nivel }] */
  secciones: async () => (await apiClient.get('/academico/secciones')).data,

  /** GET /horario/mi-horario → { dias: [{ dia, bloques: [...] }], recesos } (alumno o docente) */
  miHorario: async () => (await apiClient.get('/horario/mi-horario')).data,
};

export default AcademicoApi;
