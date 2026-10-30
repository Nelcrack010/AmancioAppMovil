import { getDatabase } from '../appDatabase';

/**
 * ViajeDao: Define las consultas y operaciones locales sobre la tabla de viajes.
 * Equivalente a una interfaz @Dao de Room en Android.
 */
export const ViajeDao = {
  // Obtener todos los viajes guardados localmente
  obtenerTodos: async () => {
    const db = await getDatabase();
    return await db.getAllAsync('SELECT * FROM viajes ORDER BY id DESC');
  },

  // Insertar un nuevo viaje
  insertar: async (destino, fecha, precio, sincronizado = 0) => {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO viajes (destino, fecha, precio, sincronizado) VALUES (?, ?, ?, ?)',
      [destino, fecha, precio, sincronizado ? 1 : 0]
    );
    return result.lastInsertRowId;
  },

  // Guardar una lista completa reemplazando caché
  guardarTodos: async (viajes) => {
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM viajes');
      for (const v of viajes) {
        await db.runAsync(
          'INSERT INTO viajes (id, destino, fecha, precio, sincronizado) VALUES (?, ?, ?, ?, 1)',
          [v.id, v.destino, v.fecha, v.precio]
        );
      }
    });
  },

  // Eliminar todos los registros locales
  limpiar: async () => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM viajes');
  },
};

export default ViajeDao;
