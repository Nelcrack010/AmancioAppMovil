import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

/**
 * Base de datos local del celular (SQLite). Equivale a la clase RoomDatabase en Android.
 *
 * Tiene solo dos tablas, porque el servidor es la fuente de verdad:
 *   - cache_consulta:     la última respuesta de cada consulta (notas, horario, cursos...)
 *                         para mostrarla al instante y cuando no hay conexión.
 *   - operacion_pendiente: la cola de operaciones hechas sin conexión (asistencia,
 *                         reportes, entregas, mensajes...) que se envían al volver la red.
 *
 * En el navegador (solo para pruebas) no se usa SQLite: los DAO guardan en localStorage.
 */
export const ES_WEB = Platform.OS === 'web';

let instancia = null;

export async function getDatabase() {
  if (!instancia) {
    instancia = await SQLite.openDatabaseAsync('amancio_local.db');
    await crearTablas(instancia);
  }
  return instancia;
}

async function crearTablas(db) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS cache_consulta (
      id_usuario     INTEGER NOT NULL,
      clave          TEXT    NOT NULL,
      valor          TEXT    NOT NULL,          -- JSON de la respuesta
      actualizado_en TEXT    NOT NULL,          -- fecha y hora ISO
      PRIMARY KEY (id_usuario, clave)
    );

    CREATE TABLE IF NOT EXISTS operacion_pendiente (
      id_operacion TEXT PRIMARY KEY,            -- viaja en la cabecera X-Id-Operacion
      id_usuario   INTEGER NOT NULL,
      tipo         TEXT    NOT NULL,            -- ASISTENCIA, REPORTE_CONDUCTA, ENTREGA_TAREA...
      payload      TEXT    NOT NULL,            -- JSON con los datos a enviar
      descripcion  TEXT    NOT NULL,            -- texto para mostrar al usuario
      estado       TEXT    NOT NULL DEFAULT 'PENDIENTE',   -- PENDIENTE o ERROR
      intentos     INTEGER NOT NULL DEFAULT 0,
      ultimo_error TEXT,
      creado_en    TEXT    NOT NULL
    );
  `);
}

export default { getDatabase, ES_WEB };
