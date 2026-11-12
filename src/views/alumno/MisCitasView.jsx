import React from 'react';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import Boton from '../../components/Boton';
import { Fila } from '../../components/Basicos';
import { Vacio } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import ConductaRepository from '../../repositories/conductaRepository';
import { formatearFecha, formatearFechaHora } from '../../utils/fechas';
import { ESTADOS_CITA, infoEstado } from '../../config/estados';
import { COLORES } from '../../config/tema';

/**
 * MisCitasView (estudiante): historial de sus citas de psicología y botón para solicitar
 * una nueva. La observación del psicólogo es reservada: no se muestra aquí.
 */
export default function MisCitasView({ navigation }) {
  const citas = useConsulta(() => ConductaRepository.misCitas(), []);

  // Solo se permite una solicitud activa (pendiente o programada) a la vez.
  const tieneActiva = (citas.datos || []).some((c) => c.estado === 'PENDIENTE' || c.estado === 'PROGRAMADA');

  return (
    <Pantalla
      consulta={citas}
      pie={!tieneActiva && (
        <Boton titulo="Solicitar una cita" icono="add-circle-outline" onPress={() => navigation.navigate('SolicitarCita')} />
      )}
    >
      {(lista) => (lista.length === 0 ? (
        <Vacio icono="heart-outline" titulo="Sin citas" mensaje="Si necesitas conversar con psicología, solicita una cita." />
      ) : lista.map((c) => {
        const estado = infoEstado(ESTADOS_CITA, c.estado);
        return (
          <Tarjeta key={c.id_cita} colorBorde={c.estado === 'PROGRAMADA' ? COLORES.azul : undefined}>
            <Etiqueta texto={estado.texto} tono={estado.tono} />
            <Texto negrita>{c.motivo}</Texto>
            <Fila rotulo="Solicitada" valor={formatearFecha(c.fecha_solicitud)} />
            {c.disponibilidad && <Fila rotulo="Disponibilidad" valor={c.disponibilidad} />}
            <Fila rotulo="Fecha de la cita" valor={c.fecha_cita ? formatearFechaHora(c.fecha_cita) : 'Por asignar'} />
            {c.motivo_cancelacion && <Fila rotulo="Motivo de cancelación" valor={c.motivo_cancelacion} />}
          </Tarjeta>
        );
      }))}
    </Pantalla>
  );
}
