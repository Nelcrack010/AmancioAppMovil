// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: COMPONENTE · pieza visual reutilizable en varias pantallas
// Qué es: Lista agrupada: una sola tarjeta blanca con filas separadas por una línea fina (como la pantalla de
//     ajustes del celular). Es la forma estándar de mostrar listas en la app: cursos, mensajes, tareas,
//     estudiantes, citas...
//   <Lista children, style />
//   <ItemLista icono, colorIcono = COLORES.guinda, fondoIcono = COLORES.crema, izquierda, titulo, subtitulo,
//       detalle, derecha, onPress, resaltado = false, acento />
//   <BotonIcono icono, onPress, color = COLORES.textoSecundario, etiqueta />
// Lo usan: Items.jsx, MiAsistenciaView.jsx, ConductaView.jsx, ReporteAsistenciaView.jsx, CatalogoFaltasView.jsx,
//     HorarioView.jsx, NotificacionesView.jsx, PerfilView.jsx (+14 más)
//
// Para modificar: un cambio aquí se ve en TODAS las pantallas que lo usan.
//   Si solo quieres cambiar una pantalla, cámbialo en esa pantalla (por ejemplo con una prop o un style).
// <<< FIN GUÍA
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Texto from './Texto';
import { COLORES, ESPACIO, RADIO, SOMBRA } from '../config/tema';

/**
 * Lista agrupada: una sola tarjeta blanca con filas separadas por una línea fina
 * (como la pantalla de ajustes del celular). Es la forma estándar de mostrar listas
 * en la app: cursos, mensajes, tareas, estudiantes, citas...
 *
 *     <Lista>
 *       <ItemLista icono="book" titulo="Matemática" subtitulo="Carlos Mendoza" onPress={...} />
 *       <ItemLista icono="book" titulo="Comunicación" subtitulo="María Salazar" onPress={...} />
 *     </Lista>
 */
export default function Lista({ children, style }) {
  // Se quitan los hijos vacíos (false, null) para no dibujar separadores de más.
  const filas = React.Children.toArray(children).filter(Boolean);
  if (filas.length === 0) return null;

  return (
    <View style={[estilos.lista, style]}>
      {filas.map((fila, i) => (
        <React.Fragment key={fila.key ?? i}>
          {i > 0 && <View style={estilos.separador} />}
          {fila}
        </React.Fragment>
      ))}
    </View>
  );
}

/**
 * Una fila de la lista.
 *
 * Props:
 *   - icono / colorIcono: ícono de Ionicons a la izquierda, dentro de un cuadrito de color
 *   - izquierda:          o cualquier otro elemento a la izquierda (por ejemplo un <Avatar>)
 *   - titulo, subtitulo, detalle: tres niveles de texto (detalle es el más pequeño)
 *   - derecha:            elemento a la derecha (una <Etiqueta>, una nota, un botón...)
 *   - onPress:            hace la fila tocable y muestra la flecha ">"
 *   - resaltado:          título en negrita (por ejemplo, un aviso sin leer)
 *   - acento:             puntito de color antes del título (un estado que llama la atención)
 */
export function ItemLista({
  icono, colorIcono = COLORES.guinda, fondoIcono = COLORES.crema, izquierda,
  titulo, subtitulo, detalle, derecha, onPress, resaltado = false, acento,
}) {
  const contenido = (
    <>
      {izquierda || (icono && (
        <View style={[estilos.icono, { backgroundColor: fondoIcono }]}>
          <Ionicons name={icono} size={18} color={colorIcono} />
        </View>
      ))}

      <View style={estilos.textos}>
        <View style={estilos.filaTitulo}>
          {acento && <View style={[estilos.acento, { backgroundColor: acento }]} />}
          <Texto negrita={resaltado} style={[estilos.titulo, resaltado && estilos.tituloResaltado]} numberOfLines={2}>
            {titulo}
          </Texto>
        </View>
        {Boolean(subtitulo) && <Texto variante="pequeno" numberOfLines={2}>{subtitulo}</Texto>}
        {Boolean(detalle) && <Texto variante="diminuto" numberOfLines={2}>{detalle}</Texto>}
      </View>

      {derecha}
      {onPress && <Ionicons name="chevron-forward" size={18} color={COLORES.textoSuave} />}
    </>
  );

  if (!onPress) return <View style={estilos.fila}>{contenido}</View>;

  return (
    <Pressable
      onPress={onPress}
      // En el navegador una fila tocable no puede ser "button" si lleva botones adentro.
      accessibilityRole={Platform.OS === 'web' ? undefined : 'button'}
      style={({ pressed }) => [estilos.fila, pressed && estilos.presionada]}
    >
      {contenido}
    </Pressable>
  );
}

/** Botón redondo con solo un ícono, para acciones dentro de una fila (editar, eliminar...). */
export function BotonIcono({ icono, onPress, color = COLORES.textoSecundario, etiqueta }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={({ pressed }) => [estilos.botonIcono, pressed && estilos.presionada]}
    >
      <Ionicons name={icono} size={19} color={color} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  lista: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.lg,
    marginBottom: ESPACIO.md,
    overflow: 'hidden',
    ...SOMBRA,
  },
  separador: { height: 1, backgroundColor: COLORES.linea, marginLeft: ESPACIO.lg },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.md,
    paddingHorizontal: ESPACIO.lg,
    paddingVertical: ESPACIO.md,
    minHeight: 56,
    backgroundColor: COLORES.superficie,
  },
  presionada: { backgroundColor: COLORES.bordeSuave },
  icono: {
    width: 36,
    height: 36,
    borderRadius: RADIO.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1, gap: 2 },
  filaTitulo: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.xs + 2 },
  titulo: { flexShrink: 1 },
  tituloResaltado: { color: COLORES.texto },
  acento: { width: 8, height: 8, borderRadius: 4 },
  botonIcono: {
    width: 34,
    height: 34,
    borderRadius: RADIO.total,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
