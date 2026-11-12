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
  const notas = useConsulta(() => AcademicoRepository.misNotas(bimestre), [bimestre]);

  return (
    <Pantalla consulta={notas}>
      {(datos) => (datos.cursos.length === 0 ? (
        <Vacio icono="ribbon-outline" titulo="Sin cursos" />
      ) : datos.cursos.map((c) => (
        <Tarjeta key={c.id_carga_academica} colorBorde={colorNota(c.promedio)}>
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
  const libreta = useConsulta(() => AcademicoRepository.miLibreta(), []);

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
