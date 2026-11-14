import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import Selector from '../../components/Selector';
import Lista, { ItemLista } from '../../components/Lista';
import { Avatar, Dato, FilaDatos } from '../../components/Basicos';
import { Vacio } from '../../components/Estados';
import { abrirEnlace } from '../../components/Items';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import { formatearFechaHora } from '../../utils/fechas';
import { ESTADOS_TAREA, colorNota, infoEstado } from '../../config/estados';
import { COLORES, ESPACIO } from '../../config/tema';

/**
 * EntregasView (docente): cada estudiante con su entrega (o sin ella) de una tarea.
 *   - "Por calificar": al tocarla se abre la pantalla para poner la nota.
 *   - "Calificada": al tocarla se abre el trabajo enviado.
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
            <Texto variante="pequeno" style={estilos.plazo}>
              Entrega hasta el {formatearFechaHora(datos.tarea.fecha_entrega)}
            </Texto>

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

            {lista.length === 0 ? <Vacio titulo="Nadie en este grupo" /> : (
              <Lista>
                {lista.map((a) => {
                  const estado = infoEstado(ESTADOS_TAREA, a.estado);
                  const porCalificar = a.estado === 'ENTREGADA';
                  let alTocar;
                  if (porCalificar) alTocar = () => navigation.navigate('CalificarEntrega', { alumno: a, tarea: datos.tarea });
                  else if (a.archivo_url) alTocar = () => abrirEnlace(a.archivo_url);

                  return (
                    <ItemLista
                      key={a.id_alumno}
                      izquierda={<Avatar nombre={`${a.nombres} ${a.apellidos}`} tamano={36} />}
                      titulo={`${a.apellidos}, ${a.nombres}`}
                      subtitulo={a.fecha_envio
                        ? `Enviada: ${formatearFechaHora(a.fecha_envio)}${a.fuera_de_plazo ? ' · fuera de plazo' : ''}`
                        : 'Sin entregar'}
                      detalle={porCalificar ? 'Toca para calificar' : undefined}
                      acento={porCalificar ? COLORES.azul : undefined}
                      derecha={(
                        <View style={estilos.derecha}>
                          <Etiqueta texto={estado.texto} tono={estado.tono} />
                          {a.calificacion !== null && (
                            <Texto negrita color={colorNota(a.calificacion)}>{a.calificacion}</Texto>
                          )}
                        </View>
                      )}
                      onPress={alTocar}
                    />
                  );
                })}
              </Lista>
            )}
          </>
        );
      }}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  plazo: { marginBottom: ESPACIO.md, paddingHorizontal: ESPACIO.xs },
  derecha: { alignItems: 'flex-end', gap: ESPACIO.xs },
});
