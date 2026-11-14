import React from 'react';
import Lista, { ItemLista } from '../../components/Lista';
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
        <Dato valor={t.alumnos_matriculados} rotulo="Estudiantes" />
        <Dato valor={t.docentes} rotulo="Docentes" color={COLORES.azul} />
      </FilaDatos>
      <FilaDatos>
        <Dato valor={t.citas_pendientes} rotulo="Citas pendientes" color={COLORES.alerta} />
        <Dato valor={t.reportes_del_mes} rotulo="Reportes del mes" color={COLORES.error} />
      </FilaDatos>

      <Seccion titulo="Consultas" />
      <Lista>
        <ItemLista
          icono="stats-chart"
          titulo="Reporte de asistencia"
          subtitulo="Por sección y fechas; toca un estudiante para ver su conducta"
          onPress={() => navigation.navigate('ReporteAsistencia')}
        />
        <ItemLista
          icono="list"
          titulo="Catálogo de faltas"
          subtitulo="Tipos de falta y puntos que descuentan"
          onPress={() => navigation.navigate('CatalogoFaltas')}
        />
      </Lista>

      <Aviso tono="info">
        La gestión administrativa (personal, matrícula, estructura académica) se realiza en el campus web.
      </Aviso>
    </>
  );
}
