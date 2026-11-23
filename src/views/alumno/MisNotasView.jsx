// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Académico (año y secciones), Notas   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: MisNotasView (estudiante): notas por bimestre (cada evaluación y el promedio del curso) y la libreta,
//     que solo muestra los bimestres ya cerrados.
// Pantalla «MisNotas» (src/navigation/pantallas.js): en el menú de ALUMNO («Notas») (src/config/menus.js)
//   Se abre desde: InicioAlumno.jsx  con navigation.navigate('MisNotas', {...})
//
// Datos (repositorio → endpoint → backend):
//   AcademicoRepository.anioActivo() → GET /academico/anio-activo (backend: academico_routes.py → anio_activo())
//   AcademicoRepository.miLibreta() → GET /notas/mi-libreta (backend: nota_routes.py → mi_libreta())
//   AcademicoRepository.misNotas() → GET /notas/mis-notas (backend: nota_routes.py → mis_notas())
// Botones / secciones: «Libreta vacía», «Sin cursos»
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
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Selector from '../../components/Selector';
import Etiqueta from '../../components/Etiqueta';
import { Fila } from '../../components/Basicos';
import { Aviso, Cargando, Vacio } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import { bimestreActual } from '../../utils/fechas';
import { colorNota } from '../../config/estados';
import { COLORES, ESPACIO } from '../../config/tema';

const LIBRETA = 'LIBRETA';
const OPCIONES = [
  ...[1, 2, 3, 4].map((n) => ({ valor: n, texto: `${n}° bimestre` })),
  { valor: LIBRETA, texto: 'Libreta' },
];

/**
 * MisNotasView (estudiante): notas por bimestre (cada evaluación y el promedio del
 * curso) y la libreta, que solo muestra los bimestres ya cerrados.
 */
export default function MisNotasView() {
  // PISTA: «anio» = datos que se cargan al abrir la pantalla: AcademicoRepository.anioActivo() → GET
  //     /academico/anio-activo (backend: academico_routes.py → anio_activo()). Úsalos con anio.datos;
  //     anio.recargar() vuelve a pedirlos.
  const anio = useConsulta(() => AcademicoRepository.anioActivo(), []);
  const [vista, setVista] = useState(null);

  // Empezar en el bimestre en curso (según las fechas del año escolar).
  useEffect(() => {
    if (vista === null && anio.datos) setVista(bimestreActual(anio.datos.bimestres));
  }, [anio.datos, vista]);
  // Sin conexión y sin año guardado: empezar en el 1.° bimestre.
  useEffect(() => {
    if (vista === null && anio.error) setVista(1);
  }, [anio.error, vista]);

  if (vista === null) return <Cargando />;

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <View style={estilos.fondo}>
      <View style={estilos.barra}>
        <Selector opciones={OPCIONES} valor={vista} alCambiar={setVista} />
      </View>
      {vista === LIBRETA ? <Libreta /> : <NotasDelBimestre bimestre={vista} />}
    </View>
  );
}

/** Cursos del bimestre con sus evaluaciones y el promedio. */
function NotasDelBimestre({ bimestre }) {
  // PISTA: «notas» = datos que se cargan al abrir la pantalla: AcademicoRepository.misNotas() → GET
  //     /notas/mis-notas (backend: nota_routes.py → mis_notas()). Úsalos con notas.datos; notas.recargar()
  //     vuelve a pedirlos.
  const notas = useConsulta(() => AcademicoRepository.misNotas(bimestre), [bimestre]);

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla consulta={notas}>
      {(datos) => (datos.cursos.length === 0 ? (
        <Vacio icono="ribbon-outline" titulo="Sin cursos" />
      ) : datos.cursos.map((c) => (
        <Tarjeta key={c.id_carga_academica}>
          <View style={estilos.fila}>
            <View style={estilos.flex}>
              <Texto negrita>{c.curso}</Texto>
              <Texto variante="diminuto">{c.docente}</Texto>
            </View>
            <Texto variante="titulo" color={colorNota(c.promedio)}>{c.promedio ?? '—'}</Texto>
          </View>
          {c.evaluaciones.length === 0
            ? <Texto variante="pequeno">Sin evaluaciones en este bimestre.</Texto>
            : c.evaluaciones.map((e) => <Fila key={e.evaluacion} rotulo={e.evaluacion} valor={e.valor} />)}
        </Tarjeta>
      )))}
    </Pantalla>
  );
}

/** Libreta: consolidado por curso de los bimestres cerrados. */
function Libreta() {
  // PISTA: «libreta» = datos que se cargan al abrir la pantalla: AcademicoRepository.miLibreta() → GET
  //     /notas/mi-libreta (backend: nota_routes.py → mi_libreta()). Úsalos con libreta.datos; libreta.recargar()
  //     vuelve a pedirlos.
  const libreta = useConsulta(() => AcademicoRepository.miLibreta(), []);

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla consulta={libreta}>
      {(datos) => (datos.cursos.length === 0 ? (
        <Vacio icono="document-outline" titulo="Libreta vacía" mensaje="Aparecerá cuando tus docentes cierren el primer bimestre." />
      ) : (
        <>
          <Aviso tono="info">Libreta {datos.anio}: solo se muestran los bimestres cerrados.</Aviso>
          {datos.cursos.map((c) => (
            <Tarjeta key={c.id_curso}>
              <View style={estilos.fila}>
                <Texto negrita style={estilos.flex}>{c.curso}</Texto>
                <Etiqueta texto={c.estado_curso} tono={c.estado_curso === 'APROBADO' ? 'exito' : c.estado_curso === 'DESAPROBADO' ? 'error' : 'info'} />
              </View>
              <View style={estilos.bimestres}>
                {[1, 2, 3, 4].map((n) => {
                  const valor = c[`nota_bimestre${n}`];
                  return (
                    <View key={n} style={estilos.bimestre}>
                      <Texto variante="diminuto">{n}° B</Texto>
                      <Texto negrita color={colorNota(valor)}>{valor ?? '—'}</Texto>
                    </View>
                  );
                })}
                <View style={[estilos.bimestre, estilos.final]}>
                  <Texto variante="diminuto" color={COLORES.crema}>Final</Texto>
                  <Texto negrita color={COLORES.blanco}>{c.promedio_final ?? '—'}</Texto>
                </View>
              </View>
            </Tarjeta>
          ))}
        </>
      ))}
    </Pantalla>
  );
}

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORES.fondo },
  barra: {
    paddingTop: ESPACIO.md, paddingHorizontal: ESPACIO.lg,
    backgroundColor: COLORES.superficie, borderBottomWidth: 1, borderBottomColor: COLORES.borde,
  },
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.sm },
  flex: { flex: 1 },
  bimestres: { flexDirection: 'row', gap: ESPACIO.xs, marginTop: ESPACIO.sm },
  bimestre: {
    flex: 1, alignItems: 'center', paddingVertical: ESPACIO.sm,
    backgroundColor: COLORES.fondo, borderRadius: 8,
  },
  final: { backgroundColor: COLORES.guinda },
});
