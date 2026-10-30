import * as SQLite from 'expo-sqlite';

/**
 * AppDatabase: Equivalente a la clase RoomDatabase en Android.
 * Inicializa la base de datos local SQLite y crea las tablas necesarias.
 */
let dbInstance = null;

export const getDatabase = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('amancio_local.db');
    await inicializarTablas(dbInstance);
  }
  return dbInstance;
};

const inicializarTablas = async (db) => {
  // Tabla local para almacenamiento offline / caché
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS viajes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destino TEXT NOT NULL,
      fecha TEXT NOT NULL,
      precio REAL NOT NULL,
      sincronizado INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cache_general (
      clave TEXT PRIMARY KEY,
      valor TEXT NOT NULL,
      actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export default {
  getDatabase,
};
