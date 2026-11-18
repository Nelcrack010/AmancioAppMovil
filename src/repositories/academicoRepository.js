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
  tarea: (idTarea) => fuente(`tarea:${idTarea}`, () => CursosApi.tarea(idTarea)),
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
  /**
   * Entrega una tarea con un archivo y/o un enlace (admite modo sin conexión).
   * En el celular el archivo queda copiado en la app, así que se puede enviar después.
   * En el navegador no se puede guardar el archivo para después: se envía directamente.
   */
  entregarTarea: async (idTarea, datos, descripcion, archivo = null) => {
    if (archivo?.file) {
      return { enviado: true, respuesta: await CursosApi.entregarTarea(idTarea, datos, null, archivo) };
    }
    const paraLaCola = archivo && { uri: archivo.uri, nombre: archivo.nombre, tipo: archivo.tipo, tamano: archivo.tamano };
    return ColaRepository.enviar('ENTREGA_TAREA', { id_tarea: idTarea, datos, archivo: paraLaCola }, descripcion);
  },
};

export default AcademicoRepository;
