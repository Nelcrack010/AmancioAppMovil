import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSesion } from '../context/SesionContext';
import { Cargando } from '../components/Estados';
import LoginView from '../views/auth/LoginView';
import CambiarPasswordView from '../views/auth/CambiarPasswordView';
import MenuNavigator from './MenuNavigator';
import { OPCIONES_CABECERA } from './estilosNavegacion';
import { PANTALLAS_DETALLE } from './pantallas';

const Stack = createNativeStackNavigator();

/**
 * AppNavigator: decide qué ve el usuario según su sesión.
 *
 *   sin sesión                      → Inicio de sesión
 *   primer ingreso (clave = DNI)    → Cambio de contraseña obligatorio
 *   con sesión                      → Menú del rol + pantallas de detalle
 *
 * Al cambiar la sesión (iniciar, cerrar, vencer) React Navigation cambia de grupo solo.
 */
export default function AppNavigator() {
  const { usuario, recuperando } = useSesion();

  if (recuperando) return <Cargando mensaje="Recuperando tu sesión..." />;

  return (
    <Stack.Navigator screenOptions={OPCIONES_CABECERA}>
      {!usuario ? (
        <Stack.Screen name="Login" component={LoginView} options={{ headerShown: false }} />
      ) : usuario.debe_cambiar_password ? (
        <Stack.Screen
          name="PrimerIngreso"
          component={CambiarPasswordView}
          initialParams={{ obligatorio: true }}
          options={{ title: 'Primer ingreso', headerBackVisible: false }}
        />
      ) : (
        <>
          <Stack.Screen name="Menu" component={MenuNavigator} options={{ headerShown: false }} />
          {Object.entries(PANTALLAS_DETALLE).map(([nombre, { componente, titulo }]) => (
            <Stack.Screen
              key={nombre}
              name={nombre}
              component={componente}
              options={({ route }) => ({ title: route.params?.titulo || titulo })}
            />
          ))}
        </>
      )}
    </Stack.Navigator>
  );
}
