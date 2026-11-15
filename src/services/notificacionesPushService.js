import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/**
 * Configuración global del manejador de notificaciones.
 * Muestra alerta/banner, reproduce sonido y lista en la barra cuando la app está abierta.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Obtiene el token de notificaciones push de Expo para este dispositivo.
 *
 * Configura el canal de alta importancia en Android para que despierte la pantalla bloqueada,
 * solicita permisos al usuario si aún no los otorgó, y recupera el ExponentPushToken.
 * Devuelve el token o null si no se pudo obtener (ej. ejecutando en emulador o permisos denegados).
 */
export async function obtenerTokenPushAsync() {
  if (!Device.isDevice) {
    // Los emuladores de Android / simuladores de iOS no reciben notificaciones push remotas
    return null;
  }

  // En Android es obligatorio configurar el canal de notificación
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notificaciones Campus AV',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#800020',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: 'default',
    });
  }

  const { status: estadoExistente } = await Notifications.getPermissionsAsync();
  let estadoFinal = estadoExistente;

  if (estadoExistente !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    estadoFinal = status;
  }

  if (estadoFinal !== 'granted') {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  const respuestaToken = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );

  return respuestaToken?.data ?? null;
}
