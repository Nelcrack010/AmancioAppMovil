// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: REPOSITORY · de dónde salen los datos: caché del celular, la API o la cola sin conexión
// Cadena: vistas/viewmodels → [este archivo] → services/api/*Api.js → backend
//
// Métodos (→ endpoint · lo usan):
//   faltas()  → GET /conducta/faltas  · lo usan: RegistrarReporteView.jsx, CatalogoFaltasView.jsx
//   estadoAlumno()  → GET /conducta/alumno/${idAlumno}  · lo usan: ConductaAlumnoView.jsx
//   miConducta()  → GET /perfil/mi-perfil/${encodeURIComponent(username)}, GET /conducta/alumno/${idAlumno}  ·
//       lo usan: MiConductaView.jsx
//   anularReporte()  → PATCH /conducta/reportes/${idReporte}/anular  · lo usan: ConductaAlumnoView.jsx
//   registrarReporte()  → POST /conducta/reportes  · lo usan: RegistrarReporteView.jsx
//   misCitas()  → GET /citas/mis-citas  · lo usan: MisCitasView.jsx
//   agenda()  → GET /citas/agenda  · lo usan: AgendaView.jsx
//   historialCitas()  → GET /citas/alumno/${idAlumno}  · lo usan: HistorialAlumnoView.jsx
//   programarCita()  → PATCH /citas/${idCita}/programar  · lo usan: CitaDetalleView.jsx
//   completarCita()  → PATCH /citas/${idCita}/completar  · lo usan: CitaDetalleView.jsx
//   cancelarCita()  → PATCH /citas/${idCita}/cancelar  · lo usan: CitaDetalleView.jsx
//   solicitarCita()  → POST /citas  · lo usan: SolicitarCitaView.jsx
//
// Para modificar:
//   • CONSULTA (mostrar datos): metodo: (a) => fuente(`clave:${a}`, () => XApi.metodo(a)),
//     la clave de caché debe cambiar si cambia el parámetro (si no, se ven datos de otro filtro).
//   • ACCIÓN (guardar/borrar): metodo: XApi.metodo,   (se pasa tal cual).
//   • Que funcione sin conexión: ColaRepository.enviar('TIPO', payload, descripcion) + agregar TIPO en ENVIOS
//       (colaRepository.js).
// <<< FIN GUÍA
import ConductaApi from '../services/api/conductaApi';
import PerfilApi from '../services/api/perfilApi';
import { fuente } from './cacheRepository';
import ColaRepository from './colaRepository';

/** ConductaRepository: conducta (faltas y reportes) y citas de psicología. */
export const ConductaRepository = {
  // --- Conducta ---------------------------------------------------------------------------
  // PISTA: faltas() → GET /conducta/faltas (backend: conducta_routes.py → faltas()) · caché «faltas» · lo usan:
  //     RegistrarReporteView.jsx, CatalogoFaltasView.jsx
  faltas: () => fuente('faltas', ConductaApi.faltas),
  // PISTA: estadoAlumno() → GET /conducta/alumno/<int:id_alumno> (backend: conducta_routes.py →
  //     estado_conducta()) · caché «conducta:${idAlumno}» · lo usan: ConductaAlumnoView.jsx
  estadoAlumno: (idAlumno) => fuente(`conducta:${idAlumno}`, () => ConductaApi.estadoAlumno(idAlumno)),

  // PISTA: miConducta() → GET /perfil/mi-perfil/<username> (backend: perfil_routes.py → mi_perfil()); GET
  //     /conducta/alumno/<int:id_alumno> (backend: conducta_routes.py → estado_conducta()) · caché «mi-conducta»
  //     · lo usan: MiConductaView.jsx
  /** Conducta del estudiante que inició sesión (primero se averigua su id_alumno en su perfil). */
  miConducta: (username) => fuente('mi-conducta', async () => {
    const perfil = await PerfilApi.miPerfil(username);
    return ConductaApi.estadoAlumno(perfil.datos.id_alumno);
  }),
  // PISTA: anularReporte() → PATCH /conducta/reportes/<int:id_reporte>/anular (backend: conducta_routes.py →
  //     anular_reporte()) · lo usan: ConductaAlumnoView.jsx
  anularReporte: ConductaApi.anularReporte,

  // PISTA: registrarReporte() → POST /conducta/reportes (backend: conducta_routes.py → registrar_reporte()) ·
  //     sin conexión: cola REPORTE_CONDUCTA · lo usan: RegistrarReporteView.jsx
  /** Registra un reporte de conducta (admite modo sin conexión). */
  registrarReporte: (datos, descripcion) => ColaRepository.enviar('REPORTE_CONDUCTA', datos, descripcion),

  // --- Citas de psicología ----------------------------------------------------------------
  // PISTA: misCitas() → GET /citas/mis-citas (backend: cita_routes.py → mis_citas()) · caché «mis-citas» · lo
  //     usan: MisCitasView.jsx
  misCitas: () => fuente('mis-citas', ConductaApi.misCitas),
  // PISTA: agenda() → GET /citas/agenda (backend: cita_routes.py → agenda()) · caché «agenda:${fecha}» · lo
  //     usan: AgendaView.jsx
  agenda: (fecha) => fuente(`agenda:${fecha}`, () => ConductaApi.agenda(fecha)),
  // PISTA: historialCitas() → GET /citas/alumno/<int:id_alumno> (backend: cita_routes.py →
  //     historial_de_alumno()) · caché «historial-citas:${idAlumno}» · lo usan: HistorialAlumnoView.jsx
  historialCitas: (idAlumno) => fuente(`historial-citas:${idAlumno}`, () => ConductaApi.historialCitas(idAlumno)),
  // PISTA: programarCita() → PATCH /citas/<int:id_cita>/programar (backend: cita_routes.py → programar()) · lo
  //     usan: CitaDetalleView.jsx
  programarCita: ConductaApi.programarCita,
  // PISTA: completarCita() → PATCH /citas/<int:id_cita>/completar (backend: cita_routes.py → completar()) · lo
  //     usan: CitaDetalleView.jsx
  completarCita: ConductaApi.completarCita,
  // PISTA: cancelarCita() → PATCH /citas/<int:id_cita>/cancelar (backend: cita_routes.py → cancelar()) · lo
  //     usan: CitaDetalleView.jsx
  cancelarCita: ConductaApi.cancelarCita,

  // PISTA: solicitarCita() → POST /citas (backend: cita_routes.py → solicitar()) · sin conexión: cola
  //     SOLICITUD_CITA · lo usan: SolicitarCitaView.jsx
  /** El alumno solicita una cita (admite modo sin conexión). */
  solicitarCita: (datos) => ColaRepository.enviar('SOLICITUD_CITA', datos, 'Solicitud de cita de psicología'),
};

export default ConductaRepository;
