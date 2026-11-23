// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Qué es: CacheDao: guarda y lee la última respuesta de cada consulta. Equivale a una interfaz @Dao de Room en
//     Android.
// Lo usan: cacheRepository.js, sesionRepository.js
// <<< FIN GUÍA
import { getDatabase, ES_WEB } from '../appDatabase';

/**
 * CacheDao: guarda y lee la última respuesta de cada consulta.
 * Equivale a una interfaz @Dao de Room en Android.
 *
 * Cada fila pertenece a un usuario (id_usuario) para que, si otra persona inicia
 * sesión en el mismo celular, nunca vea datos ajenos.
 */
const clavesWeb = (idUsuario, clave) => `cache:${idUsuario}:${clave}`;

export const CacheDao = {
  /** Devuelve { valor, actualizado_en } o null si nunca se guardó esa consulta. */
  async leer(idUsuario, clave) {
    if (ES_WEB) {
      const texto = localStorage.getItem(clavesWeb(idUsuario, clave));
      return texto ? JSON.parse(texto) : null;
    }
    const db = await getDatabase();
    const fila = await db.getFirstAsync(
      'SELECT valor, actualizado_en FROM cache_consulta WHERE id_usuario = ? AND clave = ?',
      [idUsuario, clave]
    );
    return fila ? { valor: JSON.parse(fila.valor), actualizado_en: fila.actualizado_en } : null;
  },

  /** Guarda (o reemplaza) la respuesta de una consulta. */
  async guardar(idUsuario, clave, valor) {
    const actualizado_en = new Date().toISOString();
    if (ES_WEB) {
      localStorage.setItem(clavesWeb(idUsuario, clave), JSON.stringify({ valor, actualizado_en }));
      return;
    }
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO cache_consulta (id_usuario, clave, valor, actualizado_en)
       VALUES (?, ?, ?, ?)`,
      [idUsuario, clave, JSON.stringify(valor), actualizado_en]
    );
  },

  /** Borra toda la caché de un usuario (al cerrar sesión). */
  async borrarDeUsuario(idUsuario) {
    if (ES_WEB) {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(`cache:${idUsuario}:`))
        .forEach((k) => localStorage.removeItem(k));
      return;
    }
    const db = await getDatabase();
    await db.runAsync('DELETE FROM cache_consulta WHERE id_usuario = ?', [idUsuario]);
  },
};

export default CacheDao;
