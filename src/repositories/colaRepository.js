import PendienteDao from '../database/dao/pendienteDao';
import AsistenciaApi from '../services/api/asistenciaApi';
import ConductaApi from '../services/api/conductaApi';
import CursosApi from '../services/api/cursosApi';
import MensajesApi from '../services/api/mensajesApi';
import NotasApi from '../services/api/notasApi';
import { nuevoIdOperacion } from '../utils/idOperacion';
import { idUsuarioActual } from './sesionRepository';

/**
 * ColaRepository: operaciones que se pueden hacer SIN CONEXIÓN.
 *
 * enviar() intenta mandar la operación al servidor. Si no hay red, la guarda en la cola
 * local (estado PENDIENTE) con un id único. sincronizar() la reenvía, en orden, cuando
 * vuelve la conexión. El servidor reconoce el id (cabecera X-Id-Operacion) y nunca
 * registra dos veces la misma operación.
 *
 * Para que otra operación funcione sin conexión, basta con agregarla en ENVIOS.
 */

/** Cómo se envía cada tipo de operación: (payload, idOperacion) => promesa. */
const ENVIOS = {
  ASISTENCIA: (p, id) => AsistenciaApi.registrarLote(p, id),
  REPORTE_CONDUCTA: (p, id) => ConductaApi.registrarReporte(p, id),
  ENTREGA_TAREA: (p, id) => CursosApi.entregarTarea(p.id_tarea, p.datos, id),
  SOLICITUD_CITA: (p, id) => ConductaApi.solicitarCita(p, id),
  NOTAS: (p, id) => NotasApi.registrar(p.id_carga, p.datos, id),
  MENSAJE: (p, id) => (p.id_conversacion
    ? MensajesApi.responder(p.id_conversacion, p.contenido, id)
    : MensajesApi.iniciar(p.id_usuario, p.contenido, id)),
};

// --- Aviso de cambios (para que el contador de pendientes se actualice solo) -------------
const oyentes = new Set();
export function suscribirCambiosCola(funcion) {
  oyentes.add(funcion);
  return () => oyentes.delete(funcion);
}
const avisarCambios = () => oyentes.forEach((f) => f());

let sincronizando = false;

export const ColaRepository = {
  /**
   * Envía una operación o, si no hay conexión, la deja pendiente.
   * Devuelve { enviado: true, respuesta } o { enviado: false } (quedó pendiente).
   * Los errores del servidor (400, 403, 409...) se lanzan para que el usuario los corrija.
   */
  async enviar(tipo, payload, descripcion) {
    const idOperacion = nuevoIdOperacion();
    try {
      const respuesta = await ENVIOS[tipo](payload, idOperacion);
      return { enviado: true, respuesta };
    } catch (error) {
      if (!error.esDeRed) throw error;
      await PendienteDao.insertar({
        id_operacion: idOperacion,
        id_usuario: idUsuarioActual(),
        tipo,
        payload,
        descripcion,
      });
      avisarCambios();
      return { enviado: false };
    }
  },

  /** Operaciones pendientes o con error del usuario actual. */
  async listar() {
    const id = idUsuarioActual();
    return id ? PendienteDao.listar(id) : [];
  },

  /** Quita una operación de la cola sin enviarla (por ejemplo, una que el servidor rechazó). */
  async descartar(idOperacion) {
    await PendienteDao.eliminar(idOperacion);
    avisarCambios();
  },

  /**
   * Envía, en orden, todas las operaciones pendientes.
   *  - Éxito: se quita de la cola.
   *  - Sin red, error 5xx o sesión vencida (401): se detiene y lo reintenta después.
   *  - Error 4xx (datos rechazados): se marca ERROR y sigue con la siguiente.
   * Devuelve { enviadas, conError }.
   */
  async sincronizar() {
    if (sincronizando) return { enviadas: 0, conError: 0 };
    sincronizando = true;
    let enviadas = 0;
    let conError = 0;
    try {
      const operaciones = (await this.listar()).filter((op) => op.estado === 'PENDIENTE');
      for (const op of operaciones) {
        try {
          await ENVIOS[op.tipo](op.payload, op.id_operacion);
          await PendienteDao.eliminar(op.id_operacion);
          enviadas += 1;
        } catch (error) {
          const temporal = error.esDeRed || error.status === 401 || error.status >= 500;
          await PendienteDao.marcarFallo(op.id_operacion, temporal ? 'PENDIENTE' : 'ERROR', error.message);
          if (temporal) break;      // se reintentará más tarde, respetando el orden
          conError += 1;
        }
      }
    } finally {
      sincronizando = false;
      avisarCambios();
    }
    return { enviadas, conError };
  },
};

export default ColaRepository;
