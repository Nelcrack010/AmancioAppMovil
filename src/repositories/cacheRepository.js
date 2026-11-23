// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: REPOSITORY · de dónde salen los datos: caché del celular, la API o la cola sin conexión
// Cadena: vistas/viewmodels → [este archivo] → services/api/*Api.js → backend
//
// Métodos (→ endpoint · lo usan):
//   leerLocal()  → solo en el celular  · lo usan: useChatViewModel.js, useConsulta.js
//   guardarLocal()  → solo en el celular  · lo usan: useChatViewModel.js, useRegistroAsistenciaViewModel.js
//   actualizar()  → solo en el celular  · lo usan: useChatViewModel.js, useConsulta.js
//
// Para modificar:
//   • CONSULTA (mostrar datos): metodo: (a) => fuente(`clave:${a}`, () => XApi.metodo(a)),
//     la clave de caché debe cambiar si cambia el parámetro (si no, se ven datos de otro filtro).
//   • ACCIÓN (guardar/borrar): metodo: XApi.metodo,   (se pasa tal cual).
//   • Que funcione sin conexión: ColaRepository.enviar('TIPO', payload, descripcion) + agregar TIPO en ENVIOS
//       (colaRepository.js).
//
// Para modificar:
//   fuente(clave, fn): guarda la última respuesta en el celular y la muestra primero.
// <<< FIN GUÍA
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
  // PISTA: leerLocal() → solo en el celular · lo usan: useChatViewModel.js, useConsulta.js
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

  // PISTA: guardarLocal() → solo en el celular · lo usan: useChatViewModel.js, useRegistroAsistenciaViewModel.js
  /**
   * Guarda en el celular datos que la pantalla armó (por ejemplo, el chat con los mensajes
   * nuevos). Devuelve una promesa por si hay que esperar a que quede guardado; nunca falla.
   */
  guardarLocal({ clave }, datos) {
    const id = idUsuarioActual();
    if (!id || !clave) return Promise.resolve();
    return CacheDao.guardar(id, clave, datos).catch(() => {});
  },

  // PISTA: actualizar() → solo en el celular · lo usan: useChatViewModel.js, useConsulta.js
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
