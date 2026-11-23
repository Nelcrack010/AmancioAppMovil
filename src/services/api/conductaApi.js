// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: API · una función por endpoint del backend (método HTTP + URL)
// Cadena: repositories/*Repository.js → [este archivo] → apiClient.js (axios + token) → backend Flask
//
// Métodos (endpoint → archivo del backend):
//   faltas()  GET /conducta/faltas  → conducta_routes.py · faltas()  roles: cualquiera con sesión
//   estadoAlumno()  GET /conducta/alumno/${idAlumno}  → conducta_routes.py · estado_conducta()  roles:
//       cualquiera con sesión
//   registrarReporte()  POST /conducta/reportes  → conducta_routes.py · registrar_reporte()  roles: AUXILIAR
//   anularReporte()  PATCH /conducta/reportes/${idReporte}/anular  → conducta_routes.py · anular_reporte()
//       roles: AUXILIAR, ADMIN
//   solicitarCita()  POST /citas  → cita_routes.py · solicitar()  roles: ALUMNO
//   misCitas()  GET /citas/mis-citas  → cita_routes.py · mis_citas()  roles: ALUMNO
//   agenda()  GET /citas/agenda  → cita_routes.py · agenda()  roles: PSICOLOGO
//   programarCita()  PATCH /citas/${idCita}/programar  → cita_routes.py · programar()  roles: PSICOLOGO
//   completarCita()  PATCH /citas/${idCita}/completar  → cita_routes.py · completar()  roles: PSICOLOGO
//   cancelarCita()  PATCH /citas/${idCita}/cancelar  → cita_routes.py · cancelar()  roles: PSICOLOGO
//   historialCitas()  GET /citas/alumno/${idAlumno}  → cita_routes.py · historial_de_alumno()  roles: PSICOLOGO
//
// Para modificar:
//   • Endpoint nuevo: nombre: async (id, datos) => (await apiClient.patch(`/x/${id}/accion`, datos)).data,
//   • Con filtro ?campo=: apiClient.get('/x', { params: { campo } })  (si campo es undefined no se envía).
//   • La URL y el método deben ser IGUALES a los del @bp.metodo("...") del backend (si no: 404/405).
//   • Después expórtalo en el repository: metodo: XApi.metodo (acciones) o fuente('clave', ...) (consultas).
// <<< FIN GUÍA
import apiClient, { conIdOperacion } from './apiClient';

/** Endpoints de conducta y citas de psicología. */
export const ConductaApi = {
  // --- Conducta --------------------------------------------------------------------
  // PISTA: GET /conducta/faltas → backend: conducta_routes.py · faltas() · roles: cualquiera con sesión
  // PISTA: lo usa: ConductaRepository.faltas
  /** GET /conducta/faltas → catálogo [{ id_falta, nombre, tipo, puntos }] */
  faltas: async () => (await apiClient.get('/conducta/faltas')).data,

  // PISTA: GET /conducta/alumno/${idAlumno} → backend: conducta_routes.py · estado_conducta() · roles:
  //     cualquiera con sesión
  // PISTA: lo usa: ConductaRepository.estadoAlumno, ConductaRepository.miConducta
  /** GET /conducta/alumno/<id> → { alumno, nota_actual, notas_por_bimestre, reportes } */
  estadoAlumno: async (idAlumno) => (await apiClient.get(`/conducta/alumno/${idAlumno}`)).data,

  // PISTA: POST /conducta/reportes → backend: conducta_routes.py · registrar_reporte() · roles: AUXILIAR
  // PISTA: lo usa: ColaRepository.REPORTE_CONDUCTA, ConductaRepository.registrarReporte
  /** POST /conducta/reportes → { id_alumno, id_falta, descripcion, evidencia_url?, fecha? } (admite modo sin conexión) */
  registrarReporte: async (datos, idOperacion) =>
    (await apiClient.post('/conducta/reportes', datos, conIdOperacion(idOperacion))).data,

  // PISTA: PATCH /conducta/reportes/${idReporte}/anular → backend: conducta_routes.py · anular_reporte() ·
  //     roles: AUXILIAR, ADMIN
  // PISTA: lo usa: ConductaRepository.anularReporte
  /** PATCH /conducta/reportes/<id>/anular → { motivo } */
  anularReporte: async (idReporte, motivo) =>
    (await apiClient.patch(`/conducta/reportes/${idReporte}/anular`, { motivo })).data,

  // --- Citas de psicología -----------------------------------------------------------
  // PISTA: POST /citas → backend: cita_routes.py · solicitar() · roles: ALUMNO
  // PISTA: lo usa: ColaRepository.SOLICITUD_CITA, ConductaRepository.solicitarCita
  /** POST /citas → { motivo, disponibilidad } (alumno; admite modo sin conexión) */
  solicitarCita: async (datos, idOperacion) =>
    (await apiClient.post('/citas', datos, conIdOperacion(idOperacion))).data,

  // PISTA: GET /citas/mis-citas → backend: cita_routes.py · mis_citas() · roles: ALUMNO
  // PISTA: lo usa: ConductaRepository.misCitas
  /** GET /citas/mis-citas (alumno) */
  misCitas: async () => (await apiClient.get('/citas/mis-citas')).data,

  // PISTA: GET /citas/agenda → backend: cita_routes.py · agenda() · roles: PSICOLOGO
  // PISTA: lo usa: ConductaRepository.agenda
  /** GET /citas/agenda?fecha= (psicólogo) → { fecha, citas, pendientes } */
  agenda: async (fecha) => (await apiClient.get('/citas/agenda', { params: { fecha } })).data,

  // PISTA: PATCH /citas/${idCita}/programar → backend: cita_routes.py · programar() · roles: PSICOLOGO
  // PISTA: lo usa: ConductaRepository.programarCita
  /** PATCH /citas/<id>/programar → { fecha_cita: "AAAA-MM-DDTHH:MM" } (programa o reprograma) */
  programarCita: async (idCita, fechaCita) =>
    (await apiClient.patch(`/citas/${idCita}/programar`, { fecha_cita: fechaCita })).data,

  // PISTA: PATCH /citas/${idCita}/completar → backend: cita_routes.py · completar() · roles: PSICOLOGO
  // PISTA: lo usa: ConductaRepository.completarCita
  /** PATCH /citas/<id>/completar → { observacion } */
  completarCita: async (idCita, observacion) =>
    (await apiClient.patch(`/citas/${idCita}/completar`, { observacion })).data,

  // PISTA: PATCH /citas/${idCita}/cancelar → backend: cita_routes.py · cancelar() · roles: PSICOLOGO
  // PISTA: lo usa: ConductaRepository.cancelarCita
  /** PATCH /citas/<id>/cancelar → { motivo } */
  cancelarCita: async (idCita, motivo) =>
    (await apiClient.patch(`/citas/${idCita}/cancelar`, { motivo })).data,

  // PISTA: GET /citas/alumno/${idAlumno} → backend: cita_routes.py · historial_de_alumno() · roles: PSICOLOGO
  // PISTA: lo usa: ConductaRepository.historialCitas
  /** GET /citas/alumno/<id_alumno> (psicólogo) → historial con observaciones */
  historialCitas: async (idAlumno) => (await apiClient.get(`/citas/alumno/${idAlumno}`)).data,
};

export default ConductaApi;
