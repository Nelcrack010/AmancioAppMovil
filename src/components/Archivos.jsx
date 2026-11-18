import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Texto from './Texto';
import { abrirEnlace } from './Items';
import { elegirArchivo, formatearTamano, iconoDeArchivo, urlDeArchivo } from '../services/archivos';
import { AYUDA_ARCHIVOS } from '../config/archivos';
import { COLORES, ESPACIO, RADIO } from '../config/tema';

/**
 * Componentes para archivos (PDF, Word, Excel, PowerPoint, imágenes...).
 *
 *   <SelectorArchivo archivo={archivo} alCambiar={setArchivo} />   elegir uno para subir
 *   <BotonArchivo archivo={tarea.adjunto} />                        abrir uno ya subido
 */

/** Caja para elegir un archivo del celular. Muestra el elegido con una "x" para quitarlo. */
export function SelectorArchivo({ archivo, alCambiar, etiqueta = 'Archivo', ayuda = AYUDA_ARCHIVOS }) {
  const [error, setError] = useState(null);

  const elegir = async () => {
    try {
      const resultado = await elegirArchivo();
      if (!resultado) return;                     // canceló
      setError(resultado.error || null);
      if (resultado.archivo) alCambiar(resultado.archivo);
    } catch {
      setError('No se pudo abrir el selector de archivos.');
    }
  };

  return (
    <View style={estilos.contenedor}>
      <Texto variante="pequeno" negrita>{etiqueta}</Texto>
      {archivo ? (
        <View style={estilos.elegido}>
          <Ionicons name={iconoDeArchivo(archivo.nombre)} size={22} color={COLORES.azul} />
          <View style={estilos.flex}>
            <Texto numberOfLines={1} negrita>{archivo.nombre}</Texto>
            <Texto variante="diminuto">{formatearTamano(archivo.tamano)}</Texto>
          </View>
          <Pressable onPress={() => alCambiar(null)} hitSlop={10} accessibilityLabel="Quitar archivo">
            <Ionicons name="close-circle" size={22} color={COLORES.textoSuave} />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={elegir} style={estilos.caja} accessibilityRole="button" accessibilityLabel="Elegir archivo">
          <Ionicons name="cloud-upload-outline" size={26} color={COLORES.azul} />
          <Texto negrita color={COLORES.azul}>Elegir archivo</Texto>
          <Texto variante="diminuto" centrado>{ayuda}</Texto>
        </Pressable>
      )}
      {Boolean(error) && <Texto variante="diminuto" color={COLORES.error}>{error}</Texto>}
    </View>
  );
}

/** Archivo ya subido: ícono, nombre y tamaño. Al tocarlo se abre (o se descarga). */
export function BotonArchivo({ archivo, texto }) {
  const url = urlDeArchivo(archivo);
  if (!url) return null;
  return (
    <Pressable onPress={() => abrirEnlace(url)} style={estilos.boton} accessibilityRole="link">
      <Ionicons name={iconoDeArchivo(archivo.nombre)} size={20} color={COLORES.azul} />
      <View style={estilos.flex}>
        <Texto variante="pequeno" negrita color={COLORES.azul} numberOfLines={1}>{texto || archivo.nombre}</Texto>
        <Texto variante="diminuto" numberOfLines={1}>
          {texto ? `${archivo.nombre} · ` : ''}{formatearTamano(archivo.tamano)}
        </Texto>
      </View>
      <Ionicons name="download-outline" size={18} color={COLORES.azul} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: ESPACIO.xs, marginBottom: ESPACIO.md },
  flex: { flex: 1, gap: 2 },
  caja: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: ESPACIO.md,
    paddingHorizontal: ESPACIO.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORES.azul,
    borderRadius: RADIO.lg,
    backgroundColor: COLORES.infoFondo,
  },
  elegido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.sm,
    padding: ESPACIO.md,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: RADIO.lg,
    backgroundColor: COLORES.fondo,
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.sm,
    paddingVertical: ESPACIO.sm,
    paddingHorizontal: ESPACIO.md,
    borderRadius: RADIO.md,
    backgroundColor: COLORES.infoFondo,
  },
});
