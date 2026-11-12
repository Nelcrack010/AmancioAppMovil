import React from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../../components/Pantalla';
import Tarjeta from '../../../components/Tarjeta';
import Texto from '../../../components/Texto';
import { Avatar } from '../../../components/Basicos';
import { Vacio } from '../../../components/Estados';
import useConsulta from '../../../viewmodels/useConsulta';
import AcademicoRepository from '../../../repositories/academicoRepository';
import { ESPACIO } from '../../../config/tema';

/**
 * Pestaña "Estudiantes" (solo docente): alumnos matriculados en la sección del curso.
 * Al tocar uno se ve su estado de conducta.
 */
export default function PestanaAlumnos({ idCarga, navigation }) {
  const alumnos = useConsulta(() => AcademicoRepository.alumnosDeCurso(idCarga), [idCarga]);

  return (
    <Pantalla consulta={alumnos}>
      {(datos) => (datos.alumnos.length === 0 ? (
        <Vacio icono="people-outline" titulo="Sin estudiantes" />
      ) : (
        <>
          <Texto variante="pequeno" style={estilos.total}>{datos.alumnos.length} estudiante(s) matriculado(s)</Texto>
          {datos.alumnos.map((a, i) => {
            const nombre = `${a.apellidos}, ${a.nombres}`;
            return (
              <Tarjeta
                key={a.id_alumno}
                onPress={() => navigation.navigate('ConductaAlumno', { idAlumno: a.id_alumno, titulo: a.nombres })}
              >
                <View style={estilos.fila}>
                  <Avatar nombre={`${a.nombres} ${a.apellidos}`} tamano={36} />
                  <View style={estilos.flex}>
                    <Texto negrita>{i + 1}. {nombre}</Texto>
                    <Texto variante="diminuto">DNI {a.dni}</Texto>
                  </View>
                </View>
              </Tarjeta>
            );
          })}
        </>
      ))}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  total: { marginBottom: ESPACIO.sm },
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.md },
  flex: { flex: 1 },
});
