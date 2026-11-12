import React from 'react';
import { StyleSheet, View } from 'react-native';
import Texto from './Texto';
import { COLORES, ESPACIO, RADIO } from '../config/tema';

/**
 * Componentes pequeños de presentación que se repiten en muchas pantallas.
 */

/** Título de una sección dentro de una pantalla, con una acción opcional a la derecha. */
export function Seccion({ titulo, accion, style }) {
  return (
    <View style={[estilos.seccion, style]}>
      <Texto variante="etiqueta">{titulo}</Texto>
      {accion}
    </View>
  );
}

/** Fila "rótulo: valor" para mostrar datos (perfil, matrícula, detalle de una cita...). */
export function Fila({ rotulo, valor }) {
  return (
    <View style={estilos.fila}>
      <Texto variante="pequeno" style={estilos.rotulo}>{rotulo}</Texto>
      <Texto style={estilos.valor}>{valor ?? '—'}</Texto>
    </View>
  );
}

/** Círculo con las iniciales de una persona (contactos, perfil, chat). */
export function Avatar({ nombre = '', tamano = 44, fondo = COLORES.crema, color = COLORES.guinda }) {
  const iniciales = nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
  return (
    <View style={[estilos.avatar, { width: tamano, height: tamano, backgroundColor: fondo }]}>
      <Texto negrita color={color} style={{ fontSize: tamano * 0.38 }}>{iniciales || '?'}</Texto>
    </View>
  );
}

/** Número grande con su rótulo (resúmenes: promedio, faltas, nota de conducta...). */
export function Dato({ valor, rotulo, color = COLORES.guinda }) {
  return (
    <View style={estilos.dato}>
      <Texto variante="titulo" color={color}>{valor ?? '—'}</Texto>
      <Texto variante="diminuto" centrado>{rotulo}</Texto>
    </View>
  );
}

/** Fila de varios <Dato> repartidos en partes iguales. */
export function FilaDatos({ children }) {
  return <View style={estilos.filaDatos}>{children}</View>;
}

/** Línea divisoria fina. */
export function Separador() {
  return <View style={estilos.separador} />;
}

const estilos = StyleSheet.create({
  seccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: ESPACIO.md,
    marginBottom: ESPACIO.sm,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: ESPACIO.md,
    paddingVertical: ESPACIO.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeSuave,
  },
  rotulo: { flex: 1 },
  valor: { flex: 1.4, textAlign: 'right' },
  avatar: { borderRadius: RADIO.total, alignItems: 'center', justifyContent: 'center' },
  dato: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: ESPACIO.md,
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.md,
    borderWidth: 1,
    borderColor: COLORES.bordeSuave,
  },
  filaDatos: { flexDirection: 'row', gap: ESPACIO.sm, marginBottom: ESPACIO.md },
  separador: { height: 1, backgroundColor: COLORES.borde, marginVertical: ESPACIO.md },
});
