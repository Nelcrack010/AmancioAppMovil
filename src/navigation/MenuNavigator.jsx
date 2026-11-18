import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MenuBar from '../components/menu/MenuBar';
import BotonesEncabezado from '../components/menu/BotonesEncabezado';
import { useSesion } from '../context/SesionContext';
import { MENU_POR_ROL } from '../config/menus';
import { COLORES } from '../config/tema';
import { OPCIONES_CABECERA } from './estilosNavegacion';
import { PANTALLAS_MENU } from './pantallas';
import { useAbrirNotificacionesPush } from './abrirNotificacion';

const Tabs = createBottomTabNavigator();

/**
 * MenuNavigator: las pantallas del menú del rol que inició sesión.
 *
 * Las opciones salen de src/config/menus.js y se dibujan con nuestra propia barra de
 * menú (MenuBar) en lugar de la barra de pestañas por defecto.
 */
export default function MenuNavigator() {
  const { usuario } = useSesion();
  const opciones = MENU_POR_ROL[usuario.rol] || [];

  // Al tocar una notificación push, abrir la pantalla relacionada (ver abrirNotificacion.js).
  useAbrirNotificacionesPush();

  return (
    <Tabs.Navigator
      tabBar={(props) => <MenuBar {...props} opciones={opciones} />}
      screenOptions={{
        ...OPCIONES_CABECERA,
        sceneStyle: { backgroundColor: COLORES.fondo },
        headerRight: () => <BotonesEncabezado />,
      }}
    >
      {opciones.map((opcion) => (
        <Tabs.Screen
          key={opcion.pantalla}
          name={opcion.pantalla}
          component={PANTALLAS_MENU[opcion.pantalla]}
          options={{ title: opcion.titulo }}
        />
      ))}
    </Tabs.Navigator>
  );
}
