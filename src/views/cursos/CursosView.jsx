import React from 'react';
import Pantalla from '../../components/Pantalla';
import Lista, { ItemLista } from '../../components/Lista';
import { Vacio } from '../../components/Estados';
import { useSesion } from '../../context/SesionContext';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';

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
      ) : (
        <Lista>
          {lista.map((c) => (
            <ItemLista
              key={c.id_carga_academica}
              icono="book"
              titulo={c.curso}
              subtitulo={esDocente ? `${c.grado} ${c.seccion} · ${c.nivel}` : c.docente}
              detalle={[c.area, c.anio].filter(Boolean).join(' · ')}
              onPress={() => navigation.navigate('CursoDetalle', {
                idCarga: c.id_carga_academica,
                titulo: esDocente ? `${c.curso} · ${c.grado} ${c.seccion}` : c.curso,
              })}
            />
          ))}
        </Lista>
      ))}
    </Pantalla>
  );
}
