import React from 'react';
import { StyleSheet, View } from 'react-native';
import Tarjeta from './Tarjeta';
import Texto from './Texto';
import Etiqueta from './Etiqueta';
import Boton from './Boton';
import { Seccion } from './Basicos';
import { BotonEnlace } from './Items';
import { formatearFechaHora } from '../utils/fechas';
import { ESTADOS_REPORTE, infoEstado, colorNota } from '../config/estados';
import { COLORES, ESPACIO, RADIO } from '../config/tema';

/**
 * ResumenConducta: nota de conducta del bimestre actual, la nota de cada bimestre y los
 * reportes. Lo usan la pantalla del estudiante (MiConducta) y la del personal
 * (ConductaAlumno), que además puede anular reportes (`alAnular`).
 *
 * `datos` es la respuesta de GET /conducta/alumno/<id>.
 */
export default function ResumenConducta({ datos, alAnular }) {
  return (
    <>
      <Tarjeta destacada>
        {/* Antes del primer bimestre no hay bimestre actual: no se muestra "null° bimestre". */}
        <Texto variante="etiqueta" color={COLORES.crema}>
          Nota de conducta{datos.bimestre_actual ? ` · ${datos.bimestre_actual}° bimestre` : ''}
        </Texto>
        <Texto variante="titulo" color={COLORES.blanco} style={estilos.nota}>{datos.nota_actual} / 20</Texto>
        <Texto variante="pequeno" color={COLORES.crema}>Empieza en 20 cada bimestre y baja con cada falta.</Texto>
      </Tarjeta>

      <View style={estilos.bimestres}>
        {datos.notas_por_bimestre.map((b) => (
          <View key={b.bimestre} style={estilos.bimestre}>
            <Texto variante="diminuto">{b.bimestre}° bim.</Texto>
            <Texto variante="subtitulo" color={colorNota(b.nota)}>{b.nota}</Texto>
            <Texto variante="diminuto">−{b.puntos} pts</Texto>
          </View>
        ))}
      </View>

      <Seccion titulo={`Reportes (${datos.reportes.length})`} />
      {datos.reportes.length === 0 && <Texto variante="pequeno">Sin reportes de conducta. ¡Muy bien!</Texto>}
      {datos.reportes.map((r) => {
        const estado = infoEstado(ESTADOS_REPORTE, r.estado);
        const anulado = r.estado === 'ANULADO';
        return (
          <Tarjeta key={r.id_reporte} colorBorde={anulado ? COLORES.borde : COLORES.error}>
            <View style={estilos.fila}>
              <Texto negrita style={[estilos.flex, anulado && estilos.tachado]}>{r.falta}</Texto>
              <Etiqueta texto={estado.texto} tono={estado.tono} />
            </View>
            <Texto variante="pequeno">{r.tipo} · −{r.puntos} pts · {formatearFechaHora(r.fecha_reporte)}</Texto>
            <Texto>{r.descripcion_suceso}</Texto>
            <BotonEnlace texto="Ver evidencia" icono="image-outline" url={r.evidencia_url} />
            {anulado && (
              <Texto variante="pequeno" color={COLORES.textoSecundario}>
                Anulado el {formatearFechaHora(r.fecha_anulacion)}: {r.motivo_anulacion}
              </Texto>
            )}
            {alAnular && !anulado && (
              <Boton titulo="Anular reporte" variante="peligro" pequeno icono="close-circle-outline"
                onPress={() => alAnular(r)} style={estilos.anular} />
            )}
          </Tarjeta>
        );
      })}
    </>
  );
}

const estilos = StyleSheet.create({
  nota: { fontSize: 34 },
  bimestres: { flexDirection: 'row', gap: ESPACIO.sm, marginBottom: ESPACIO.md },
  bimestre: {
    flex: 1, alignItems: 'center', paddingVertical: ESPACIO.sm,
    backgroundColor: COLORES.superficie, borderRadius: RADIO.md, borderWidth: 1, borderColor: COLORES.bordeSuave,
  },
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.sm },
  flex: { flex: 1 },
  tachado: { textDecorationLine: 'line-through', color: COLORES.textoSecundario },
  anular: { alignSelf: 'flex-start', marginTop: ESPACIO.xs },
});
