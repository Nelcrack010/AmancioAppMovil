// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: COMPONENTE · pieza visual reutilizable en varias pantallas
// Qué es: Aviso visible del modo sin conexión y de las operaciones pendientes (va justo encima de la barra de
//     menú). Al tocarlo se abre la pantalla "Pendientes". Si hay conexión y no hay nada pendiente, no se
//     muestra.
//   <BannerConexion />
// Lo usan: MenuBar.jsx
//
// Para modificar: un cambio aquí se ve en TODAS las pantallas que lo usan.
//   Si solo quieres cambiar una pantalla, cámbialo en esa pantalla (por ejemplo con una prop o un style).
// <<< FIN GUÍA
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Texto from '../Texto';
import { useConexion } from '../../context/ConexionContext';
import { COLORES, ESPACIO } from '../../config/tema';

/**
 * Aviso visible del modo sin conexión y de las operaciones pendientes (va justo encima
 * de la barra de menú). Al tocarlo se abre la pantalla "Pendientes".
 * Si hay conexión y no hay nada pendiente, no se muestra.
 */
export default function BannerConexion() {
  const navigation = useNavigation();
  const { enLinea, pendientes, conError, sincronizando } = useConexion();

  if (enLinea && pendientes === 0 && conError === 0) return null;

  let texto;
  if (!enLinea) {
    texto = pendientes > 0
      ? `Sin conexión con el servidor · ${pendientes} operación(es) pendiente(s)`
      : 'Sin conexión con el servidor · mostrando datos guardados';
  } else if (sincronizando) {
    texto = `Enviando ${pendientes} operación(es) pendiente(s)...`;
  } else if (conError > 0) {
    texto = `${conError} operación(es) rechazada(s) por el servidor · toca para revisar`;
  } else {
    texto = `${pendientes} operación(es) pendiente(s) · toca para enviar`;
  }

  const color = !enLinea ? COLORES.alerta : conError > 0 ? COLORES.error : COLORES.azul;

  return (
    <Pressable
      onPress={() => navigation.navigate('Pendientes')}
      style={[estilos.banner, { backgroundColor: color }]}
      accessibilityRole="button"
    >
      <Ionicons name={enLinea ? 'cloud-upload-outline' : 'cloud-offline-outline'} size={16} color={COLORES.blanco} />
      <Texto variante="diminuto" negrita color={COLORES.blanco} style={estilos.texto}>{texto}</Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.sm,
    paddingHorizontal: ESPACIO.lg,
    paddingVertical: ESPACIO.sm,
  },
  texto: { flex: 1 },
});
