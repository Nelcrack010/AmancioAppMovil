import React from 'react';
import Lista, { ItemLista } from '../../components/Lista';
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
      ) : (
        <Lista>
          {pendientes.map((s) => (
            <ItemLista
              key={s.id_seccion}
              icono="checkmark-done"
              colorIcono={COLORES.alerta}
              fondoIcono={COLORES.alertaFondo}
              titulo={s.seccion}
              subtitulo={`${s.alumnos} estudiante(s) · toca para registrar`}
              onPress={() => navigation.navigate('RegistrarAsistencia', { idSeccion: s.id_seccion })}
            />
          ))}
        </Lista>
      )}

      <Seccion titulo="Accesos rápidos" />
      <Lista>
        <ItemLista
          icono="shield-checkmark"
          titulo="Registrar un reporte de conducta"
          subtitulo="Elige la sección y el estudiante"
          onPress={() => navigation.navigate('Conducta')}
        />
        <ItemLista
          icono="stats-chart"
          titulo="Reporte de asistencia"
          subtitulo="Resumen por sección y rango de fechas"
          onPress={() => navigation.navigate('ReporteAsistencia')}
        />
      </Lista>
    </>
  );
}
