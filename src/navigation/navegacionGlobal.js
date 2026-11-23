// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Qué es: Navega a una ruta asegurando que el contenedor de navegación esté listo.
// Lo usan: App.jsx
// <<< FIN GUÍA
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

/**
 * Navega a una ruta asegurando que el contenedor de navegación esté listo.
 */
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
