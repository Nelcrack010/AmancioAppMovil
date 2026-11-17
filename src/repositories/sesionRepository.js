import Almacenamiento from '../services/almacenamiento';
import { establecerToken, obtenerToken } from '../services/api/apiClient';
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
let promesaRecuperacion = null;

/** Lo usan los demás repositorios para separar la caché de cada usuario. */
export function idUsuarioActual() {
  return usuarioActual?.id_usuario ?? null;
}

/** Devuelve los datos básicos del usuario en memoria (incluye rol). */
export function usuarioEnMemoria() {
  return usuarioActual;
}

async function guardarSesion(token, usuario) {
  promesaRecuperacion = null;
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
    if (usuarioActual && obtenerToken()) {
      return usuarioActual;
    }
    if (!promesaRecuperacion) {
      promesaRecuperacion = (async () => {
        try {
          const token = await Almacenamiento.leer(STORAGE_KEYS.AUTH_TOKEN);
          const texto = await Almacenamiento.leer(STORAGE_KEYS.USER_PROFILE);
          if (!token || !texto) {
            promesaRecuperacion = null;
            return null;
          }
          establecerToken(token);
          usuarioActual = JSON.parse(texto);
          return usuarioActual;
        } catch {
          promesaRecuperacion = null;
          return null;
        }
      })();
    }
    return promesaRecuperacion;
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
   * Cierra la sesión del usuario.
   *
   *   borrarDatos: true  → manual ("Cerrar sesión"): borra token, desasocia push, limpia BD
   *   borrarDatos: false → sesión vencida (401): solo borra el token; deja las operaciones
   *                        pendientes para que se envíen al volver a entrar
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
    promesaRecuperacion = null;
    establecerToken(null);
    usuarioActual = null;
  },
};

/** Espera a que la sesión esté recuperada y el token JWT listo en apiClient. */
export async function esperarTokenSesion() {
  const usuario = await SesionRepository.recuperarSesion();
  return usuario ? obtenerToken() : null;
}

export default SesionRepository;
