import apiClient, { conIdOperacion } from './apiClient';

/** Endpoints de conducta y citas de psicología. */
export const ConductaApi = {
  // --- Conducta --------------------------------------------------------------------
  /** GET /conducta/faltas → catálogo [{ id_falta, nombre, tipo, puntos }] */
  faltas: async () => (await apiClient.get('/conducta/faltas')).data,

  /** GET /conducta/alumno/<id> → { alumno, nota_actual, notas_por_bimestre, reportes } */
  estadoAlumno: async (idAlumno) => (await apiClient.get(`/conducta/alumno/${idAlumno}`)).data,

  /** POST /conducta/reportes → { id_alumno, id_falta, descripcion, evidencia_url?, fecha? } (admite modo sin conexión) */
  registrarReporte: async (datos, idOperacion) =>
    (await apiClient.post('/conducta/reportes', datos, conIdOperacion(idOperacion))).data,

  /** PATCH /conducta/reportes/<id>/anular → { motivo } */
  anularReporte: async (idReporte, motivo) =>
    (await apiClient.patch(`/conducta/reportes/${idReporte}/anular`, { motivo })).data,

  // --- Citas de psicología -----------------------------------------------------------
  /** POST /citas → { motivo, disponibilidad } (alumno; admite modo sin conexión) */
  solicitarCita: async (datos, idOperacion) =>
    (await apiClient.post('/citas', datos, conIdOperacion(idOperacion))).data,

  /** GET /citas/mis-citas (alumno) */
  misCitas: async () => (await apiClient.get('/citas/mis-citas')).data,

  /** GET /citas/agenda?fecha= (psicólogo) → { fecha, citas, pendientes } */
  agenda: async (fecha) => (await apiClient.get('/citas/agenda', { params: { fecha } })).data,

  /** PATCH /citas/<id>/programar → { fecha_cita: "AAAA-MM-DDTHH:MM" } (programa o reprograma) */
  programarCita: async (idCita, fechaCita) =>
    (await apiClient.patch(`/citas/${idCita}/programar`, { fecha_cita: fechaCita })).data,

  /** PATCH /citas/<id>/completar → { observacion } */
  completarCita: async (idCita, observacion) =>
    (await apiClient.patch(`/citas/${idCita}/completar`, { observacion })).data,

  /** PATCH /citas/<id>/cancelar → { motivo } */
  cancelarCita: async (idCita, motivo) =>
    (await apiClient.patch(`/citas/${idCita}/cancelar`, { motivo })).data,

  /** GET /citas/alumno/<id_alumno> (psicólogo) → historial con observaciones */
  historialCitas: async (idAlumno) => (await apiClient.get(`/citas/alumno/${idAlumno}`)).data,
};

export default ConductaApi;
