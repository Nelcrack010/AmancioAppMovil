import React from 'react';
import Texto from '../../components/Texto';
import Lista, { ItemLista } from '../../components/Lista';
import { Seccion, Dato, FilaDatos } from '../../components/Basicos';
import { formatearFecha, soloHora } from '../../utils/fechas';
import { COLORES } from '../../config/tema';

/** Panel del psicólogo: citas de hoy y solicitudes pendientes de programar. */
export default function InicioPsicologo({ datos, navigation }) {
  const abrir = (cita) => navigation.navigate('CitaDetalle', { cita, titulo: cita.alumno });

  return (
    <>
      <FilaDatos>
        <Dato valor={datos.citas_de_hoy.length} rotulo="Citas de hoy" />
        <Dato valor={datos.solicitudes_pendientes} rotulo="Solicitudes pendientes" color={COLORES.alerta} />
      </FilaDatos>

      <Seccion titulo="Citas de hoy" />
      {datos.citas_de_hoy.length === 0 ? (
        <Texto variante="pequeno">No tienes citas programadas para hoy.</Texto>
      ) : (
        <Lista>
          {datos.citas_de_hoy.map((c) => (
            <ItemLista
              key={c.id_cita}
              izquierda={<Texto variante="subtitulo" color={COLORES.azul}>{soloHora(c.fecha_cita)}</Texto>}
              titulo={c.alumno}
              subtitulo={c.motivo}
              onPress={() => abrir(c)}
            />
          ))}
        </Lista>
      )}

      <Seccion titulo="Solicitudes por programar" />
      {datos.solicitudes.length === 0 ? (
        <Texto variante="pequeno">No hay solicitudes pendientes.</Texto>
      ) : (
        <Lista>
          {datos.solicitudes.map((c) => (
            <ItemLista
              key={c.id_cita}
              icono="time"
              colorIcono={COLORES.alerta}
              fondoIcono={COLORES.alertaFondo}
              titulo={c.alumno}
              subtitulo={c.motivo}
              detalle={`Solicitada el ${formatearFecha(c.fecha_solicitud)}${c.disponibilidad ? ` · ${c.disponibilidad}` : ''}`}
              onPress={() => abrir(c)}
            />
          ))}
          {datos.solicitudes_pendientes > datos.solicitudes.length && (
            <ItemLista icono="calendar" titulo="Ver todas en la agenda" onPress={() => navigation.navigate('Agenda')} />
          )}
        </Lista>
      )}
    </>
  );
}
