import React from 'react';
import Pantalla from '../../components/Pantalla';
import ResumenConducta from '../../components/ResumenConducta';
import { useSesion } from '../../context/SesionContext';
import useConsulta from '../../viewmodels/useConsulta';
import ConductaRepository from '../../repositories/conductaRepository';

/**
 * MiConductaView (estudiante): su nota de conducta, la de cada bimestre y sus reportes.
 */
export default function MiConductaView() {
  const { usuario } = useSesion();
  const conducta = useConsulta(() => ConductaRepository.miConducta(usuario.username), [usuario.username]);

  return (
    <Pantalla consulta={conducta}>
      {(datos) => <ResumenConducta datos={datos} />}
    </Pantalla>
  );
}
