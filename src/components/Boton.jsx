import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Texto from './Texto';
import { COLORES, ESPACIO, RADIO } from '../config/tema';

/**
 * Boton con los estilos del campus.
 *
 * Variantes:
 *   - primario   (azul #093E7A, el botón principal de cada pantalla)
 *   - guinda     (color institucional, para acciones destacadas)
 *   - secundario (borde azul, fondo blanco)
 *   - peligro    (rojo: eliminar, cancelar, anular)
 *   - texto      (sin fondo, como un enlace)
 *
 * Props: titulo, onPress, variante, icono (Ionicons), cargando, deshabilitado, pequeno.
 */
const VARIANTES = {
  primario: { fondo: COLORES.azul, texto: COLORES.blanco, borde: COLORES.azul },
  guinda: { fondo: COLORES.guinda, texto: COLORES.blanco, borde: COLORES.guinda },
  secundario: { fondo: COLORES.superficie, texto: COLORES.azul, borde: COLORES.azul },
  peligro: { fondo: COLORES.superficie, texto: COLORES.error, borde: COLORES.error },
  texto: { fondo: 'transparent', texto: COLORES.azul, borde: 'transparent' },
};

export default function Boton({
  titulo, onPress, variante = 'primario', icono, cargando = false, deshabilitado = false,
  pequeno = false, style,
}) {
  const colores = VARIANTES[variante] || VARIANTES.primario;
  const inactivo = deshabilitado || cargando;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      style={({ pressed }) => [
        estilos.boton,
        pequeno && estilos.pequeno,
        { backgroundColor: colores.fondo, borderColor: colores.borde },
        pressed && estilos.presionado,
        inactivo && estilos.inactivo,
        style,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={colores.texto} />
      ) : (
        <View style={estilos.contenido}>
          {icono && <Ionicons name={icono} size={pequeno ? 16 : 18} color={colores.texto} />}
          <Texto negrita variante={pequeno ? 'pequeno' : 'normal'} color={colores.texto}>{titulo}</Texto>
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    minHeight: 48,
    paddingHorizontal: ESPACIO.lg,
    borderRadius: RADIO.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pequeno: { minHeight: 36, paddingHorizontal: ESPACIO.md, borderRadius: RADIO.sm },
  contenido: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.sm },
  presionado: { opacity: 0.85 },
  inactivo: { opacity: 0.5 },
});
