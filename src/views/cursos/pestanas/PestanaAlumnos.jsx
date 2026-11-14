import React from 'react';
import { StyleSheet } from 'react-native';
import Pantalla from '../../../components/Pantalla';
import Texto from '../../../components/Texto';
import Lista, { ItemLista } from '../../../components/Lista';
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
          <Lista>
            {datos.alumnos.map((a) => (
              <ItemLista
                key={a.id_alumno}
                izquierda={<Avatar nombre={`${a.nombres} ${a.apellidos}`} tamano={36} />}
                titulo={`${a.apellidos}, ${a.nombres}`}
                subtitulo={`DNI ${a.dni}`}
                onPress={() => navigation.navigate('ConductaAlumno', { idAlumno: a.id_alumno, titulo: a.nombres })}
              />
            ))}
          </Lista>
        </>
      ))}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  total: { marginBottom: ESPACIO.sm, paddingHorizontal: ESPACIO.xs },
});
