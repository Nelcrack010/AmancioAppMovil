// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: API · una función por endpoint del backend (método HTTP + URL)
// Cadena: repositories/*Repository.js → [este archivo] → apiClient.js (axios + token) → backend Flask
//
// Métodos (endpoint → archivo del backend):
//   mia()  GET /asistencia/mia  → asistencia_routes.py · mi_asistencia()  roles: ALUMNO
//   deSeccion()  GET /asistencia/seccion/${idSeccion}  → asistencia_routes.py · de_seccion()  roles: AUXILIAR,
//       DOCENTE, ADMIN
//   resumen()  GET /asistencia/seccion/${idSeccion}/resumen  → asistencia_routes.py · resumen_de_seccion()
//       roles: AUXILIAR, DOCENTE, ADMIN
//   registrarLote()  POST /asistencia/lote  → asistencia_routes.py · registrar_lote()  roles: AUXILIAR
//
// Para modificar:
//   • Endpoint nuevo: nombre: async (id, datos) => (await apiClient.patch(`/x/${id}/accion`, datos)).data,
//   • Con filtro ?campo=: apiClient.get('/x', { params: { campo } })  (si campo es undefined no se envía).
//   • La URL y el método deben ser IGUALES a los del @bp.metodo("...") del backend (si no: 404/405).
//   • Después expórtalo en el repository: metodo: XApi.metodo (acciones) o fuente('clave', ...) (consultas).
// <<< FIN GUÍA
import apiClient, { conIdOperacion } from './apiClient';

/** Endpoints de asistencia. */
export const AsistenciaApi = {
  // PISTA: GET /asistencia/mia → backend: asistencia_routes.py · mi_asistencia() · roles: ALUMNO
  // PISTA: lo usa: AsistenciaRepository.mia
  /** GET /asistencia/mia (alumno) → { registros: [{ fecha, estado }], resumen: { P, T, F, J } } */
  mia: async () => (await apiClient.get('/asistencia/mia')).data,

  // PISTA: GET /asistencia/seccion/${idSeccion} → backend: asistencia_routes.py · de_seccion() · roles:
  //     AUXILIAR, DOCENTE, ADMIN
  // PISTA: lo usa: AsistenciaRepository.deSeccion
  /** GET /asistencia/seccion/<id>?fecha=AAAA-MM-DD → { seccion, fecha, registrada, registros } */
  deSeccion: async (idSeccion, fecha) =>
    (await apiClient.get(`/asistencia/seccion/${idSeccion}`, { params: { fecha } })).data,

  // PISTA: GET /asistencia/seccion/${idSeccion}/resumen → backend: asistencia_routes.py · resumen_de_seccion() ·
  //     roles: AUXILIAR, DOCENTE, ADMIN
  // PISTA: lo usa: AsistenciaRepository.resumen, AsistenciaRepository.alumnosDeSeccion
  /**
   * GET /asistencia/seccion/<id>/resumen?desde=&hasta= → { seccion, alumnos: [{ P, T, F, J, porcentaje }] }
   * Incluye a TODOS los alumnos matriculados en la sección (aunque no tengan registros),
   * por eso también se usa para obtener la lista de alumnos de una sección.
   */
  resumen: async (idSeccion, desde, hasta) =>
    (await apiClient.get(`/asistencia/seccion/${idSeccion}/resumen`, { params: { desde, hasta } })).data,

  // PISTA: POST /asistencia/lote → backend: asistencia_routes.py · registrar_lote() · roles: AUXILIAR
  // PISTA: lo usa: AsistenciaRepository.registrarLote, ColaRepository.ASISTENCIA
  /**
   * POST /asistencia/lote → { id_seccion, fecha, registros: [{ id_alumno, estado, observacion }] }
   * Guarda la asistencia completa de la sección en una sola operación. Admite modo sin conexión.
   */
  registrarLote: async (datos, idOperacion) =>
    (await apiClient.post('/asistencia/lote', datos, conIdOperacion(idOperacion))).data,
};

export default AsistenciaApi;
