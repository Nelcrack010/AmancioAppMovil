import React from 'react';
import { StyleSheet, View } from 'react-native';
import Texto from './Texto';
import { COLORES, ESPACIO, RADIO } from '../config/tema';

/**
 * Etiqueta (badge) de color para mostrar estados: "Pendiente", "Calificada", "Falta"...
 * tono: exito | alerta | error | info | neutro | guinda
 */
const TONOS = {
  exito: { fondo: COLORES.exitoFondo, texto: COLORES.exito },
  alerta: { fondo: COLORES.alertaFondo, texto: COLORES.alerta },
  error: { fondo: COLORES.errorFondo, texto: COLORES.error },
  info: { fondo: COLORES.infoFondo, texto: COLORES.info },
  neutro: { fondo: COLORES.bordeSuave, texto: COLORES.textoSecundario },
  guinda: { fondo: COLORES.crema, texto: COLORES.guinda },
};

export default function Etiqueta({ texto, tono = 'neutro', style }) {
  const colores = TONOS[tono] || TONOS.neutro;
  return (
    <View style={[estilos.etiqueta, { backgroundColor: colores.fondo }, style]}>
      <Texto variante="diminuto" negrita color={colores.texto}>{texto}</Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  etiqueta: {
    alignSelf: 'flex-start',
    paddingHorizontal: ESPACIO.sm,
    paddingVertical: 3,
    borderRadius: RADIO.total,
  },
});
