// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: API · una función por endpoint del backend (método HTTP + URL)
// Cadena: repositories/*Repository.js → [este archivo] → apiClient.js (axios + token) → backend Flask
//
// Métodos (endpoint → archivo del backend):
//   misNotas()  GET /notas/mis-notas  → nota_routes.py · mis_notas()  roles: ALUMNO
//   miLibreta()  GET /notas/mi-libreta  → nota_routes.py · mi_libreta()  roles: ALUMNO
//   delCurso()  GET /notas/${idCarga}  → nota_routes.py · notas_del_curso()  roles: DOCENTE, ADMIN
//   registrar()  POST /notas/${idCarga}  → nota_routes.py · registrar_notas()  roles: DOCENTE
//   cerrarBimestre()  POST /notas/${idCarga}/cerrar-bimestre  → nota_routes.py · cerrar_bimestre()  roles:
//       DOCENTE
//
// Para modificar:
//   • Endpoint nuevo: nombre: async (id, datos) => (await apiClient.patch(`/x/${id}/accion`, datos)).data,
//   • Con filtro ?campo=: apiClient.get('/x', { params: { campo } })  (si campo es undefined no se envía).
//   • La URL y el método deben ser IGUALES a los del @bp.metodo("...") del backend (si no: 404/405).
//   • Después expórtalo en el repository: metodo: XApi.metodo (acciones) o fuente('clave', ...) (consultas).
// <<< FIN GUÍA
import apiClient, { conIdOperacion } from './apiClient';

/** Endpoints de notas por bimestre y libreta. */
export const NotasApi = {
  // --- Alumno ----------------------------------------------------------------------
  // PISTA: GET /notas/mis-notas → backend: nota_routes.py · mis_notas() · roles: ALUMNO
  // PISTA: lo usa: AcademicoRepository.misNotas
  /** GET /notas/mis-notas?bimestre=n → { bimestre, cursos: [{ curso, evaluaciones, promedio }] } */
  misNotas: async (bimestre) => (await apiClient.get('/notas/mis-notas', { params: { bimestre } })).data,

  // PISTA: GET /notas/mi-libreta → backend: nota_routes.py · mi_libreta() · roles: ALUMNO
  // PISTA: lo usa: AcademicoRepository.miLibreta
  /** GET /notas/mi-libreta → { anio, cursos: [{ curso, nota_bimestre1..4, promedio_final }] } */
  miLibreta: async () => (await apiClient.get('/notas/mi-libreta')).data,

  // --- Docente ---------------------------------------------------------------------
  // PISTA: GET /notas/${idCarga} → backend: nota_routes.py · notas_del_curso() · roles: DOCENTE, ADMIN
  // PISTA: lo usa: AcademicoRepository.notasDelCurso
  /** GET /notas/<id_carga>?bimestre=n → { curso, bimestre, cerrado, alumnos: [...] } */
  delCurso: async (idCarga, bimestre) =>
    (await apiClient.get(`/notas/${idCarga}`, { params: { bimestre } })).data,

  // PISTA: POST /notas/${idCarga} → backend: nota_routes.py · registrar_notas() · roles: DOCENTE
  // PISTA: lo usa: AcademicoRepository.registrarNotas, ColaRepository.NOTAS
  /**
   * POST /notas/<id_carga> → { bimestre, evaluacion, notas: [{ id_alumno, valor }] }
   * Registra (o corrige) una evaluación para varios alumnos. Admite modo sin conexión.
   */
  registrar: async (idCarga, datos, idOperacion) =>
    (await apiClient.post(`/notas/${idCarga}`, datos, conIdOperacion(idOperacion))).data,

  // PISTA: POST /notas/${idCarga}/cerrar-bimestre → backend: nota_routes.py · cerrar_bimestre() · roles: DOCENTE
  // PISTA: lo usa: AcademicoRepository.cerrarBimestre
  /** POST /notas/<id_carga>/cerrar-bimestre → { bimestre } */
  cerrarBimestre: async (idCarga, bimestre) =>
    (await apiClient.post(`/notas/${idCarga}/cerrar-bimestre`, { bimestre })).data,
};

export default NotasApi;
