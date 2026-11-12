import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import { useSesion } from '../../context/SesionContext';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import { formatearFecha, nombreDia } from '../../utils/fechas';
import { NOMBRES_ROL } from '../../config/estados';
import { COLORES } from '../../config/tema';
import InicioAlumno from './InicioAlumno';
import InicioDocente from './InicioDocente';
import InicioAuxiliar from './InicioAuxiliar';
import InicioPsicologo from './InicioPsicologo';
import InicioAdmin from './InicioAdmin';

/** Panel de cada rol. Para cambiar lo que ve un rol, se edita su archivo Inicio<Rol>.jsx */
const PANELES = {
  ALUMNO: InicioAlumno,
  DOCENTE: InicioDocente,
  AUXILIAR: InicioAuxiliar,
  PSICOLOGO: InicioPsicologo,
  ADMIN: InicioAdmin,
};

/**
 * InicioView: panel de inicio. Usa GET /inicio, que devuelve un resumen distinto
 * según el rol, y muestra el panel que corresponde.
 */
export default function InicioView({ navigation }) {
  const { usuario, fijarContadores } = useSesion();
  const inicio = useConsulta(() => AcademicoRepository.inicio(), []);

  // /inicio también trae los no leídos: se aprovechan para los globos del menú.
  useEffect(() => {
    if (inicio.datos) fijarContadores(inicio.datos);
  }, [inicio.datos, fijarContadores]);

  const Panel = PANELES[usuario.rol];

  return (
    <Pantalla consulta={inicio}>
      {(datos) => (
        <>
          {/* Saludo (como el encabezado del campus web) */}
          <Tarjeta destacada>
            <Texto variante="etiqueta" color={COLORES.crema}>{NOMBRES_ROL[datos.rol]}</Texto>
            <Texto variante="titulo" color={COLORES.blanco}>¡Hola, {primerNombre(datos.nombre)}!</Texto>
            <Texto color={COLORES.crema} style={estilos.fecha}>
              {nombreDia(datos.fecha)}, {formatearFecha(datos.fecha)}
            </Texto>
          </Tarjeta>

          {Panel && <Panel datos={datos} navigation={navigation} />}
        </>
      )}
    </Pantalla>
  );
}

const primerNombre = (nombre = '') => nombre.split(' ')[0];

const estilos = StyleSheet.create({
  fecha: { marginTop: 2 },
});
