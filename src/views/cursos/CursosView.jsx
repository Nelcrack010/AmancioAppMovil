import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import { Vacio } from '../../components/Estados';
import { useSesion } from '../../context/SesionContext';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import { COLORES, ESPACIO, RADIO } from '../../config/tema';

/**
 * CursosView: cursos del año activo.
 *   - Estudiante: los cursos de su sección, con su docente.
 *   - Docente: los cursos que dicta, con la sección.
 * Al tocar uno se abre el aula virtual del curso.
 */
export default function CursosView({ navigation }) {
  const { usuario } = useSesion();
  const cursos = useConsulta(() => AcademicoRepository.misCursos(), []);
  const esDocente = usuario.rol === 'DOCENTE';

  return (
    <Pantalla consulta={cursos}>
      {(lista) => (lista.length === 0 ? (
        <Vacio icono="book-outline" titulo="Sin cursos" mensaje="No tienes cursos asignados en el año activo." />
      ) : lista.map((c) => {
        const seccion = `${c.grado} ${c.seccion} · ${c.nivel}`;
        return (
          <Tarjeta
            key={c.id_carga_academica}
            colorBorde={COLORES.guinda}
            onPress={() => navigation.navigate('CursoDetalle', {
              idCarga: c.id_carga_academica,
              titulo: esDocente ? `${c.curso} · ${c.grado} ${c.seccion}` : c.curso,
            })}
          >
            <View style={estilos.fila}>
              <View style={estilos.icono}>
                <Ionicons name="book" size={22} color={COLORES.guinda} />
              </View>
              <View style={estilos.flex}>
                <Texto negrita>{c.curso}</Texto>
                <Texto variante="pequeno">{esDocente ? seccion : c.docente}</Texto>
                <Texto variante="diminuto">{c.area} · {c.anio}</Texto>
              </View>
            </View>
          </Tarjeta>
        );
      }))}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.md },
  flex: { flex: 1, gap: 2 },
  icono: {
    width: 44, height: 44, borderRadius: RADIO.md, backgroundColor: COLORES.crema,
    alignItems: 'center', justifyContent: 'center',
  },
});
