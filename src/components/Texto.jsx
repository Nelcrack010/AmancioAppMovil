// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: COMPONENTE · pieza visual reutilizable en varias pantallas
// Qué es: Texto: reemplaza a <Text> en toda la app para usar siempre la fuente Lato y los tamaños del tema.
//   <Texto variante = 'normal', color, negrita = false, centrado = false, style, children, ...resto />
// Lo usan: Archivos.jsx, Basicos.jsx, Boton.jsx, Campo.jsx, DialogoTexto.jsx, Estados.jsx, Etiqueta.jsx,
//     Items.jsx (+38 más)
//
// Para modificar: un cambio aquí se ve en TODAS las pantallas que lo usan.
//   Si solo quieres cambiar una pantalla, cámbialo en esa pantalla (por ejemplo con una prop o un style).
// <<< FIN GUÍA
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { COLORES, FUENTES, TAMANOS } from '../config/tema';

/**
 * Texto: reemplaza a <Text> en toda la app para usar siempre la fuente Lato y los
 * tamaños del tema.
 *
 * Variantes: titulo, subtitulo, normal (por defecto), pequeno, diminuto, etiqueta.
 * Props extra: color, negrita, centrado, style (para ajustes puntuales).
 *
 *     <Texto variante="titulo" color={COLORES.guinda}>Mis cursos</Texto>
 */
export default function Texto({
  variante = 'normal', color, negrita = false, centrado = false, style, children, ...resto
}) {
  return (
    <Text
      style={[
        estilos.base,
        estilos[variante],
        negrita && estilos.negrita,
        centrado && estilos.centrado,
        color && { color },
        style,
      ]}
      {...resto}
    >
      {children}
    </Text>
  );
}

const estilos = StyleSheet.create({
  base: { fontFamily: FUENTES.normal, color: COLORES.texto, fontSize: TAMANOS.normal },
  titulo: { fontFamily: FUENTES.gruesa, fontSize: TAMANOS.titulo, color: COLORES.guinda },
  subtitulo: { fontFamily: FUENTES.negrita, fontSize: TAMANOS.subtitulo },
  normal: {},
  pequeno: { fontSize: TAMANOS.pequeno, color: COLORES.textoSecundario },
  diminuto: { fontSize: TAMANOS.diminuto, color: COLORES.textoSecundario },
  // Rótulo en mayúsculas pequeñas, como los encabezados de sección del campus web.
  etiqueta: {
    fontFamily: FUENTES.negrita, fontSize: TAMANOS.diminuto, color: COLORES.textoSecundario,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  negrita: { fontFamily: FUENTES.negrita },
  centrado: { textAlign: 'center' },
});
