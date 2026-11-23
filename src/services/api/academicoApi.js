// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: API · una función por endpoint del backend (método HTTP + URL)
// Cadena: repositories/*Repository.js → [este archivo] → apiClient.js (axios + token) → backend Flask
//
// Métodos (endpoint → archivo del backend):
//   anioActivo()  GET /academico/anio-activo  → academico_routes.py · anio_activo()  roles: cualquiera con
//       sesión
//   secciones()  GET /academico/secciones  → academico_routes.py · secciones()  roles: cualquiera con sesión
//   miHorario()  GET /horario/mi-horario  → horario_routes.py · mi_horario()  roles: ALUMNO, DOCENTE
//
// Para modificar:
//   • Endpoint nuevo: nombre: async (id, datos) => (await apiClient.patch(`/x/${id}/accion`, datos)).data,
//   • Con filtro ?campo=: apiClient.get('/x', { params: { campo } })  (si campo es undefined no se envía).
//   • La URL y el método deben ser IGUALES a los del @bp.metodo("...") del backend (si no: 404/405).
//   • Después expórtalo en el repository: metodo: XApi.metodo (acciones) o fuente('clave', ...) (consultas).
// <<< FIN GUÍA
import apiClient from './apiClient';

/** Endpoints de consulta académica: año escolar, secciones y horario. */
export const AcademicoApi = {
  // PISTA: GET /academico/anio-activo → backend: academico_routes.py · anio_activo() · roles: cualquiera con
  //     sesión
  // PISTA: lo usa: AcademicoRepository.anioActivo
  /** GET /academico/anio-activo → año escolar con sus 4 bimestres */
  anioActivo: async () => (await apiClient.get('/academico/anio-activo')).data,

  // PISTA: GET /academico/secciones → backend: academico_routes.py · secciones() · roles: cualquiera con sesión
  // PISTA: lo usa: AcademicoRepository.secciones
  /** GET /academico/secciones → secciones del año actual [{ id_seccion, grado, nombre, nivel }] */
  secciones: async () => (await apiClient.get('/academico/secciones')).data,

  // PISTA: GET /horario/mi-horario → backend: horario_routes.py · mi_horario() · roles: ALUMNO, DOCENTE
  // PISTA: lo usa: AcademicoRepository.horario
  /** GET /horario/mi-horario → { dias: [{ dia, bloques: [...] }], recesos } (alumno o docente) */
  miHorario: async () => (await apiClient.get('/horario/mi-horario')).data,
};

export default AcademicoApi;
