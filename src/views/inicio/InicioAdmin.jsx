import React from 'react';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import { Seccion, Dato, FilaDatos } from '../../components/Basicos';
import { Aviso } from '../../components/Estados';
import { COLORES } from '../../config/tema';

/**
 * Panel del administrador: solo consulta (la gestión se hace en el campus web).
 */
export default function InicioAdmin({ datos, navigation }) {
  const t = datos.totales;
  return (
    <>
      <Seccion titulo="Resumen del colegio" />
      <FilaDatos>
        <Dato valor={t.alumnos_matriculados} rotulo="Estudiantes matriculados" />
        <Dato valor={t.docentes} rotulo="Docentes" color={COLORES.azul} />
      </FilaDatos>
      <FilaDatos>
        <Dato valor={t.citas_pendientes} rotulo="Citas pendientes" color={COLORES.alerta} />
        <Dato valor={t.reportes_del_mes} rotulo="Reportes del mes" color={COLORES.error} />
      </FilaDatos>

      <Aviso tono="info">
        La gestión administrativa (personal, matrícula, estructura académica) se realiza en el campus web.
      </Aviso>

      <Seccion titulo="Consultas" />
      <Tarjeta onPress={() => navigation.navigate('ReporteAsistencia')}>
        <Texto negrita>Reporte de asistencia</Texto>
        <Texto variante="pequeno">Por sección y rango de fechas; toca un estudiante para ver su conducta.</Texto>
      </Tarjeta>
      <Tarjeta onPress={() => navigation.navigate('CatalogoFaltas')}>
        <Texto negrita>Catálogo de faltas</Texto>
        <Texto variante="pequeno">Tipos de falta y puntos que descuentan.</Texto>
      </Tarjeta>
    </>
  );
}
