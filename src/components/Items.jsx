import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Texto from './Texto';
import Tarjeta from './Tarjeta';
import { avisar } from '../utils/dialogos';
import { formatearFechaHora } from '../utils/fechas';
import { COLORES, ESPACIO, RADIO } from '../config/tema';

/**
 * Elementos de lista que se repiten en varias pantallas.
 */

/** Abre un enlace (material, clase virtual, entrega) en el navegador o la app que corresponda. */
export async function abrirEnlace(url) {
  try {
    await Linking.openURL(url);
  } catch {
    avisar('No se pudo abrir', 'Revisa que el enlace sea correcto.');
  }
}

/** Bloque del horario: hora de inicio-fin, curso y detalle (docente o sección). */
export function BloqueHorario({ bloque, actual = false }) {
  return (
    <View style={[estilos.bloque, actual && estilos.bloqueActual]}>
      <View style={estilos.horas}>
        <Texto variante="pequeno" negrita color={actual ? COLORES.blanco : COLORES.azul}>{bloque.hora_inicio}</Texto>
        <Texto variante="diminuto" color={actual ? COLORES.crema : COLORES.textoSecundario}>{bloque.hora_fin}</Texto>
      </View>
      <View style={estilos.flex}>
        <Texto negrita color={actual ? COLORES.blanco : COLORES.texto}>{bloque.curso}</Texto>
        <Texto variante="pequeno" color={actual ? COLORES.crema : COLORES.textoSecundario}>{bloque.detalle}</Texto>
      </View>
      {actual && <Texto variante="diminuto" negrita color={COLORES.crema}>AHORA</Texto>}
    </View>
  );
}

/** Clase virtual: tema, curso, fecha y botón para entrar al enlace. */
export function ClaseVirtual({ clase, acciones }) {
  return (
    <Tarjeta colorBorde={COLORES.azul}>
      <Texto negrita>{clase.tema || 'Clase virtual'}</Texto>
      {clase.curso && <Texto variante="pequeno">{clase.curso}{clase.seccion ? ` · ${clase.seccion}` : ''}</Texto>}
      <Texto variante="pequeno">
        <Ionicons name="time-outline" size={13} /> {formatearFechaHora(clase.fecha)}
      </Texto>
      <View style={estilos.filaAcciones}>
        <BotonEnlace texto="Entrar a la clase" icono="videocam-outline" url={clase.enlace} />
        {acciones}
      </View>
    </Tarjeta>
  );
}

/** Botón pequeño que abre un enlace. */
export function BotonEnlace({ texto, icono = 'open-outline', url }) {
  if (!url) return null;
  return (
    <Pressable onPress={() => abrirEnlace(url)} style={estilos.enlace} accessibilityRole="link">
      <Ionicons name={icono} size={16} color={COLORES.azul} />
      <Texto variante="pequeno" negrita color={COLORES.azul}>{texto}</Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  bloque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.md,
    padding: ESPACIO.md,
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.md,
    borderWidth: 1,
    borderColor: COLORES.bordeSuave,
    marginBottom: ESPACIO.sm,
  },
  bloqueActual: { backgroundColor: COLORES.azul, borderColor: COLORES.azul },
  horas: { width: 48, alignItems: 'center' },
  filaAcciones: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACIO.md, marginTop: ESPACIO.xs },
  enlace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.xs,
    paddingVertical: ESPACIO.xs,
  },
});
