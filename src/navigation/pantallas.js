/**
 * Registro de TODAS las pantallas de la app.
 *
 * Para agregar una pantalla nueva:
 *   1. Crear la vista en src/views/...
 *   2. Registrarla aquí:
 *        - en PANTALLAS_MENU si se abre desde la barra de menú (y agregarla también
 *          a la lista del rol en src/config/menus.js), o
 *        - en PANTALLAS_DETALLE si se abre desde otra pantalla con navigation.navigate().
 */

// --- Comunes -------------------------------------------------------------------------------
import InicioView from '../views/inicio/InicioView';
import HorarioView from '../views/comun/HorarioView';
import NotificacionesView from '../views/comun/NotificacionesView';
import PerfilView from '../views/comun/PerfilView';
import EditarPerfilView from '../views/comun/EditarPerfilView';
import PendientesView from '../views/comun/PendientesView';
import AjustesNotificacionesView from '../views/comun/AjustesNotificacionesView';
import CatalogoFaltasView from '../views/comun/CatalogoFaltasView';
import CambiarPasswordView from '../views/auth/CambiarPasswordView';
// --- Mensajería ------------------------------------------------------------------------------
import MensajesView from '../views/mensajes/MensajesView';
import ContactosView from '../views/mensajes/ContactosView';
import ChatView from '../views/mensajes/ChatView';
// --- Cursos (alumno y docente) ---------------------------------------------------------------
import CursosView from '../views/cursos/CursosView';
import CursoDetalleView from '../views/cursos/CursoDetalleView';
import TareaDetalleView from '../views/cursos/TareaDetalleView';
import EntregasView from '../views/cursos/EntregasView';
import CalificarEntregaView from '../views/cursos/CalificarEntregaView';
import PublicarView from '../views/cursos/PublicarView';
import NotasCursoView from '../views/cursos/NotasCursoView';
// --- Alumno ----------------------------------------------------------------------------------
import MisNotasView from '../views/alumno/MisNotasView';
import MiAsistenciaView from '../views/alumno/MiAsistenciaView';
import MiConductaView from '../views/alumno/MiConductaView';
import MisCitasView from '../views/alumno/MisCitasView';
import SolicitarCitaView from '../views/alumno/SolicitarCitaView';
// --- Auxiliar (y administrador) --------------------------------------------------------------
import RegistrarAsistenciaView from '../views/auxiliar/RegistrarAsistenciaView';
import ReporteAsistenciaView from '../views/auxiliar/ReporteAsistenciaView';
import ConductaView from '../views/auxiliar/ConductaView';
import RegistrarReporteView from '../views/auxiliar/RegistrarReporteView';
import ConductaAlumnoView from '../views/auxiliar/ConductaAlumnoView';
// --- Psicólogo -------------------------------------------------------------------------------
import AgendaView from '../views/psicologo/AgendaView';
import CitaDetalleView from '../views/psicologo/CitaDetalleView';
import HistorialAlumnoView from '../views/psicologo/HistorialAlumnoView';

/** Pantallas de la barra de menú. El título lo pone src/config/menus.js. */
export const PANTALLAS_MENU = {
  Inicio: InicioView,
  Cursos: CursosView,
  MisNotas: MisNotasView,
  Mensajes: MensajesView,
  Horario: HorarioView,
  MiAsistencia: MiAsistenciaView,
  MiConducta: MiConductaView,
  MisCitas: MisCitasView,
  Notificaciones: NotificacionesView,
  Perfil: PerfilView,
  RegistrarAsistencia: RegistrarAsistenciaView,
  ReporteAsistencia: ReporteAsistenciaView,
  Conducta: ConductaView,
  CatalogoFaltas: CatalogoFaltasView,
  Agenda: AgendaView,
};

/**
 * Pantallas de detalle: se abren encima del menú (con flecha para volver).
 * `titulo` es el título por defecto; se puede cambiar al navegar con params.titulo.
 */
export const PANTALLAS_DETALLE = {
  CursoDetalle: { componente: CursoDetalleView, titulo: 'Curso' },
  TareaDetalle: { componente: TareaDetalleView, titulo: 'Tarea' },
  Entregas: { componente: EntregasView, titulo: 'Entregas' },
  CalificarEntrega: { componente: CalificarEntregaView, titulo: 'Calificar entrega' },
  Publicar: { componente: PublicarView, titulo: 'Publicar' },
  NotasCurso: { componente: NotasCursoView, titulo: 'Registro de notas' },
  Contactos: { componente: ContactosView, titulo: 'Nuevo mensaje' },
  Chat: { componente: ChatView, titulo: 'Conversación' },
  EditarPerfil: { componente: EditarPerfilView, titulo: 'Editar mis datos' },
  CambiarPassword: { componente: CambiarPasswordView, titulo: 'Cambiar contraseña' },
  Pendientes: { componente: PendientesView, titulo: 'Operaciones pendientes' },
  AjustesNotificaciones: { componente: AjustesNotificacionesView, titulo: 'Notificaciones' },
  SolicitarCita: { componente: SolicitarCitaView, titulo: 'Solicitar cita' },
  RegistrarReporte: { componente: RegistrarReporteView, titulo: 'Registrar reporte' },
  ConductaAlumno: { componente: ConductaAlumnoView, titulo: 'Conducta del estudiante' },
  CitaDetalle: { componente: CitaDetalleView, titulo: 'Cita' },
  HistorialAlumno: { componente: HistorialAlumnoView, titulo: 'Historial del estudiante' },
};
