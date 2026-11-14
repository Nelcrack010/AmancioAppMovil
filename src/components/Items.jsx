import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Texto from './Texto';
import { ItemLista } from './Lista';
import { avisar } from '../utils/dialogos';
import { formatearFechaHora } from '../utils/fechas';
import { COLORES, ESPACIO } from '../config/tema';

/**
 * Elementos que se repiten en varias pantallas. Están pensados para ir dentro de <Lista>.
 */

/** Abre un enlace (material, clase virtual, entrega) en el navegador o la app que corresponda. */
export async function abrirEnlace(url) {
  try {
    await Linking.openURL(url);
  } catch {
    avisar('No se pudo abrir', 'Revisa que el enlace sea correcto.');
  }
}

/**
 * Bloque del horario: hora de inicio-fin, curso y detalle (docente o sección).
 * `actual` resalta el bloque que se está dictando ahora.
 */
export function BloqueHorario({ bloque, actual = false }) {
  return (
    <View style={[estilos.bloque, actual && estilos.bloqueActual]}>
      <View style={estilos.horas}>
        <Texto variante="pequeno" negrita color={actual ? COLORES.blanco : COLORES.azul}>{bloque.hora_inicio}</Texto>
        <Texto variante="diminuto" color={actual ? COLORES.crema : COLORES.textoSuave}>{bloque.hora_fin}</Texto>
      </View>
      <View style={estilos.flex}>
        <Texto negrita color={actual ? COLORES.blanco : COLORES.texto}>{bloque.curso}</Texto>
        <Texto variante="pequeno" color={actual ? COLORES.crema : COLORES.textoSecundario}>{bloque.detalle}</Texto>
      </View>
      {actual && <Texto variante="diminuto" negrita color={COLORES.crema}>AHORA</Texto>}
    </View>
  );
}

/** Receso dentro del horario (fila delgada en color crema). */
export function BloqueReceso({ receso }) {
  return (
    <View style={estilos.receso}>
      <Ionicons name="cafe-outline" size={14} color={COLORES.guinda} />
      <Texto variante="diminuto" negrita color={COLORES.guinda}>
        {receso.hora_inicio} – {receso.hora_fin} · {receso.nombre}
      </Texto>
    </View>
  );
}

/** Clase virtual: al tocarla se abre el enlace (Meet, Zoom...). `acciones` va a la derecha. */
export function FilaClaseVirtual({ clase, acciones }) {
  const detalle = [clase.curso, clase.seccion].filter(Boolean).join(' · ');
  return (
    <ItemLista
      icono="videocam"
      colorIcono={COLORES.azul}
      fondoIcono={COLORES.infoFondo}
      titulo={clase.tema || 'Clase virtual'}
      subtitulo={formatearFechaHora(clase.fecha)}
      detalle={detalle || undefined}
      derecha={acciones}
      onPress={clase.enlace ? () => abrirEnlace(clase.enlace) : undefined}
    />
  );
}

/** Enlace pequeño en azul ("Abrir material", "Ver trabajo"...). No se muestra si no hay url. */
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
  flex: { flex: 1, gap: 2 },
  bloque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.md,
    paddingHorizontal: ESPACIO.lg,
    paddingVertical: ESPACIO.md,
    backgroundColor: COLORES.superficie,
  },
  bloqueActual: { backgroundColor: COLORES.azul },
  horas: { width: 44 },
  receso: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ESPACIO.xs,
    paddingVertical: ESPACIO.xs + 2,
    backgroundColor: COLORES.crema,
  },
  enlace: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.xs, paddingVertical: ESPACIO.xs },
});
