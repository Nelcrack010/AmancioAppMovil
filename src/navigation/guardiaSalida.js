// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Qué es: Guardia de salida: avisa si el usuario intenta salir de una pantalla con cambios sin guardar (la
//     propuesta lo pide para el registro de asistencia).
// Lo usan: BotonesEncabezado.jsx, MenuBar.jsx, RegistrarAsistenciaView.jsx
// <<< FIN GUÍA
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { confirmar } from '../utils/dialogos';

/**
 * Guardia de salida: avisa si el usuario intenta salir de una pantalla con cambios sin
 * guardar (la propuesta lo pide para el registro de asistencia).
 *
 * La pantalla activa la guardia con el hook useGuardiaSalida(hayCambios, mensaje).
 * La barra de menú y los botones de la cabecera llaman a puedeSalir() antes de cambiar
 * de pantalla; el botón "atrás" de Android también se intercepta.
 */
let guardia = null;   // { mensaje } mientras haya una pantalla con cambios sin guardar

/** Devuelve true si se puede salir (no hay cambios, o el usuario aceptó descartarlos). */
export async function puedeSalir() {
  if (!guardia) return true;
  const salir = await confirmar('Cambios sin guardar', guardia.mensaje, { textoAceptar: 'Salir sin guardar', peligroso: true });
  if (salir) guardia = null;
  return salir;
}

/** Activa la guardia mientras la pantalla esté enfocada y `activa` sea true. */
export function useGuardiaSalida(activa, mensaje) {
  const enfocada = useIsFocused();

  useEffect(() => {
    if (!activa || !enfocada) return undefined;
    guardia = { mensaje };

    // Botón "atrás" de Android: se bloquea y se pregunta. Si el usuario acepta salir sin
    // guardar, la guardia se quita y el siguiente "atrás" funciona normal.
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!guardia) return false;
      puedeSalir();
      return true;
    });

    return () => {
      guardia = null;
      sub.remove();
    };
  }, [activa, enfocada, mensaje]);
}
