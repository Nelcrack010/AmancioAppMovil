import React from 'react';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import { Seccion, Dato, FilaDatos } from '../../components/Basicos';
import { Aviso } from '../../components/Estados';
import { BloqueHorario, ClaseVirtual } from '../../components/Items';
import { formatearFechaHora } from '../../utils/fechas';
import { ESTADOS_CITA, colorNota, infoEstado } from '../../config/estados';
import { COLORES } from '../../config/tema';

/**
 * Panel del estudiante: resumen del año (conducta, asistencia), próximas tareas,
 * clases de hoy, últimas notas, cita de psicología y próximas clases virtuales.
 */
export default function InicioAlumno({ datos, navigation }) {
  if (!datos.matriculado) {
    return <Aviso tono="alerta">No tienes matrícula en el año escolar activo.</Aviso>;
  }

  return (
    <>
      <FilaDatos>
        <Dato valor={datos.conducta?.nota} rotulo={`Conducta (${datos.conducta?.bimestre}° bim.)`} />
        <Dato valor={datos.asistencia?.F} rotulo="Faltas" color={COLORES.error} />
        <Dato valor={datos.asistencia?.T} rotulo="Tardanzas" color={COLORES.alerta} />
      </FilaDatos>

      <Seccion titulo="Próximas tareas" />
      {datos.proximas_tareas.length === 0 ? (
        <Texto variante="pequeno">No tienes tareas pendientes. ¡Bien!</Texto>
      ) : datos.proximas_tareas.map((t) => (
        <Tarjeta
          key={t.id_tarea}
          colorBorde={COLORES.alerta}
          onPress={() => navigation.navigate('CursoDetalle', {
            idCarga: t.id_carga_academica, titulo: t.curso, pestana: 'tareas',
          })}
        >
          <Texto negrita>{t.titulo}</Texto>
          <Texto variante="pequeno">{t.curso} · entrega {formatearFechaHora(t.fecha_entrega)}</Texto>
        </Tarjeta>
      ))}

      <Seccion titulo="Clases de hoy" />
      {datos.clases_de_hoy.length === 0
        ? <Texto variante="pequeno">Hoy no tienes clases.</Texto>
        : datos.clases_de_hoy.map((b) => <BloqueHorario key={`${b.hora_inicio}-${b.curso}`} bloque={b} />)}

      {datos.cita_activa && (
        <>
          <Seccion titulo="Tu cita de psicología" />
          <Tarjeta onPress={() => navigation.navigate('MisCitas')}>
            <Etiqueta {...etiquetaCita(datos.cita_activa.estado)} />
            <Texto>{datos.cita_activa.motivo}</Texto>
            <Texto variante="pequeno">
              {datos.cita_activa.fecha_cita
                ? `Programada: ${formatearFechaHora(datos.cita_activa.fecha_cita)}`
                : 'Aún sin fecha asignada'}
            </Texto>
          </Tarjeta>
        </>
      )}

      <Seccion titulo="Últimas notas" />
      {datos.ultimas_notas.length === 0 ? (
        <Texto variante="pequeno">Aún no tienes notas registradas.</Texto>
      ) : (
        <Tarjeta onPress={() => navigation.navigate('MisNotas')}>
          {datos.ultimas_notas.map((n, i) => (
            <Texto key={i} variante="pequeno">
              <Texto negrita color={colorNota(n.valor)}>{n.valor}</Texto>  {n.curso} · {n.evaluacion} ({n.bimestre}° bim.)
            </Texto>
          ))}
        </Tarjeta>
      )}

      {datos.proximas_clases_virtuales.length > 0 && (
        <>
          <Seccion titulo="Próximas clases virtuales" />
          {datos.proximas_clases_virtuales.map((c) => <ClaseVirtual key={c.id_clase_virtual} clase={c} />)}
        </>
      )}
    </>
  );
}

const etiquetaCita = (estado) => {
  const info = infoEstado(ESTADOS_CITA, estado);
  return { texto: info.texto, tono: info.tono };
};
