// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Qué es: El chat avisa qué conversación se está viendo (null al salir).
// Lo usan: AvisoPermisoNotificaciones.jsx, SesionContext.jsx, useChatViewModel.js
// <<< FIN GUÍA
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Conversación que el usuario tiene abierta en pantalla (la fija el chat).
let chatAbierto = null;

/** El chat avisa qué conversación se está viendo (null al salir). */
export function fijarChatAbierto(idConversacion) {
  chatAbierto = idConversacion ? Number(idConversacion) : null;
}

/**
 * Configuración global del manejador de notificaciones (con la app ABIERTA).
 * Muestra el banner, el sonido y la lista de la barra del celular, EXCEPTO si es un
 * mensaje de la conversación que ya está en pantalla (el mensaje aparece solo en el chat).
 */
try {
  Notifications.setNotificationHandler({
    handleNotification: async (notificacion) => {
      const datos = notificacion?.request?.content?.data || {};
      const esDelChatAbierto = datos.tipo === 'MENSAJE' && chatAbierto !== null
        && Number(datos.id_referencia) === chatAbierto;
      return {
        shouldShowBanner: !esDelChatAbierto,
        shouldShowList: !esDelChatAbierto,
        shouldPlaySound: !esDelChatAbierto,
        shouldSetBadge: true,
      };
    },
  });
} catch (error) {
  // Entorno sin soporte de notificaciones
}

// ¿Este celular quedó registrado para recibir push? (lo marca la sesión al registrar el token)
let tieneTokenPush = false;
export function marcarTokenPushRegistrado(registrado) {
  tieneTokenPush = Boolean(registrado);
}

/**
 * Prepara el celular para mostrar notificaciones: crea el canal de Android y pide permiso.
 * Sirve tanto para las push como para las locales (las que se muestran con el WebSocket).
 * Devuelve true si hay permiso.
 */
export async function prepararNotificaciones() {
  if (Platform.OS === 'web') return false;
  try {
    // En Android es obligatorio un canal. Importancia alta: suena y aparece arriba.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notificaciones Campus AV',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#800020',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return true;
    const pedido = await Notifications.requestPermissionsAsync();
    return pedido.status === 'granted';
  } catch {
    return false;
  }
}

/**
 * ¿El celular deja que la app muestre notificaciones?
 * Devuelve { concedido, sePuedePedir }. sePuedePedir = false cuando el usuario lo negó
 * y Android ya no vuelve a preguntar: hay que activarlo en los Ajustes del celular.
 */
export async function estadoPermisoNotificaciones() {
  if (Platform.OS === 'web') return { concedido: true, sePuedePedir: false };
  try {
    const permiso = await Notifications.getPermissionsAsync();
    return { concedido: permiso.status === 'granted', sePuedePedir: permiso.canAskAgain !== false };
  } catch {
    return { concedido: true, sePuedePedir: false };   // sin soporte: no se muestra el aviso
  }
}

/**
 * Obtiene el token de notificaciones push de Expo para este dispositivo.
 * Devuelve null si no se puede: emulador, sin permiso o Expo Go en Android (desde el
 * SDK 53 Expo Go no recibe push; hace falta una development build). En esos casos la
 * app igual muestra los avisos al instante con el WebSocket (mostrarNotificacionLocal).
 * Nunca lanza errores.
 */
export async function obtenerTokenPushAsync() {
  try {
    const conPermiso = await prepararNotificaciones();
    // Los emuladores no reciben notificaciones push remotas.
    if (!conPermiso || !Device.isDevice) return null;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const respuestaToken = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return respuestaToken?.data ?? null;
  } catch (error) {
    // Si falla cualquier paso (red, Expo Go, etc.), no interrumpe el flujo normal
    return null;
  }
}

/**
 * Muestra en el celular una notificación que llegó por WEBSOCKET (con la app abierta).
 * Así los avisos funcionan en local, sin internet y sin development build.
 *
 * No se muestra si:
 *   - el usuario la silenció (aviso.mostrar = false, ver Mi perfil → Notificaciones);
 *   - ya le llegó como push a este celular (para no mostrarla dos veces);
 *   - es un mensaje del chat que está en pantalla;
 *   - es el navegador (Expo web no muestra notificaciones).
 * Al tocarla se abre su pantalla igual que una push (ver src/navigation/abrirNotificacion.js).
 */
export async function mostrarNotificacionLocal(aviso) {
  if (Platform.OS === 'web' || !aviso?.mostrar) return;
  if (aviso.push_enviado && tieneTokenPush) return;
  if (aviso.tipo === 'MENSAJE' && chatAbierto !== null && Number(aviso.id_referencia) === chatAbierto) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: aviso.titulo,
        body: aviso.mensaje,
        sound: true,
        data: { tipo: aviso.tipo, id_referencia: aviso.id_referencia, id_notificacion: aviso.id_notificacion },
      },
      trigger: null,     // ahora mismo
    });
  } catch {
    // Sin permiso de notificaciones: el aviso igual aparece en la lista de Avisos.
  }
}
