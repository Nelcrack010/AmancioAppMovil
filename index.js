// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
//
// Para modificar:
//   Registra App.jsx como la app de Expo. No se toca.
// <<< FIN GUÍA
import { registerRootComponent } from 'expo';

import App from './App.jsx';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
