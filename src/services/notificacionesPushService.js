import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/**
 * Configuración global del manejador de notificaciones.
 * Muestra alerta/banner, reproduce sonido y lista en la barra cuando la app está abierta.
 */
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (error) {
  // Entorno sin soporte de notificaciones
}

/**
 * Obtiene el token de notificaciones push de Expo para este dispositivo.
 *
 * Configura el canal de alta importancia en Android para que despierte la pantalla bloqueada.
 * NOTA: En Android (SDK 58+), se omite 'sound' para que el sistema operativo use el sonido
 * predeterminado del dispositivo y no busque archivos nativos locales como default.wav/mp3.
 *
 * Envuelto en try/catch para que cualquier fallo devuelva null y nunca interrumpa el flujo normal.
 */
export async function obtenerTokenPushAsync() {
  try {
    if (!Device.isDevice) {
      // Los emuladores de Android / simuladores de iOS no reciben notificaciones push remotas
      return null;
    }

    // En Android es obligatorio configurar el canal de notificación
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Notificaciones Campus AV',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#800020',
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      } catch (errorCanal) {
        // Si falla la creación del canal, no bloquear el flujo
      }
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
  } catch (error) {
    // Si falla cualquier paso (red, permisos, etc.), no interrumpe el flujo normal
    return null;
  }
}