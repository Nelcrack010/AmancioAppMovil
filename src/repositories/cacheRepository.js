import CacheDao from '../database/dao/cacheDao';
import { idUsuarioActual } from './sesionRepository';

/**
 * CacheRepository: estrategia de lectura "primero lo local, luego el servidor".
 *
 * Los demás repositorios no devuelven los datos directamente: devuelven una "fuente",
 * es decir, un objeto { clave, cargarDeApi } que describe una consulta:
 *
 *     misNotas: (b) => fuente(`notas:${b}`, () => NotasApi.misNotas(b))
 *
 * Con esa fuente el hook useConsulta:
 *   1. lee lo guardado en el celular (leerLocal) y lo muestra al instante;
 *   2. pide los datos al servidor (actualizar) y guarda la respuesta para la próxima vez.
 * Si no hay conexión, la pantalla sigue mostrando lo guardado.
 */
export function fuente(clave, cargarDeApi) {
  return { clave, cargarDeApi };
}

export const CacheRepository = {
  /** Lo guardado en el celular: { valor, actualizado_en } o null. */
  async leerLocal({ clave }) {
    const id = idUsuarioActual();
    if (!id || !clave) return null;
    try {
      return await CacheDao.leer(id, clave);
    } catch {
      return null;   // si la base local falla, simplemente no hay caché
    }
  },

  /**
   * Guarda en el celular datos que la pantalla armó (por ejemplo, el chat con los mensajes
   * nuevos). Devuelve una promesa por si hay que esperar a que quede guardado; nunca falla.
   */
  guardarLocal({ clave }, datos) {
    const id = idUsuarioActual();
    if (!id || !clave) return Promise.resolve();
    return CacheDao.guardar(id, clave, datos).catch(() => {});
  },

  /** Pide los datos al servidor y los guarda en el celular. Lanza ErrorApi si falla. */
  async actualizar({ clave, cargarDeApi }) {
    const datos = await cargarDeApi();
    const id = idUsuarioActual();
    if (id && clave) {
      CacheDao.guardar(id, clave, datos).catch(() => {});   // guardar no debe frenar la pantalla
    }
    return datos;
  },
};

export default CacheRepository;
