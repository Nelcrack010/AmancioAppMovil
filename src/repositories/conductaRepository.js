import ConductaApi from '../services/api/conductaApi';
import PerfilApi from '../services/api/perfilApi';
import { fuente } from './cacheRepository';
import ColaRepository from './colaRepository';

/** ConductaRepository: conducta (faltas y reportes) y citas de psicología. */
export const ConductaRepository = {
  // --- Conducta ---------------------------------------------------------------------------
  faltas: () => fuente('faltas', ConductaApi.faltas),
  estadoAlumno: (idAlumno) => fuente(`conducta:${idAlumno}`, () => ConductaApi.estadoAlumno(idAlumno)),

  /** Conducta del estudiante que inició sesión (primero se averigua su id_alumno en su perfil). */
  miConducta: (username) => fuente('mi-conducta', async () => {
    const perfil = await PerfilApi.miPerfil(username);
    return ConductaApi.estadoAlumno(perfil.datos.id_alumno);
  }),
  anularReporte: ConductaApi.anularReporte,

  /** Registra un reporte de conducta (admite modo sin conexión). */
  registrarReporte: (datos, descripcion) => ColaRepository.enviar('REPORTE_CONDUCTA', datos, descripcion),

  // --- Citas de psicología ----------------------------------------------------------------
  misCitas: () => fuente('mis-citas', ConductaApi.misCitas),
  agenda: (fecha) => fuente(`agenda:${fecha}`, () => ConductaApi.agenda(fecha)),
  historialCitas: (idAlumno) => fuente(`historial-citas:${idAlumno}`, () => ConductaApi.historialCitas(idAlumno)),
  programarCita: ConductaApi.programarCita,
  completarCita: ConductaApi.completarCita,
  cancelarCita: ConductaApi.cancelarCita,

  /** El alumno solicita una cita (admite modo sin conexión). */
  solicitarCita: (datos) => ColaRepository.enviar('SOLICITUD_CITA', datos, 'Solicitud de cita de psicología'),
};

export default ConductaRepository;
