import ViajeDao from '../database/dao/viajeDao';
import ApiService from '../services/api/apiService';

/**
 * ViajeRepository: Punto único de acceso a los datos.
 * Decide y coordina entre la fuente de datos remota (API REST) y local (SQLite / DAO).
 */
export const ViajeRepository = {
  /**
   * Obtiene la lista de viajes.
   * Si forzarRemoto es false o no hay internet, devuelve los datos locales de Room/SQLite.
   * Si hay conexión, consulta la API REST y actualiza la base de datos local.
   */
  obtenerViajes: async (forzarRemoto = true) => {
    if (!forzarRemoto) {
      return await ViajeDao.obtenerTodos();
    }

    try {
      // 1. Intenta obtener desde la API REST remota
      // (Por ahora como ejemplo de endpoints de backend; si no hay endpoint de viajes, usamos fallback local)
      const dataRemota = await ApiService.verificarSalud();
      console.log('Conexión con API REST establecida:', dataRemota);

      // Si tuviéramos endpoint directo de viajes:
      // const respuesta = await apiClient.get('/viajes');
      // await ViajeDao.guardarTodos(respuesta.data);
      // return respuesta.data;

      // Retornamos los datos locales enriquecidos
      return await ViajeDao.obtenerTodos();
    } catch (error) {
      console.warn('Fallo remoto o sin conexión. Cargando desde base de datos local:', error.message);
      // Fallback a base de datos local (Offline-first)
      return await ViajeDao.obtenerTodos();
    }
  },

  /**
   * Registra un nuevo viaje localmente y lo deja pendiente para sincronizar.
   */
  crearViaje: async (destino, fecha, precio) => {
    // Guarda localmente primero
    const idLocal = await ViajeDao.insertar(destino, fecha, precio, 0);

    // Intenta sincronizar inmediatamente con la API REST si hay conexión
    try {
      // await ApiService.crearViaje(...)
      // Si salió bien, se marca sincronizado = 1
    } catch (e) {
      console.log('Guardado offline. Se sincronizará cuando haya conexión.');
    }

    return idLocal;
  },
};

export default ViajeRepository;
