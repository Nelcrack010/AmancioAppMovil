import apiClient, { conIdOperacion, postConArchivo } from './apiClient';

/**
 * Endpoints del aula virtual: cursos, materiales, clases virtuales y tareas.
 * Un "curso" es una carga académica (id_carga): un curso dictado por un docente
 * en una sección durante el año.
 */
export const CursosApi = {
  // --- Cursos ----------------------------------------------------------------------
  /** GET /cursos/mis-cursos (alumno: los de su sección; docente: los que dicta) */
  misCursos: async () => (await apiClient.get('/cursos/mis-cursos')).data,

  /** GET /cursos/<id_carga>/alumnos (docente del curso) */
  alumnos: async (idCarga) => (await apiClient.get(`/cursos/${idCarga}/alumnos`)).data,

  // --- Materiales ------------------------------------------------------------------
  materiales: async (idCarga) => (await apiClient.get(`/material/${idCarga}`)).data,
  publicarMaterial: async (idCarga, datos) => (await apiClient.post(`/material/${idCarga}`, datos)).data,
  editarMaterial: async (idMaterial, datos) => (await apiClient.put(`/material/item/${idMaterial}`, datos)).data,
  eliminarMaterial: async (idMaterial) => (await apiClient.delete(`/material/item/${idMaterial}`)).data,

  // --- Clases virtuales ------------------------------------------------------------
  clases: async (idCarga) => (await apiClient.get(`/clases/${idCarga}`)).data,
  crearClase: async (idCarga, datos) => (await apiClient.post(`/clases/${idCarga}`, datos)).data,
  editarClase: async (idClase, datos) => (await apiClient.put(`/clases/item/${idClase}`, datos)).data,
  eliminarClase: async (idClase) => (await apiClient.delete(`/clases/item/${idClase}`)).data,

  // --- Tareas ----------------------------------------------------------------------
  tarea: async (idTarea) => (await apiClient.get(`/tareas/item/${idTarea}`)).data,
  tareas: async (idCarga) => (await apiClient.get(`/tareas/${idCarga}`)).data,
  /** POST /tareas/<id_carga> → { titulo, fecha_entrega, bimestre, ... } + archivo del enunciado (opcional) */
  publicarTarea: async (idCarga, datos, archivo = null) =>
    (await postConArchivo(`/tareas/${idCarga}`, datos, archivo)).data,
  eliminarTarea: async (idTarea) => (await apiClient.delete(`/tareas/item/${idTarea}`)).data,

  /**
   * POST /tareas/item/<id>/entregar → { archivo_url?, comentario? } + archivo (opcional).
   * Hace falta el archivo o el enlace. Admite modo sin conexión.
   */
  entregarTarea: async (idTarea, datos, idOperacion, archivo = null) =>
    (await postConArchivo(`/tareas/item/${idTarea}/entregar`, datos, archivo, conIdOperacion(idOperacion))).data,

  /** GET /tareas/item/<id>/entregas (docente) → { tarea, resumen, alumnos } */
  entregas: async (idTarea) => (await apiClient.get(`/tareas/item/${idTarea}/entregas`)).data,

  /** PATCH /tareas/entregas/<id>/calificar → { calificacion, observacion } */
  calificarEntrega: async (idEntrega, datos) =>
    (await apiClient.patch(`/tareas/entregas/${idEntrega}/calificar`, datos)).data,
};

export default CursosApi;
