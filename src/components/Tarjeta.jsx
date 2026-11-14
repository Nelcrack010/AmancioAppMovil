import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORES, ESPACIO, RADIO, SOMBRA } from '../config/tema';

/**
 * Tarjeta blanca con bordes redondeados, para bloques de contenido (un formulario,
 * el detalle de una tarea, una cita...). Para LISTAS de elementos usar <Lista>.
 *
 * Props:
 *   - onPress:    si se pasa, la tarjeta se puede tocar y muestra una flecha ">"
 *   - colorBorde: rayita de color a la izquierda (por ejemplo, según el estado)
 *   - destacada:  fondo guinda (para resúmenes importantes, como el saludo del inicio)
 */
export default function Tarjeta({ children, onPress, colorBorde, destacada = false, style }) {
  const contenido = (
    <>
      {colorBorde && <View style={[estilos.acento, { backgroundColor: colorBorde }]} />}
      <View style={estilos.fila}>
        <View style={estilos.cuerpo}>{children}</View>
        {onPress && (
          <Ionicons name="chevron-forward" size={18} color={destacada ? COLORES.crema : COLORES.textoSuave} />
        )}
      </View>
    </>
  );

  const estiloBase = [estilos.tarjeta, destacada && estilos.destacada, style];

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
    overflow: 'hidden',
    ...SOMBRA,
  },
  destacada: { backgroundColor: COLORES.guinda },
  presionada: { opacity: 0.85 },
  // Rayita fina y redondeada (más limpia que un borde grueso de color).
  acento: { position: 'absolute', left: 0, top: ESPACIO.md, bottom: ESPACIO.md, width: 3, borderRadius: 2 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.sm },
  cuerpo: { flex: 1, gap: ESPACIO.xs + 2 },
});
