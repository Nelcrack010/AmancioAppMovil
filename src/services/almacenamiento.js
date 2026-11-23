// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Qué es: Almacenamiento seguro clave-valor para la sesión (token JWT y datos del usuario).
// Lo usan: SesionContext.jsx, mensajesRepository.js, sesionRepository.js, apiClient.js, servidor.js
// <<< FIN GUÍA
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Almacenamiento seguro clave-valor para la sesión (token JWT y datos del usuario).
 *
 * En el celular usa expo-secure-store (cifrado por el sistema operativo).
 * En el navegador (solo para probar con "npx expo start --web") SecureStore no existe,
 * así que se usa localStorage.
 */
const esWeb = Platform.OS === 'web';

export const Almacenamiento = {
  async guardar(clave, valor) {
    if (esWeb) return localStorage.setItem(clave, valor);
    return SecureStore.setItemAsync(clave, valor);
  },

  async leer(clave) {
    if (esWeb) return localStorage.getItem(clave);
    return SecureStore.getItemAsync(clave);
  },

  async borrar(clave) {
    if (esWeb) return localStorage.removeItem(clave);
    return SecureStore.deleteItemAsync(clave);
  },
};

export default Almacenamiento;
