import React, { useLayoutEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Selector from '../../components/Selector';
import Texto from '../../components/Texto';
import { useSesion } from '../../context/SesionContext';
import PestanaTareas from './pestanas/PestanaTareas';
import PestanaMateriales from './pestanas/PestanaMateriales';
import PestanaClases from './pestanas/PestanaClases';
import PestanaAlumnos from './pestanas/PestanaAlumnos';
import { COLORES, ESPACIO, RADIO } from '../../config/tema';

/**
 * CursoDetalleView: aula virtual de un curso, organizada en pestañas.
 *   - Estudiante: Tareas, Materiales y Clases virtuales.
 *   - Docente: lo mismo, más Estudiantes, y el botón "Notas" en la cabecera que abre el
 *     registro de notas.
 *
 * Cada pestaña es un componente aparte (carpeta ./pestanas) con su propia consulta.
 * params: { idCarga, titulo, pestana? }
 */
export default function CursoDetalleView({ navigation, route }) {
  const { idCarga, titulo, pestana: pestanaInicial = 'tareas' } = route.params;
  const { usuario } = useSesion();
  const esDocente = usuario.rol === 'DOCENTE';
  const [pestana, setPestana] = useState(pestanaInicial);

  // Docente: acceso al registro de notas desde la cabecera (deja más espacio a la lista).
  useLayoutEffect(() => {
    if (!esDocente) return;
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('NotasCurso', { idCarga, titulo: `Notas · ${titulo}` })}
          style={estilos.botonNotas}
          accessibilityRole="button"
          accessibilityLabel="Registro de notas"
        >
          <Ionicons name="ribbon-outline" size={16} color={COLORES.blanco} />
          <Texto variante="pequeno" negrita color={COLORES.blanco}>Notas</Texto>
        </Pressable>
      ),
    });
  }, [navigation, esDocente, idCarga, titulo]);

  const opciones = [
    { valor: 'tareas', texto: 'Tareas' },
    { valor: 'materiales', texto: 'Materiales' },
    { valor: 'clases', texto: 'Clases' },
    ...(esDocente ? [{ valor: 'alumnos', texto: 'Estudiantes' }] : []),
  ];

  const props = { idCarga, esDocente, navigation };

  return (
    <View style={estilos.fondo}>
      <View style={estilos.barra}>
        <Selector opciones={opciones} valor={pestana} alCambiar={setPestana} style={estilos.selector} />
      </View>

      {pestana === 'tareas' && <PestanaTareas {...props} />}
      {pestana === 'materiales' && <PestanaMateriales {...props} />}
      {pestana === 'clases' && <PestanaClases {...props} />}
      {pestana === 'alumnos' && <PestanaAlumnos {...props} />}
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORES.fondo },
  barra: { paddingTop: ESPACIO.md, paddingHorizontal: ESPACIO.lg },
  selector: { paddingRight: ESPACIO.lg },
  botonNotas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.xs,
    backgroundColor: COLORES.guinda,
    paddingHorizontal: ESPACIO.md,
    paddingVertical: ESPACIO.xs + 2,
    borderRadius: RADIO.total,
    marginRight: ESPACIO.sm,
  },
});
