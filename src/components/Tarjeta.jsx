import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORES, ESPACIO, RADIO, SOMBRA } from '../config/tema';

/**
 * Tarjeta blanca con bordes redondeados (como las del campus web).
 *
 * Props:
 *   - onPress:    si se pasa, la tarjeta se puede tocar y muestra una flecha ">"
 *   - colorBorde: franja de color a la izquierda (por ejemplo, según el estado)
 *   - destacada:  fondo guinda (para resúmenes importantes, como el banner del inicio)
 */
export default function Tarjeta({ children, onPress, colorBorde, destacada = false, style }) {
  const contenido = (
    <View style={estilos.fila}>
      <View style={estilos.cuerpo}>{children}</View>
      {onPress && (
        <Ionicons name="chevron-forward" size={20} color={destacada ? COLORES.crema : COLORES.textoSuave} />
      )}
    </View>
  );

  const estiloBase = [
    estilos.tarjeta,
    destacada && estilos.destacada,
    colorBorde && { borderLeftWidth: 4, borderLeftColor: colorBorde },
    style,
  ];

  if (!onPress) return <View style={estiloBase}>{contenido}</View>;

  return (
    <Pressable
      onPress={onPress}
      // En el navegador un "button" no puede contener otros botones (Editar, Eliminar...),
      // por eso allí la tarjeta no lleva ese rol. En el celular sí.
      accessibilityRole={Platform.OS === 'web' ? undefined : 'button'}
      style={({ pressed }) => [...estiloBase, pressed && estilos.presionada]}
    >
      {contenido}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.lg,
    padding: ESPACIO.lg,
    marginBottom: ESPACIO.md,
    borderWidth: 1,
    borderColor: COLORES.bordeSuave,
    ...SOMBRA,
  },
  destacada: { backgroundColor: COLORES.guinda, borderColor: COLORES.guinda },
  presionada: { opacity: 0.8 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.sm },
  cuerpo: { flex: 1, gap: ESPACIO.xs },
});
