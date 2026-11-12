import React from 'react';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import { Seccion, Dato, FilaDatos } from '../../components/Basicos';
import { formatearFecha, soloHora } from '../../utils/fechas';
import { COLORES } from '../../config/tema';

/** Panel del psicólogo: citas de hoy y solicitudes pendientes de programar. */
export default function InicioPsicologo({ datos, navigation }) {
  const abrir = (cita) => navigation.navigate('CitaDetalle', { cita });

  return (
    <>
      <FilaDatos>
        <Dato valor={datos.citas_de_hoy.length} rotulo="Citas de hoy" />
        <Dato valor={datos.solicitudes_pendientes} rotulo="Solicitudes pendientes" color={COLORES.alerta} />
      </FilaDatos>

      <Seccion titulo="Citas de hoy" />
      {datos.citas_de_hoy.length === 0 ? (
        <Texto variante="pequeno">No tienes citas programadas para hoy.</Texto>
      ) : datos.citas_de_hoy.map((c) => (
        <Tarjeta key={c.id_cita} colorBorde={COLORES.azul} onPress={() => abrir(c)}>
          <Texto negrita>{soloHora(c.fecha_cita)} · {c.alumno}</Texto>
          <Texto variante="pequeno">{c.motivo}</Texto>
        </Tarjeta>
      ))}

      <Seccion titulo="Solicitudes por programar" />
      {datos.solicitudes.length === 0 ? (
        <Texto variante="pequeno">No hay solicitudes pendientes.</Texto>
      ) : datos.solicitudes.map((c) => (
        <Tarjeta key={c.id_cita} colorBorde={COLORES.alerta} onPress={() => abrir(c)}>
          <Texto negrita>{c.alumno}</Texto>
          <Texto variante="pequeno">{c.motivo}</Texto>
          <Texto variante="diminuto">
            Solicitada el {formatearFecha(c.fecha_solicitud)}
            {c.disponibilidad ? ` · Disponibilidad: ${c.disponibilidad}` : ''}
          </Texto>
        </Tarjeta>
      ))}

      {datos.solicitudes_pendientes > datos.solicitudes.length && (
        <Tarjeta onPress={() => navigation.navigate('Agenda')}>
          <Texto negrita color={COLORES.azul}>Ver todas en la agenda</Texto>
        </Tarjeta>
      )}
    </>
  );
}
