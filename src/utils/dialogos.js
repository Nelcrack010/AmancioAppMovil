import { Alert, Platform } from 'react-native';

/**
 * Diálogos de confirmación y aviso.
 *
 * En el celular usan Alert.alert. En el navegador (pruebas con Expo web) Alert no
 * muestra botones, así que se usan window.confirm y window.alert.
 */

/** Pregunta algo al usuario. Devuelve una promesa con true (aceptó) o false (canceló). */
export function confirmar(titulo, mensaje, { textoAceptar = 'Aceptar', peligroso = false } = {}) {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${titulo}\n\n${mensaje}`));
  }
  return new Promise((resolver) => {
    Alert.alert(titulo, mensaje, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolver(false) },
      { text: textoAceptar, style: peligroso ? 'destructive' : 'default', onPress: () => resolver(true) },
    ], { cancelable: true, onDismiss: () => resolver(false) });
  });
}

/** Muestra un aviso con un solo botón "Entendido". */
export function avisar(titulo, mensaje) {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje, [{ text: 'Entendido' }]);
}

/**
 * Aviso estándar tras una operación que admite modo sin conexión.
 * `resultado` es lo que devuelve ColaRepository.enviar(): { enviado: true|false }.
 */
export function avisarResultado(resultado, mensajeExito) {
  if (resultado.enviado) {
    avisar('Listo', mensajeExito);
  } else {
    avisar(
      'Guardado sin conexión',
      'No hay conexión con el servidor. La operación quedó PENDIENTE en el celular y se enviará sola cuando vuelva la conexión.',
    );
  }
}
