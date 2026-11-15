import Almacenamiento from '../services/almacenamiento';
import { establecerToken } from '../services/api/apiClient';
import AuthApi from '../services/api/authApi';
import MensajesApi from '../services/api/mensajesApi';
import { STORAGE_KEYS } from '../config/constants';
import CacheDao from '../database/dao/cacheDao';
import PendienteDao from '../database/dao/pendienteDao';

/**
 * SesionRepository: única puerta para iniciar, recuperar y cerrar la sesión.
 *
 * Guarda el token JWT y los datos básicos del usuario en el almacenamiento seguro,
 * para que la app recuerde la sesión al volver a abrirse.
 */

// Usuario de la sesión actual en memoria: { id_usuario, username, rol, debe_cambiar_password }
let usuarioActual = null;

/** Lo usan los demás repositorios para separar la caché de cada usuario. */
export function idUsuarioActual() {
  return usuarioActual?.id_usuario ?? null;
}

async function guardarSesion(token, usuario) {
  await Almacenamiento.guardar(STORAGE_KEYS.AUTH_TOKEN, token);
  await Almacenamiento.guardar(STORAGE_KEYS.USER_PROFILE, JSON.stringify(usuario));
  establecerToken(token);
  usuarioActual = usuario;
}

export const SesionRepository = {
  /** Inicia sesión y devuelve el usuario. Lanza ErrorApi si las credenciales fallan. */
  async iniciarSesion(username, password) {
    const r = await AuthApi.login(username, password);
    const usuario = {
      id_usuario: r.id_usuario,
      username: r.username,
      rol: r.rol,
      debe_cambiar_password: r.debe_cambiar_password,
    };
    await guardarSesion(r.access_token, usuario);
    return usuario;
  },

  /** Recupera la sesión guardada al abrir la app (o null si no había). */
  async recuperarSesion() {
    const token = await Almacenamiento.leer(STORAGE_KEYS.AUTH_TOKEN);
    const texto = await Almacenamiento.leer(STORAGE_KEYS.USER_PROFILE);
    if (!token || !texto) return null;
    establecerToken(token);
    usuarioActual = JSON.parse(texto);
    return usuarioActual;
  },

  /** Cambia la contraseña y quita la marca de "primer ingreso". */
  async cambiarPassword(actual, nueva) {
    await AuthApi.cambiarPassword(actual, nueva);
    const usuario = { ...usuarioActual, debe_cambiar_password: false };
    await Almacenamiento.guardar(STORAGE_KEYS.USER_PROFILE, JSON.stringify(usuario));
    usuarioActual = usuario;
    return usuario;
  },

  /**
   * Cierra la sesión.
   *  - borrarDatos = true  (el usuario tocó "Cerrar sesión"): se borra la caché y la cola
   *    de pendientes para no dejar información académica en el celular.
   *  - borrarDatos = false (el token venció): se conserva todo para no perder el trabajo
   *    hecho sin conexión; se enviará cuando vuelva a iniciar sesión.
   */
  async cerrarSesion({ borrarDatos }) {
    const id = idUsuarioActual();
    const pushToken = await Almacenamiento.leer(STORAGE_KEYS.PUSH_TOKEN);

    if (borrarDatos) {
      try {
        await AuthApi.logout(pushToken);
      } catch {
        // Si falla por red o token inválido, intentar DELETE explícito si hay pushToken
        if (pushToken) {
          try {
            await MensajesApi.eliminarDispositivo(pushToken);
          } catch {
            // Sin conexión o fallo no bloqueante
          }
        }
      }
      if (id) {
        await CacheDao.borrarDeUsuario(id);
        await PendienteDao.borrarDeUsuario(id);
      }
    }

    if (pushToken) {
      await Almacenamiento.borrar(STORAGE_KEYS.PUSH_TOKEN);
    }
    await Almacenamiento.borrar(STORAGE_KEYS.AUTH_TOKEN);
    await Almacenamiento.borrar(STORAGE_KEYS.USER_PROFILE);
    establecerToken(null);
    usuarioActual = null;
  },
};

export default SesionRepository;
