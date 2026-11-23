// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Aula virtual · Cursos   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: Pestaña "Estudiantes" (solo docente): alumnos matriculados en la sección del curso. Al tocar uno se ve
//     su estado de conducta.
// Se muestra dentro de: CursoDetalleView.jsx
// Desde aquí se va a: ConductaAlumno
//
// Datos (repositorio → endpoint → backend):
//   AcademicoRepository.alumnosDeCurso() → GET /cursos/<int:id_carga>/alumnos (backend: cursos_routes.py →
//       alumnos_del_curso())
// Botones / secciones: «Sin estudiantes»
//
// Para modificar:
//   • Texto, etiqueta o botón → búscalo aquí abajo (Ctrl+F) y cámbialo.
//   • Mostrar un campo nuevo → primero que venga en el JSON (SELECT del repository del backend), luego aquí:
//     {x.campo && <Texto variante="pequeno">Campo: {x.campo}</Texto>}
//   • Campo de formulario → const [valor, setValor] = useState(''); <Campo etiqueta="..." valor={valor}
//       alCambiar={setValor} />
//     y agrégalo al objeto que se envía en accion.ejecutar(...).
//   • Regla local → validarTexto/validarEnlace dentro de primerError(...) (src/utils/validaciones.js). Pon la
//       misma regla en el service.
//   • Botón → <Boton titulo="..." variante="primario|guinda|secundario|peligro|texto" pequeno onPress={() =>
//       ...} />
//   • Ir a otra pantalla → navigation.navigate('Nombre', { id }). Pantalla nueva: src/navigation/pantallas.js.
// <<< FIN GUÍA
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
  // PISTA: «alumnos» = datos que se cargan al abrir la pantalla: AcademicoRepository.alumnosDeCurso() → GET
  //     /cursos/<int:id_carga>/alumnos (backend: cursos_routes.py → alumnos_del_curso()). Úsalos con
  //     alumnos.datos; alumnos.recargar() vuelve a pedirlos.
  const alumnos = useConsulta(() => AcademicoRepository.alumnosDeCurso(idCarga), [idCarga]);

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
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

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  total: { marginBottom: ESPACIO.sm, paddingHorizontal: ESPACIO.xs },
});
