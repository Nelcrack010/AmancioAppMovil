// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: API · una función por endpoint del backend (método HTTP + URL)
// Cadena: repositories/*Repository.js → [este archivo] → apiClient.js (axios + token) → backend Flask
//
// Métodos (endpoint → archivo del backend):
//   misCursos()  GET /cursos/mis-cursos  → cursos_routes.py · mis_cursos()  roles: ALUMNO, DOCENTE
//   alumnos()  GET /cursos/${idCarga}/alumnos  → cursos_routes.py · alumnos_del_curso()  roles: DOCENTE, ADMIN
//   materiales()  GET /material/${idCarga}  → material_routes.py · listar()  roles: cualquiera con sesión
//   publicarMaterial()  POST /material/${idCarga}  → material_routes.py · publicar()  roles: DOCENTE
//   editarMaterial()  PUT /material/item/${idMaterial}  → material_routes.py · editar()  roles: DOCENTE
//   eliminarMaterial()  DELETE /material/item/${idMaterial}  → material_routes.py · eliminar()  roles: DOCENTE
//   clases()  GET /clases/${idCarga}  → clase_routes.py · listar()  roles: cualquiera con sesión
//   crearClase()  POST /clases/${idCarga}  → clase_routes.py · crear()  roles: DOCENTE
//   editarClase()  PUT /clases/item/${idClase}  → clase_routes.py · editar()  roles: DOCENTE
//   eliminarClase()  DELETE /clases/item/${idClase}  → clase_routes.py · eliminar()  roles: DOCENTE
//   tarea()  GET /tareas/item/${idTarea}  → tarea_routes.py · obtener()  roles: cualquiera con sesión
//   tareas()  GET /tareas/${idCarga}  → tarea_routes.py · listar()  roles: cualquiera con sesión
//   publicarTarea()  POST /tareas/${idCarga}  → tarea_routes.py · publicar()  roles: DOCENTE
//   eliminarTarea()  DELETE /tareas/item/${idTarea}  → tarea_routes.py · eliminar()  roles: DOCENTE
//   entregarTarea()  POST /tareas/item/${idTarea}/entregar  → tarea_routes.py · entregar()  roles: ALUMNO
//   entregas()  GET /tareas/item/${idTarea}/entregas  → tarea_routes.py · entregas()  roles: DOCENTE
//   calificarEntrega()  PATCH /tareas/entregas/${idEntrega}/calificar  → tarea_routes.py · calificar()  roles:
//       DOCENTE
//
// Para modificar:
//   • Endpoint nuevo: nombre: async (id, datos) => (await apiClient.patch(`/x/${id}/accion`, datos)).data,
//   • Con filtro ?campo=: apiClient.get('/x', { params: { campo } })  (si campo es undefined no se envía).
//   • La URL y el método deben ser IGUALES a los del @bp.metodo("...") del backend (si no: 404/405).
//   • Después expórtalo en el repository: metodo: XApi.metodo (acciones) o fuente('clave', ...) (consultas).
// <<< FIN GUÍA
import apiClient, { conIdOperacion, postConArchivo } from './apiClient';

/**
 * Endpoints del aula virtual: cursos, materiales, clases virtuales y tareas.
 * Un "curso" es una carga académica (id_carga): un curso dictado por un docente
 * en una sección durante el año.
 */
export const CursosApi = {
  // --- Cursos ----------------------------------------------------------------------
  // PISTA: GET /cursos/mis-cursos → backend: cursos_routes.py · mis_cursos() · roles: ALUMNO, DOCENTE
  // PISTA: lo usa: AcademicoRepository.misCursos
  /** GET /cursos/mis-cursos (alumno: los de su sección; docente: los que dicta) */
  misCursos: async () => (await apiClient.get('/cursos/mis-cursos')).data,

  // PISTA: GET /cursos/${idCarga}/alumnos → backend: cursos_routes.py · alumnos_del_curso() · roles: DOCENTE,
  //     ADMIN
  // PISTA: lo usa: AcademicoRepository.alumnosDeCurso
  /** GET /cursos/<id_carga>/alumnos (docente del curso) */
  alumnos: async (idCarga) => (await apiClient.get(`/cursos/${idCarga}/alumnos`)).data,

  // --- Materiales ------------------------------------------------------------------
  // PISTA: GET /material/${idCarga} → backend: material_routes.py · listar() · roles: cualquiera con sesión
  // PISTA: lo usa: AcademicoRepository.materiales
  materiales: async (idCarga) => (await apiClient.get(`/material/${idCarga}`)).data,
  // PISTA: POST /material/${idCarga} → backend: material_routes.py · publicar() · roles: DOCENTE
  // PISTA: lo usa: AcademicoRepository.publicarMaterial
  publicarMaterial: async (idCarga, datos) => (await apiClient.post(`/material/${idCarga}`, datos)).data,
  // PISTA: PUT /material/item/${idMaterial} → backend: material_routes.py · editar() · roles: DOCENTE
  // PISTA: lo usa: AcademicoRepository.editarMaterial
  editarMaterial: async (idMaterial, datos) => (await apiClient.put(`/material/item/${idMaterial}`, datos)).data,
  // PISTA: DELETE /material/item/${idMaterial} → backend: material_routes.py · eliminar() · roles: DOCENTE
  // PISTA: lo usa: AcademicoRepository.eliminarMaterial
  eliminarMaterial: async (idMaterial) => (await apiClient.delete(`/material/item/${idMaterial}`)).data,

  // --- Clases virtuales ------------------------------------------------------------
  // PISTA: GET /clases/${idCarga} → backend: clase_routes.py · listar() · roles: cualquiera con sesión
  // PISTA: lo usa: AcademicoRepository.clases
  clases: async (idCarga) => (await apiClient.get(`/clases/${idCarga}`)).data,
  // PISTA: POST /clases/${idCarga} → backend: clase_routes.py · crear() · roles: DOCENTE
  // PISTA: lo usa: AcademicoRepository.crearClase
  crearClase: async (idCarga, datos) => (await apiClient.post(`/clases/${idCarga}`, datos)).data,
  // PISTA: PUT /clases/item/${idClase} → backend: clase_routes.py · editar() · roles: DOCENTE
  // PISTA: lo usa: AcademicoRepository.editarClase
  editarClase: async (idClase, datos) => (await apiClient.put(`/clases/item/${idClase}`, datos)).data,
  // PISTA: DELETE /clases/item/${idClase} → backend: clase_routes.py · eliminar() · roles: DOCENTE
  // PISTA: lo usa: AcademicoRepository.eliminarClase
  eliminarClase: async (idClase) => (await apiClient.delete(`/clases/item/${idClase}`)).data,

  // --- Tareas ----------------------------------------------------------------------
  // PISTA: GET /tareas/item/${idTarea} → backend: tarea_routes.py · obtener() · roles: cualquiera con sesión
  // PISTA: lo usa: AcademicoRepository.tarea
  tarea: async (idTarea) => (await apiClient.get(`/tareas/item/${idTarea}`)).data,
  // PISTA: GET /tareas/${idCarga} → backend: tarea_routes.py · listar() · roles: cualquiera con sesión
  // PISTA: lo usa: AcademicoRepository.tareas
  tareas: async (idCarga) => (await apiClient.get(`/tareas/${idCarga}`)).data,
  // PISTA: POST /tareas/${idCarga} → backend: tarea_routes.py · publicar() · roles: DOCENTE
  // PISTA: lo usa: AcademicoRepository.publicarTarea
  /** POST /tareas/<id_carga> → { titulo, fecha_entrega, bimestre, ... } + archivo del enunciado (opcional) */
  publicarTarea: async (idCarga, datos, archivo = null) =>
    (await postConArchivo(`/tareas/${idCarga}`, datos, archivo)).data,
  // PISTA: DELETE /tareas/item/${idTarea} → backend: tarea_routes.py · eliminar() · roles: DOCENTE
  // PISTA: lo usa: AcademicoRepository.eliminarTarea
  eliminarTarea: async (idTarea) => (await apiClient.delete(`/tareas/item/${idTarea}`)).data,

  // PISTA: POST /tareas/item/${idTarea}/entregar → backend: tarea_routes.py · entregar() · roles: ALUMNO
  // PISTA: lo usa: AcademicoRepository.entregarTarea, ColaRepository.ENTREGA_TAREA
  /**
   * POST /tareas/item/<id>/entregar → { archivo_url?, comentario? } + archivo (opcional).
   * Hace falta el archivo o el enlace. Admite modo sin conexión.
   */
  entregarTarea: async (idTarea, datos, idOperacion, archivo = null) =>
    (await postConArchivo(`/tareas/item/${idTarea}/entregar`, datos, archivo, conIdOperacion(idOperacion))).data,

  // PISTA: GET /tareas/item/${idTarea}/entregas → backend: tarea_routes.py · entregas() · roles: DOCENTE
  // PISTA: lo usa: AcademicoRepository.entregas
  /** GET /tareas/item/<id>/entregas (docente) → { tarea, resumen, alumnos } */
  entregas: async (idTarea) => (await apiClient.get(`/tareas/item/${idTarea}/entregas`)).data,

  // PISTA: PATCH /tareas/entregas/${idEntrega}/calificar → backend: tarea_routes.py · calificar() · roles:
  //     DOCENTE
  // PISTA: lo usa: AcademicoRepository.calificarEntrega
  /** PATCH /tareas/entregas/<id>/calificar → { calificacion, observacion } */
  calificarEntrega: async (idEntrega, datos) =>
    (await apiClient.patch(`/tareas/entregas/${idEntrega}/calificar`, datos)).data,
};

export default CursosApi;
