import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import Selector from '../../components/Selector';
import { Dato, FilaDatos, Seccion } from '../../components/Basicos';
import { Vacio } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import { formatearFecha, nombreDia } from '../../utils/fechas';
import { ESTADOS_ASISTENCIA, infoEstado } from '../../config/estados';
import { COLORES, ESPACIO } from '../../config/tema';

const NOMBRES_MES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto',
  'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const TODOS = 'TODOS';

/**
 * MiAsistenciaView (estudiante): total de faltas, tardanzas y justificadas del año, y el
 * detalle por día, que se puede filtrar por mes.
 */
export default function MiAsistenciaView() {
  const asistencia = useConsulta(() => AsistenciaRepository.mia(), []);
  const [mes, setMes] = useState(TODOS);

  return (
    <Pantalla consulta={asistencia}>
      {(datos) => {
        const r = datos.resumen;
        // Meses que tienen registros, para el filtro ("2026-10" → "Octubre").
        const meses = [...new Set(datos.registros.map((x) => x.fecha.slice(0, 7)))];
        const registros = mes === TODOS ? datos.registros : datos.registros.filter((x) => x.fecha.startsWith(mes));
        const total = r.P + r.T + r.F + r.J;

        return (
          <>
            <FilaDatos>
              <Dato valor={r.P} rotulo="Presente" color={COLORES.exito} />
              <Dato valor={r.T} rotulo="Tardanzas" color={COLORES.alerta} />
              <Dato valor={r.F} rotulo="Faltas" color={COLORES.error} />
              <Dato valor={r.J} rotulo="Justificadas" color={COLORES.azul} />
            </FilaDatos>
            {total > 0 && (
              <Texto variante="pequeno" centrado>
                Asistencia: {Math.round(((r.P + r.T) * 100) / total)}% de {total} día(s) registrados
              </Texto>
            )}

            <Seccion titulo="Detalle por día" />
            {meses.length > 1 && (
              <Selector
                valor={mes}
                alCambiar={setMes}
                opciones={[
                  { valor: TODOS, texto: 'Todos' },
                  ...meses.map((m) => ({ valor: m, texto: NOMBRES_MES[Number(m.slice(5, 7)) - 1] })),
                ]}
              />
            )}
            {registros.length === 0 ? (
              <Vacio icono="calendar-outline" titulo="Sin registros" />
            ) : registros.map((x) => {
              const estado = infoEstado(ESTADOS_ASISTENCIA, x.estado);
              return (
                <Tarjeta key={x.fecha}>
                  <View style={estilos.fila}>
                    <Texto style={estilos.flex}>{nombreDia(x.fecha)}, {formatearFecha(x.fecha)}</Texto>
                    <Etiqueta texto={estado.texto} tono={estado.tono} />
                  </View>
                  {x.observacion && <Texto variante="pequeno">{x.observacion}</Texto>}
                </Tarjeta>
              );
            })}
          </>
        );
      }}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.sm },
  flex: { flex: 1 },
});
