import React from 'react';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import { Dato, Fila, FilaDatos } from '../../components/Basicos';
import { Aviso, Vacio } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import ConductaRepository from '../../repositories/conductaRepository';
import { formatearFecha, formatearFechaHora } from '../../utils/fechas';
import { ESTADOS_CITA, infoEstado } from '../../config/estados';
import { COLORES } from '../../config/tema';

/**
 * HistorialAlumnoView (psicólogo): todas las citas de un estudiante con las
 * observaciones de cada atención (información reservada para psicología).
 * params: { idAlumno }
 */
export default function HistorialAlumnoView({ route }) {
  const { idAlumno } = route.params;
  const historial = useConsulta(() => ConductaRepository.historialCitas(idAlumno), [idAlumno]);

  return (
    <Pantalla consulta={historial}>
      {(datos) => (
        <>
          <Texto variante="subtitulo">{datos.alumno}</Texto>
          <FilaDatos>
            <Dato valor={datos.total} rotulo="Citas" />
            <Dato valor={datos.atendidas} rotulo="Atendidas" color={COLORES.exito} />
          </FilaDatos>
          {datos.citas.length === 0 && <Vacio icono="heart-outline" titulo="Sin citas" />}
          {datos.citas.map((c) => {
            const estado = infoEstado(ESTADOS_CITA, c.estado);
            return (
              <Tarjeta key={c.id_cita}>
                <Etiqueta texto={estado.texto} tono={estado.tono} />
                <Texto negrita>{c.motivo}</Texto>
                <Fila rotulo="Solicitada" valor={formatearFecha(c.fecha_solicitud)} />
                <Fila rotulo="Cita" valor={c.fecha_cita ? formatearFechaHora(c.fecha_cita) : 'Sin fecha'} />
                {c.observacion && <Aviso tono="info" icono="lock-closed">{c.observacion}</Aviso>}
              </Tarjeta>
            );
          })}
        </>
      )}
    </Pantalla>
  );
}
