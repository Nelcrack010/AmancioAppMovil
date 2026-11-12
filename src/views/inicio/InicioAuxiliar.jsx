import React from 'react';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import { Seccion, Dato, FilaDatos } from '../../components/Basicos';
import { Aviso } from '../../components/Estados';
import { COLORES } from '../../config/tema';

/** Panel del auxiliar: secciones sin asistencia registrada hoy y reportes del día. */
export default function InicioAuxiliar({ datos, navigation }) {
  const pendientes = datos.secciones_sin_asistencia_hoy;

  return (
    <>
      <FilaDatos>
        <Dato valor={pendientes.length} rotulo="Secciones sin asistencia" color={COLORES.alerta} />
        <Dato valor={datos.reportes_de_hoy} rotulo="Reportes de hoy" />
      </FilaDatos>

      <Seccion titulo="Asistencia pendiente de hoy" />
      {pendientes.length === 0 ? (
        <Aviso tono="exito">Todas las secciones tienen la asistencia de hoy registrada.</Aviso>
      ) : pendientes.map((s) => (
        <Tarjeta
          key={s.id_seccion}
          colorBorde={COLORES.alerta}
          onPress={() => navigation.navigate('RegistrarAsistencia', { idSeccion: s.id_seccion })}
        >
          <Texto negrita>{s.seccion}</Texto>
          <Texto variante="pequeno">{s.alumnos} estudiantes · toca para registrar</Texto>
        </Tarjeta>
      ))}

      <Seccion titulo="Accesos rápidos" />
      <Tarjeta onPress={() => navigation.navigate('Conducta')}>
        <Texto negrita>Registrar un reporte de conducta</Texto>
        <Texto variante="pequeno">Elige la sección y el estudiante.</Texto>
      </Tarjeta>
      <Tarjeta onPress={() => navigation.navigate('ReporteAsistencia')}>
        <Texto negrita>Reporte de asistencia</Texto>
        <Texto variante="pequeno">Resumen por sección y rango de fechas.</Texto>
      </Tarjeta>
    </>
  );
}
