import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useSesion } from '../context/SesionContext';
import MensajesRepository from '../repositories/mensajesRepository';
import { MENU_POR_ROL } from '../config/menus';
import { ICONO_POR_DEFECTO, TIPOS_NOTIFICACION } from '../config/notificaciones';

/**
 * Abrir la pantalla relacionada con una notificación.
 *
 * Se usa en dos lugares, con la MISMA lógica (la tabla de src/config/notificaciones.js):
 *   1. Al tocar un aviso en la lista "Avisos" (NotificacionesView).
 *   2. Al tocar una notificación push del celular, con la app abierta, en segundo plano
 *      o cerrada (hook useAbrirNotificacionesPush, que usa MenuNavigator).
 */

// Todas las pantallas que aparecen en algún menú (para saber si un rol puede abrirlas).
const PANTALLAS_DE_MENU = new Set(
  Object.values(MENU_POR_ROL).flat().map((opcion) => opcion.pantalla),
);

/** Ícono del tipo de aviso (para la lista de Avisos). */
export function iconoDeNotificacion(tipo) {
  return TIPOS_NOTIFICACION[tipo]?.icono || ICONO_POR_DEFECTO;
}

/**
 * Pantalla a la que lleva una notificación: ['Pantalla', params] o null.
 * `notificacion` necesita { tipo, id_referencia }.
 *
 * Si la pantalla es del menú y el rol no la tiene (por ejemplo, "Conducta" para un
 * docente), devuelve null: así nunca se intenta abrir una pantalla que no existe.
 */
export function destinoDeNotificacion(notificacion, rol) {
  const tipo = TIPOS_NOTIFICACION[notificacion?.tipo];
  if (!tipo) return null;
  const destino = tipo.destino({ referencia: notificacion.id_referencia || null, rol });
  if (!destino) return null;

  const [pantalla] = destino;
  const esDelMenu = PANTALLAS_DE_MENU.has(pantalla);
  const elRolLaTiene = (MENU_POR_ROL[rol] || []).some((opcion) => opcion.pantalla === pantalla);
  return esDelMenu && !elRolLaTiene ? null : destino;
}

// Última notificación push ya abierta (para no abrirla dos veces).
let ultimaPushAbierta = null;

/**
 * Hook: al tocar una notificación push, marca el aviso como leído y abre su pantalla.
 * Va dentro de MenuNavigator, que solo existe cuando hay sesión iniciada; así la
 * pantalla de destino siempre está disponible.
 *
 * Cubre los dos casos:
 *   - app abierta o en segundo plano: listener de "respuesta a notificación";
 *   - app cerrada: al abrir, se revisa la última notificación tocada.
 */
export function useAbrirNotificacionesPush() {
  const navigation = useNavigation();
  const { usuario, refrescarContadores } = useSesion();

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;   // en el navegador no hay notificaciones push

    const abrir = (respuesta) => {
      const id = respuesta?.notification?.request?.identifier;
      if (!respuesta || id === ultimaPushAbierta) return;
      ultimaPushAbierta = id;

      // El backend envía { tipo, id_referencia, id_notificacion } en "data".
      const datos = respuesta.notification.request.content.data || {};
      if (datos.id_notificacion) {
        MensajesRepository.marcarNotificacionLeida(datos.id_notificacion)
          .then(refrescarContadores)
          .catch(() => {});
      }
      const [pantalla, params] = destinoDeNotificacion(datos, usuario?.rol) || ['Notificaciones'];
      // Este hook usa el navegador principal: las pantallas del menú (pestañas) están
      // "dentro" de 'Menu', así que se llega a ellas a través de él.
      if (PANTALLAS_DE_MENU.has(pantalla)) navigation.navigate('Menu', { screen: pantalla, params });
      else navigation.navigate(pantalla, params);
    };

    // App que estaba cerrada y se abrió tocando una notificación.
    try {
      abrir(Notifications.getLastNotificationResponse());
      Notifications.clearLastNotificationResponse();
    } catch {
      // Sin soporte de notificaciones (por ejemplo, Expo Go): no se hace nada.
    }

    // App abierta o en segundo plano.
    let suscripcion = null;
    try {
      suscripcion = Notifications.addNotificationResponseReceivedListener(abrir);
    } catch {
      // Sin soporte de notificaciones
    }
    return () => suscripcion?.remove();
  }, [navigation, usuario?.rol, refrescarContadores]);
}
