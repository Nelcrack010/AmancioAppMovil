import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import Selector from '../../components/Selector';
import { Dato, FilaDatos } from '../../components/Basicos';
import { Vacio } from '../../components/Estados';
import { BotonEnlace } from '../../components/Items';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import { formatearFechaHora } from '../../utils/fechas';
import { ESTADOS_TAREA, infoEstado } from '../../config/estados';
import { COLORES, ESPACIO } from '../../config/tema';

/**
 * EntregasView (docente): cada estudiante con su entrega (o sin ella) de una tarea.
 * Las entregas sin nota se pueden calificar tocándolas.
 * params: { idTarea }
 */
export default function EntregasView({ navigation, route }) {
  const { idTarea } = route.params;
  const entregas = useConsulta(() => AcademicoRepository.entregas(idTarea), [idTarea]);
  const [filtro, setFiltro] = useState('TODAS');

  return (
    <Pantalla consulta={entregas}>
      {(datos) => {
        const lista = filtro === 'TODAS' ? datos.alumnos : datos.alumnos.filter((a) => a.estado === filtro);
        return (
          <>
            <Tarjeta>
              <Texto variante="subtitulo">{datos.tarea.titulo}</Texto>
              <Texto variante="pequeno">Entrega hasta: {formatearFechaHora(datos.tarea.fecha_entrega)}</Texto>
            </Tarjeta>

            <FilaDatos>
              <Dato valor={datos.resumen.ENTREGADA} rotulo="Por calificar" color={COLORES.azul} />
              <Dato valor={datos.resumen.CALIFICADA} rotulo="Calificadas" color={COLORES.exito} />
              <Dato valor={datos.resumen.PENDIENTE + datos.resumen.VENCIDA} rotulo="Sin entregar" color={COLORES.error} />
            </FilaDatos>

            <Selector
              valor={filtro}
              alCambiar={setFiltro}
              opciones={[
                { valor: 'TODAS', texto: 'Todas' },
                { valor: 'ENTREGADA', texto: 'Por calificar' },
                { valor: 'CALIFICADA', texto: 'Calificadas' },
                { valor: 'PENDIENTE', texto: 'Pendientes' },
                { valor: 'VENCIDA', texto: 'Vencidas' },
              ]}
            />

            {lista.length === 0 && <Vacio titulo="Nadie en este grupo" />}
            {lista.map((a) => {
              const estado = infoEstado(ESTADOS_TAREA, a.estado);
              const porCalificar = a.estado === 'ENTREGADA';
              return (
                <Tarjeta
                  key={a.id_alumno}
                  colorBorde={porCalificar ? COLORES.azul : undefined}
                  onPress={porCalificar
                    ? () => navigation.navigate('CalificarEntrega', { alumno: a, tarea: datos.tarea })
                    : undefined}
                >
                  <View style={estilos.fila}>
                    <Texto negrita style={estilos.flex}>{a.apellidos}, {a.nombres}</Texto>
                    <Etiqueta texto={estado.texto} tono={estado.tono} />
                  </View>
                  {a.fecha_envio && (
                    <Texto variante="diminuto">
                      Enviada: {formatearFechaHora(a.fecha_envio)}{a.fuera_de_plazo ? ' · fuera de plazo' : ''}
                    </Texto>
                  )}
                  {a.calificacion !== null && <Texto variante="pequeno" negrita color={COLORES.exito}>Nota: {a.calificacion}</Texto>}
                  <BotonEnlace texto="Ver trabajo" url={a.archivo_url} />
                  {porCalificar && <Texto variante="pequeno" negrita color={COLORES.azul}>Toca para calificar</Texto>}
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
