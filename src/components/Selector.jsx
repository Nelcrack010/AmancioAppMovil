// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: COMPONENTE · pieza visual reutilizable en varias pantallas
// Qué es: Selector de opciones en forma de "pastillas" desplazables (reemplaza a las pestañas y desplegables del
//     campus web). Se usa para bimestres, secciones, pestañas de un curso...
//   <Selector opciones, valor, alCambiar, style />
// Lo usan: MiAsistenciaView.jsx, MisNotasView.jsx, ConductaView.jsx, RegistrarAsistenciaView.jsx,
//     ReporteAsistenciaView.jsx, AjustesNotificacionesView.jsx, HorarioView.jsx, CursoDetalleView.jsx (+3 más)
//
// Para modificar: un cambio aquí se ve en TODAS las pantallas que lo usan.
//   Si solo quieres cambiar una pantalla, cámbialo en esa pantalla (por ejemplo con una prop o un style).
// <<< FIN GUÍA
import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import Texto from './Texto';
import { COLORES, ESPACIO, RADIO } from '../config/tema';

/**
 * Selector de opciones en forma de "pastillas" desplazables (reemplaza a las pestañas
 * y desplegables del campus web). Se usa para bimestres, secciones, pestañas de un curso...
 *
 *     <Selector
 *       opciones={[{ valor: 1, texto: 'I Bim.' }, { valor: 2, texto: 'II Bim.' }]}
 *       valor={bimestre}
 *       alCambiar={setBimestre}
 *     />
 */
export default function Selector({ opciones, valor, alCambiar, style }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[estilos.fila, style]}
      style={estilos.scroll}
    >
      {opciones.map((opcion) => {
        const activa = opcion.valor === valor;
        return (
          <Pressable
            key={String(opcion.valor)}
            onPress={() => alCambiar(opcion.valor)}
            accessibilityRole="button"
            accessibilityState={{ selected: activa }}
            style={[estilos.opcion, activa && estilos.activa]}
          >
            <Texto variante="pequeno" negrita color={activa ? COLORES.blanco : COLORES.textoSecundario}>
              {opcion.texto}
            </Texto>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  scroll: { flexGrow: 0, marginBottom: ESPACIO.md },
  fila: { gap: ESPACIO.sm },
  opcion: {
    paddingHorizontal: ESPACIO.lg,
    paddingVertical: ESPACIO.sm,
    borderRadius: RADIO.total,
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  // Igual que la pestaña activa del campus web: azul con texto blanco.
  activa: { backgroundColor: COLORES.azul, borderColor: COLORES.azul },
});
