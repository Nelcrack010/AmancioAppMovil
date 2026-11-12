import AcademicoApi from '../services/api/academicoApi';
import CursosApi from '../services/api/cursosApi';
import NotasApi from '../services/api/notasApi';
import PerfilApi from '../services/api/perfilApi';
import { fuente } from './cacheRepository';
import ColaRepository from './colaRepository';

/**
 * AcademicoRepository: inicio, horario, cursos (aula virtual) y notas.
 *
 * Las CONSULTAS devuelven una fuente (ver cacheRepository.js) para que la pantalla
 * muestre primero lo guardado en el celular. Las ACCIONES llaman a la API; las que
 * admiten modo sin conexión pasan por ColaRepository.
 */
export const AcademicoRepository = {
  // --- Consultas ----------------------------------------------------------------------
  inicio: () => fuente('inicio', PerfilApi.inicio),
  anioActivo: () => fuente('anio-activo', AcademicoApi.anioActivo),
  secciones: () => fuente('secciones', AcademicoApi.secciones),
  horario: () => fuente('horario', AcademicoApi.miHorario),
  misCursos: () => fuente('mis-cursos', CursosApi.misCursos),
  alumnosDeCurso: (idCarga) => fuente(`alumnos:${idCarga}`, () => CursosApi.alumnos(idCarga)),
  materiales: (idCarga) => fuente(`materiales:${idCarga}`, () => CursosApi.materiales(idCarga)),
  clases: (idCarga) => fuente(`clases:${idCarga}`, () => CursosApi.clases(idCarga)),
  tareas: (idCarga) => fuente(`tareas:${idCarga}`, () => CursosApi.tareas(idCarga)),
  entregas: (idTarea) => fuente(`entregas:${idTarea}`, () => CursosApi.entregas(idTarea)),
  misNotas: (bimestre) => fuente(`mis-notas:${bimestre}`, () => NotasApi.misNotas(bimestre)),
  miLibreta: () => fuente('mi-libreta', NotasApi.miLibreta),
  notasDelCurso: (idCarga, bimestre) =>
    fuente(`notas:${idCarga}:${bimestre}`, () => NotasApi.delCurso(idCarga, bimestre)),

  // --- Acciones del docente -------------------------------------------------------------
  publicarMaterial: CursosApi.publicarMaterial,
  editarMaterial: CursosApi.editarMaterial,
  eliminarMaterial: CursosApi.eliminarMaterial,
  crearClase: CursosApi.crearClase,
  editarClase: CursosApi.editarClase,
  eliminarClase: CursosApi.eliminarClase,
  publicarTarea: CursosApi.publicarTarea,
  eliminarTarea: CursosApi.eliminarTarea,
  calificarEntrega: CursosApi.calificarEntrega,
  cerrarBimestre: NotasApi.cerrarBimestre,

  /** Registra las notas de una evaluación (admite modo sin conexión). */
  registrarNotas: (idCarga, datos, descripcion) =>
    ColaRepository.enviar('NOTAS', { id_carga: idCarga, datos }, descripcion),

  // --- Acciones del alumno --------------------------------------------------------------
  /** Entrega una tarea con el enlace del trabajo (admite modo sin conexión). */
  entregarTarea: (idTarea, datos, descripcion) =>
    ColaRepository.enviar('ENTREGA_TAREA', { id_tarea: idTarea, datos }, descripcion),
};

export default AcademicoRepository;
