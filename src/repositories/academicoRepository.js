// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: REPOSITORY · de dónde salen los datos: caché del celular, la API o la cola sin conexión
// Cadena: vistas/viewmodels → [este archivo] → services/api/*Api.js → backend
//
// Métodos (→ endpoint · lo usan):
//   inicio()  → GET /inicio  · lo usan: InicioView.jsx
//   anioActivo()  → GET /academico/anio-activo  · lo usan: useNotasCursoViewModel.js, MisNotasView.jsx,
//       PublicarView.jsx
//   secciones()  → GET /academico/secciones  · lo usan: useRegistroAsistenciaViewModel.js, ConductaView.jsx,
//       ReporteAsistenciaView.jsx
//   horario()  → GET /horario/mi-horario  · lo usan: HorarioView.jsx
//   misCursos()  → GET /cursos/mis-cursos  · lo usan: CursosView.jsx
//   alumnosDeCurso()  → GET /cursos/${idCarga}/alumnos  · lo usan: PestanaAlumnos.jsx
//   materiales()  → GET /material/${idCarga}  · lo usan: PestanaMateriales.jsx
//   clases()  → GET /clases/${idCarga}  · lo usan: PestanaClases.jsx
//   tareas()  → GET /tareas/${idCarga}  · lo usan: PestanaTareas.jsx
//   tarea()  → GET /tareas/item/${idTarea}  · lo usan: TareaDetalleView.jsx
//   entregas()  → GET /tareas/item/${idTarea}/entregas  · lo usan: EntregasView.jsx
//   misNotas()  → GET /notas/mis-notas  · lo usan: MisNotasView.jsx
//   miLibreta()  → GET /notas/mi-libreta  · lo usan: MisNotasView.jsx
//   notasDelCurso()  → GET /notas/${idCarga}  · lo usan: useNotasCursoViewModel.js
//   publicarMaterial()  → POST /material/${idCarga}  · lo usan: PublicarView.jsx
//   editarMaterial()  → PUT /material/item/${idMaterial}  · lo usan: PublicarView.jsx
//   eliminarMaterial()  → DELETE /material/item/${idMaterial}  · lo usan: PestanaMateriales.jsx
//   crearClase()  → POST /clases/${idCarga}  · lo usan: PublicarView.jsx
//   editarClase()  → PUT /clases/item/${idClase}  · lo usan: PublicarView.jsx
//   eliminarClase()  → DELETE /clases/item/${idClase}  · lo usan: PestanaClases.jsx
//   publicarTarea()  → POST /tareas/${idCarga}  · lo usan: PublicarView.jsx
//   eliminarTarea()  → DELETE /tareas/item/${idTarea}  · lo usan: PestanaTareas.jsx
//   calificarEntrega()  → PATCH /tareas/entregas/${idEntrega}/calificar  · lo usan: CalificarEntregaView.jsx
//   cerrarBimestre()  → POST /notas/${idCarga}/cerrar-bimestre  · lo usan: useNotasCursoViewModel.js
//   registrarNotas()  → POST /notas/${idCarga}  · lo usan: useNotasCursoViewModel.js
//   entregarTarea()  → POST /tareas/item/${idTarea}/entregar  · lo usan: TareaDetalleView.jsx
//
// Para modificar:
//   • CONSULTA (mostrar datos): metodo: (a) => fuente(`clave:${a}`, () => XApi.metodo(a)),
//     la clave de caché debe cambiar si cambia el parámetro (si no, se ven datos de otro filtro).
//   • ACCIÓN (guardar/borrar): metodo: XApi.metodo,   (se pasa tal cual).
//   • Que funcione sin conexión: ColaRepository.enviar('TIPO', payload, descripcion) + agregar TIPO en ENVIOS
//       (colaRepository.js).
// <<< FIN GUÍA
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
  // PISTA: inicio() → GET /inicio (backend: inicio_routes.py → panel()) · caché «inicio» · lo usan:
  //     InicioView.jsx
  inicio: () => fuente('inicio', PerfilApi.inicio),
  // PISTA: anioActivo() → GET /academico/anio-activo (backend: academico_routes.py → anio_activo()) · caché
  //     «anio-activo» · lo usan: useNotasCursoViewModel.js, MisNotasView.jsx, PublicarView.jsx
  anioActivo: () => fuente('anio-activo', AcademicoApi.anioActivo),
  // PISTA: secciones() → GET /academico/secciones (backend: academico_routes.py → secciones()) · caché
  //     «secciones» · lo usan: useRegistroAsistenciaViewModel.js, ConductaView.jsx, ReporteAsistenciaView.jsx
  secciones: () => fuente('secciones', AcademicoApi.secciones),
  // PISTA: horario() → GET /horario/mi-horario (backend: horario_routes.py → mi_horario()) · caché «horario» ·
  //     lo usan: HorarioView.jsx
  horario: () => fuente('horario', AcademicoApi.miHorario),
  // PISTA: misCursos() → GET /cursos/mis-cursos (backend: cursos_routes.py → mis_cursos()) · caché «mis-cursos»
  //     · lo usan: CursosView.jsx
  misCursos: () => fuente('mis-cursos', CursosApi.misCursos),
  // PISTA: alumnosDeCurso() → GET /cursos/<int:id_carga>/alumnos (backend: cursos_routes.py →
  //     alumnos_del_curso()) · caché «alumnos:${idCarga}» · lo usan: PestanaAlumnos.jsx
  alumnosDeCurso: (idCarga) => fuente(`alumnos:${idCarga}`, () => CursosApi.alumnos(idCarga)),
  // PISTA: materiales() → GET /material/<int:id_carga> (backend: material_routes.py → listar()) · caché
  //     «materiales:${idCarga}» · lo usan: PestanaMateriales.jsx
  materiales: (idCarga) => fuente(`materiales:${idCarga}`, () => CursosApi.materiales(idCarga)),
  // PISTA: clases() → GET /clases/<int:id_carga> (backend: clase_routes.py → listar()) · caché
  //     «clases:${idCarga}» · lo usan: PestanaClases.jsx
  clases: (idCarga) => fuente(`clases:${idCarga}`, () => CursosApi.clases(idCarga)),
  // PISTA: tareas() → GET /tareas/<int:id_carga> (backend: tarea_routes.py → listar()) · caché
  //     «tareas:${idCarga}» · lo usan: PestanaTareas.jsx
  tareas: (idCarga) => fuente(`tareas:${idCarga}`, () => CursosApi.tareas(idCarga)),
  // PISTA: tarea() → GET /tareas/item/<int:id_tarea> (backend: tarea_routes.py → obtener()) · caché
  //     «tarea:${idTarea}» · lo usan: TareaDetalleView.jsx
  tarea: (idTarea) => fuente(`tarea:${idTarea}`, () => CursosApi.tarea(idTarea)),
  // PISTA: entregas() → GET /tareas/item/<int:id_tarea>/entregas (backend: tarea_routes.py → entregas()) · caché
  //     «entregas:${idTarea}» · lo usan: EntregasView.jsx
  entregas: (idTarea) => fuente(`entregas:${idTarea}`, () => CursosApi.entregas(idTarea)),
  // PISTA: misNotas() → GET /notas/mis-notas (backend: nota_routes.py → mis_notas()) · caché
  //     «mis-notas:${bimestre}» · lo usan: MisNotasView.jsx
  misNotas: (bimestre) => fuente(`mis-notas:${bimestre}`, () => NotasApi.misNotas(bimestre)),
  // PISTA: miLibreta() → GET /notas/mi-libreta (backend: nota_routes.py → mi_libreta()) · caché «mi-libreta» ·
  //     lo usan: MisNotasView.jsx
  miLibreta: () => fuente('mi-libreta', NotasApi.miLibreta),
  // PISTA: notasDelCurso() → GET /notas/<int:id_carga> (backend: nota_routes.py → notas_del_curso()) · caché
  //     «notas:${idCarga}:${bimestre}» · lo usan: useNotasCursoViewModel.js
  notasDelCurso: (idCarga, bimestre) =>
    fuente(`notas:${idCarga}:${bimestre}`, () => NotasApi.delCurso(idCarga, bimestre)),

  // --- Acciones del docente -------------------------------------------------------------
  // PISTA: publicarMaterial() → POST /material/<int:id_carga> (backend: material_routes.py → publicar()) · lo
  //     usan: PublicarView.jsx
  publicarMaterial: CursosApi.publicarMaterial,
  // PISTA: editarMaterial() → PUT /material/item/<int:id_material> (backend: material_routes.py → editar()) · lo
  //     usan: PublicarView.jsx
  editarMaterial: CursosApi.editarMaterial,
  // PISTA: eliminarMaterial() → DELETE /material/item/<int:id_material> (backend: material_routes.py →
  //     eliminar()) · lo usan: PestanaMateriales.jsx
  eliminarMaterial: CursosApi.eliminarMaterial,
  // PISTA: crearClase() → POST /clases/<int:id_carga> (backend: clase_routes.py → crear()) · lo usan:
  //     PublicarView.jsx
  crearClase: CursosApi.crearClase,
  // PISTA: editarClase() → PUT /clases/item/<int:id_clase> (backend: clase_routes.py → editar()) · lo usan:
  //     PublicarView.jsx
  editarClase: CursosApi.editarClase,
  // PISTA: eliminarClase() → DELETE /clases/item/<int:id_clase> (backend: clase_routes.py → eliminar()) · lo
  //     usan: PestanaClases.jsx
  eliminarClase: CursosApi.eliminarClase,
  // PISTA: publicarTarea() → POST /tareas/<int:id_carga> (backend: tarea_routes.py → publicar()) · lo usan:
  //     PublicarView.jsx
  publicarTarea: CursosApi.publicarTarea,
  // PISTA: eliminarTarea() → DELETE /tareas/item/<int:id_tarea> (backend: tarea_routes.py → eliminar()) · lo
  //     usan: PestanaTareas.jsx
  eliminarTarea: CursosApi.eliminarTarea,
  // PISTA: calificarEntrega() → PATCH /tareas/entregas/<int:id_entrega>/calificar (backend: tarea_routes.py →
  //     calificar()) · lo usan: CalificarEntregaView.jsx
  calificarEntrega: CursosApi.calificarEntrega,
  // PISTA: cerrarBimestre() → POST /notas/<int:id_carga>/cerrar-bimestre (backend: nota_routes.py →
  //     cerrar_bimestre()) · lo usan: useNotasCursoViewModel.js
  cerrarBimestre: NotasApi.cerrarBimestre,

  // PISTA: registrarNotas() → POST /notas/<int:id_carga> (backend: nota_routes.py → registrar_notas()) · sin
  //     conexión: cola NOTAS · lo usan: useNotasCursoViewModel.js
  /** Registra las notas de una evaluación (admite modo sin conexión). */
  registrarNotas: (idCarga, datos, descripcion) =>
    ColaRepository.enviar('NOTAS', { id_carga: idCarga, datos }, descripcion),

  // --- Acciones del alumno --------------------------------------------------------------
  // PISTA: entregarTarea() → POST /tareas/item/<int:id_tarea>/entregar (backend: tarea_routes.py → entregar()) ·
  //     sin conexión: cola ENTREGA_TAREA · lo usan: TareaDetalleView.jsx
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
