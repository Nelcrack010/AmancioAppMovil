// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Aula virtual · Cursos   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: CursosView: cursos del año activo. - Estudiante: los cursos de su sección, con su docente. - Docente:
//     los cursos que dicta, con la sección. Al tocar uno se abre el aula virtual del curso.
// Pantalla «Cursos» (src/navigation/pantallas.js): en el menú de ALUMNO («Cursos»), DOCENTE («Mis cursos»)
//     (src/config/menus.js)
//   Se abre desde: InicioDocente.jsx  con navigation.navigate('Cursos', {...})
// Desde aquí se va a: CursoDetalle
//
// Datos (repositorio → endpoint → backend):
//   AcademicoRepository.misCursos() → GET /cursos/mis-cursos (backend: cursos_routes.py → mis_cursos())
// Botones / secciones: «Sin cursos»
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
import Pantalla from '../../components/Pantalla';
import Lista, { ItemLista } from '../../components/Lista';
import { Vacio } from '../../components/Estados';
import { useSesion } from '../../context/SesionContext';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Boton from '../../components/Boton';
import Campo from '../../components/Campo';
import Etiqueta from '../../components/Etiqueta';
import Selector from '../../components/Selector';
import DialogoTexto from '../../components/DialogoTexto';
import { Seccion, Fila, FilaDatos, Dato, Separador } from '../../components/Basicos';
import { Aviso, Cargando } from '../../components/Estados';
import useAccion from '../../viewmodels/useAccion';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import ConductaRepository from '../../repositories/conductaRepository';
import MensajesRepository from '../../repositories/mensajesRepository';
import PerfilRepository from '../../repositories/perfilRepository';
import { confirmar, avisar, avisarResultado } from '../../utils/dialogos';
import { validarTexto, validarEnlace, primerError } from '../../utils/validaciones';
import { formatearFecha, formatearFechaHora, hoyISO, esFechaValida, sumarDias } from '../../utils/fechas';
import { infoEstado, ESTADOS_CITA, ESTADOS_TAREA, ESTADOS_REPORTE } from '../../config/estados';
import { COLORES, ESPACIO, RADIO, SOMBRA } from '../../config/tema';
// <<< FIN KIT DE IMPORTS

/**
 * CursosView: cursos del año activo.
 *   - Estudiante: los cursos de su sección, con su docente.
 *   - Docente: los cursos que dicta, con la sección.
 * Al tocar uno se abre el aula virtual del curso.
 */
export default function CursosView({ navigation }) {
  const { usuario } = useSesion();
  // PISTA: «cursos» = datos que se cargan al abrir la pantalla: AcademicoRepository.misCursos() → GET
  //     /cursos/mis-cursos (backend: cursos_routes.py → mis_cursos()). Úsalos con cursos.datos;
  //     cursos.recargar() vuelve a pedirlos.
  const cursos = useConsulta(() => AcademicoRepository.misCursos(), []);
  const esDocente = usuario.rol === 'DOCENTE';

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
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
