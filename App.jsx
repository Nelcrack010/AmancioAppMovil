import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts, Lato_400Regular, Lato_700Bold, Lato_900Black,
} from '@expo-google-fonts/lato';
import { SesionProvider } from './src/context/SesionContext';
import { ConexionProvider } from './src/context/ConexionContext';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navegacionGlobal';
import { Cargando } from './src/components/Estados';
import { COLORES } from './src/config/tema';
import { CONFIGURACION_ENLACES } from './src/navigation/enlaces';

/**
 * Punto de entrada de Campus AV Móvil.
 *
 * Capas que envuelven a la app (de afuera hacia adentro):
 *   SafeAreaProvider    → respeta la muesca y la barra del sistema
 *   SesionProvider      → usuario, token, contadores de no leídos
 *   ConexionProvider    → estado de la red y cola de operaciones sin conexión
 *   NavigationContainer → navegación entre pantallas
 */

// Tema de React Navigation con los colores del colegio.
const TEMA_NAVEGACION = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORES.guinda,
    background: COLORES.fondo,
    card: COLORES.superficie,
    text: COLORES.texto,
    border: COLORES.borde,
  },
};

export default function App() {
  // Fuente Lato, la misma del campus web.
  const [fuentesListas] = useFonts({ Lato_400Regular, Lato_700Bold, Lato_900Black });

  if (!fuentesListas) return null;   // un instante, mientras cargan las fuentes

  return (
    <SafeAreaProvider>
      <SesionProvider>
        <ConexionProvider>
          <NavigationContainer ref={navigationRef} theme={TEMA_NAVEGACION} linking={CONFIGURACION_ENLACES} fallback={<Cargando />}>
            <StatusBar style="dark" />
            <AppNavigator />
          </NavigationContainer>
        </ConexionProvider>
      </SesionProvider>
    </SafeAreaProvider>
  );
}
