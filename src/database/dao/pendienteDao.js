// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Qué es: PendienteDao: cola de operaciones hechas sin conexión. Las operaciones se guardan en orden y se envían
//     en ese mismo orden al volver la red.
// Lo usan: colaRepository.js, sesionRepository.js
// <<< FIN GUÍA
import { getDatabase, ES_WEB } from '../appDatabase';

/**
 * PendienteDao: cola de operaciones hechas sin conexión.
 * Las operaciones se guardan en orden y se envían en ese mismo orden al volver la red.
 */

// --- Versión para navegador (solo pruebas): una lista en localStorage ------------------
const CLAVE_WEB = 'operaciones_pendientes';
const leerWeb = () => JSON.parse(localStorage.getItem(CLAVE_WEB) || '[]');
const guardarWeb = (filas) => localStorage.setItem(CLAVE_WEB, JSON.stringify(filas));

export const PendienteDao = {
  /** Agrega una operación a la cola. */
  async insertar({ id_operacion, id_usuario, tipo, payload, descripcion }) {
    const fila = {
      id_operacion, id_usuario, tipo, descripcion,
      payload: JSON.stringify(payload),
      estado: 'PENDIENTE', intentos: 0, ultimo_error: null,
      creado_en: new Date().toISOString(),
    };
    if (ES_WEB) return guardarWeb([...leerWeb(), fila]);

    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO operacion_pendiente
         (id_operacion, id_usuario, tipo, payload, descripcion, estado, intentos, creado_en)
       VALUES (?, ?, ?, ?, ?, 'PENDIENTE', 0, ?)`,
      [fila.id_operacion, fila.id_usuario, fila.tipo, fila.payload, fila.descripcion, fila.creado_en]
    );
  },

  /** Operaciones de un usuario, de la más antigua a la más nueva (payload ya convertido a objeto). */
  async listar(idUsuario) {
    let filas;
    if (ES_WEB) {
      filas = leerWeb().filter((f) => f.id_usuario === idUsuario);
    } else {
      const db = await getDatabase();
      filas = await db.getAllAsync(
        'SELECT * FROM operacion_pendiente WHERE id_usuario = ? ORDER BY creado_en',
        [idUsuario]
      );
    }
    return filas.map((f) => ({ ...f, payload: JSON.parse(f.payload) }));
  },

  /** Registra un intento fallido. estado = 'PENDIENTE' (se reintentará) o 'ERROR' (necesita revisión). */
  async marcarFallo(idOperacion, estado, mensaje) {
    if (ES_WEB) {
      return guardarWeb(leerWeb().map((f) => (f.id_operacion === idOperacion
        ? { ...f, estado, intentos: f.intentos + 1, ultimo_error: mensaje } : f)));
    }
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE operacion_pendiente SET estado = ?, intentos = intentos + 1, ultimo_error = ?
       WHERE id_operacion = ?`,
      [estado, mensaje, idOperacion]
    );
  },

  /** Quita una operación de la cola (ya se envió o el usuario la descartó). */
  async eliminar(idOperacion) {
    if (ES_WEB) return guardarWeb(leerWeb().filter((f) => f.id_operacion !== idOperacion));
    const db = await getDatabase();
    await db.runAsync('DELETE FROM operacion_pendiente WHERE id_operacion = ?', [idOperacion]);
  },

  /** Borra toda la cola de un usuario (al cerrar sesión). */
  async borrarDeUsuario(idUsuario) {
    if (ES_WEB) return guardarWeb(leerWeb().filter((f) => f.id_usuario !== idUsuario));
    const db = await getDatabase();
    await db.runAsync('DELETE FROM operacion_pendiente WHERE id_usuario = ?', [idUsuario]);
  },
};

export default PendienteDao;
