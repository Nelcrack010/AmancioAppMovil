import React from 'react';
import { Pressable } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSesion } from '../context/SesionContext';
import { Cargando } from '../components/Estados';
import LoginView from '../views/auth/LoginView';
import CambiarPasswordView from '../views/auth/CambiarPasswordView';
import MenuNavigator from './MenuNavigator';
import { OPCIONES_CABECERA } from './estilosNavegacion';
import { PANTALLAS_DETALLE } from './pantallas';
import { COLORES } from '../config/tema';

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
    // Sin initialRouteName: las pantallas cambian según la sesión, y la primera de cada
    // grupo (Login, PrimerIngreso o Menu) es la inicial. Poner "Menu" aquí rompía la app
    // cuando no hay sesión, porque en ese momento "Menu" no existe.
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
              options={({ navigation, route }) => ({
                title: route.params?.titulo || titulo,
                headerLeft: () => (
                  <Pressable
                    onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Menu'))}
                    style={{ marginRight: 16, padding: 4 }}
                    accessibilityRole="button"
                    accessibilityLabel="Volver"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="arrow-back" size={24} color={COLORES.guinda} />
                  </Pressable>
                ),
              })}
            />
          ))}
        </>
      )}
    </Stack.Navigator>
  );
}
