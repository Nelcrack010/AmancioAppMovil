import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Selector from '../../components/Selector';
import Boton from '../../components/Boton';
import { useSesion } from '../../context/SesionContext';
import PestanaTareas from './pestanas/PestanaTareas';
import PestanaMateriales from './pestanas/PestanaMateriales';
import PestanaClases from './pestanas/PestanaClases';
import PestanaAlumnos from './pestanas/PestanaAlumnos';
import { COLORES, ESPACIO } from '../../config/tema';

/**
 * CursoDetalleView: aula virtual de un curso, organizada en pestañas.
 *   - Estudiante: Tareas, Materiales y Clases virtuales.
 *   - Docente: lo mismo, más Estudiantes y el acceso al registro de notas.
 *
 * Cada pestaña es un componente aparte (carpeta ./pestanas) con su propia consulta.
 * params: { idCarga, titulo, pestana? }
 */
export default function CursoDetalleView({ navigation, route }) {
  const { idCarga, pestana: pestanaInicial = 'tareas' } = route.params;
  const { usuario } = useSesion();
  const esDocente = usuario.rol === 'DOCENTE';
  const [pestana, setPestana] = useState(pestanaInicial);

  const opciones = [
    { valor: 'tareas', texto: 'Tareas' },
    { valor: 'materiales', texto: 'Materiales' },
    { valor: 'clases', texto: 'Clases virtuales' },
    ...(esDocente ? [{ valor: 'alumnos', texto: 'Estudiantes' }] : []),
  ];

  const props = { idCarga, esDocente, navigation };

  return (
    <View style={estilos.fondo}>
      <View style={estilos.barra}>
        <Selector opciones={opciones} valor={pestana} alCambiar={setPestana} style={estilos.selector} />
        {esDocente && (
          <Boton
            titulo="Registro de notas"
            icono="ribbon-outline"
            variante="guinda"
            pequeno
            onPress={() => navigation.navigate('NotasCurso', { idCarga, titulo: `Notas · ${route.params.titulo}` })}
          />
        )}
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
  barra: {
    paddingTop: ESPACIO.md,
    paddingHorizontal: ESPACIO.lg,
    paddingBottom: ESPACIO.sm,
    backgroundColor: COLORES.superficie,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.borde,
  },
  selector: { paddingRight: ESPACIO.lg },
});
