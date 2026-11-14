import React from 'react';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import Lista, { ItemLista } from '../../components/Lista';
import { Seccion, Dato, FilaDatos } from '../../components/Basicos';
import { Aviso } from '../../components/Estados';
import { BloqueHorario, FilaClaseVirtual } from '../../components/Items';
import { formatearFechaHora } from '../../utils/fechas';
import { ESTADOS_CITA, colorNota, infoEstado } from '../../config/estados';
import { COLORES } from '../../config/tema';

/**
 * Panel del estudiante: resumen del año (conducta, asistencia), próximas tareas,
 * clases de hoy, cita de psicología, últimas notas y próximas clases virtuales.
 */
export default function InicioAlumno({ datos, navigation }) {
  if (!datos.matriculado) {
    return <Aviso tono="alerta">No tienes matrícula en el año escolar activo.</Aviso>;
  }

  const cita = datos.cita_activa;
  const estadoCita = cita && infoEstado(ESTADOS_CITA, cita.estado);

  return (
    <>
      <FilaDatos>
        <Dato valor={datos.conducta?.nota} rotulo={`Conducta · ${datos.conducta?.bimestre}° bim.`} />
        <Dato valor={datos.asistencia?.F} rotulo="Faltas" color={COLORES.error} />
        <Dato valor={datos.asistencia?.T} rotulo="Tardanzas" color={COLORES.alerta} />
      </FilaDatos>

      <Seccion titulo="Próximas tareas" />
      {datos.proximas_tareas.length === 0 ? (
        <Texto variante="pequeno">No tienes tareas pendientes. ¡Bien!</Texto>
      ) : (
        <Lista>
          {datos.proximas_tareas.map((t) => (
            <ItemLista
              key={t.id_tarea}
              icono="document-text"
              titulo={t.titulo}
              subtitulo={`${t.curso} · entrega ${formatearFechaHora(t.fecha_entrega)}`}
              onPress={() => navigation.navigate('CursoDetalle', {
                idCarga: t.id_carga_academica, titulo: t.curso, pestana: 'tareas',
              })}
            />
          ))}
        </Lista>
      )}

      <Seccion titulo="Clases de hoy" />
      {datos.clases_de_hoy.length === 0 ? (
        <Texto variante="pequeno">Hoy no tienes clases.</Texto>
      ) : (
        <Lista>
          {datos.clases_de_hoy.map((b) => <BloqueHorario key={`${b.hora_inicio}-${b.curso}`} bloque={b} />)}
        </Lista>
      )}

      {cita && (
        <>
          <Seccion titulo="Tu cita de psicología" />
          <Lista>
            <ItemLista
              icono="heart"
              titulo={cita.motivo}
              subtitulo={cita.fecha_cita ? formatearFechaHora(cita.fecha_cita) : 'Aún sin fecha asignada'}
              derecha={<Etiqueta texto={estadoCita.texto} tono={estadoCita.tono} />}
              onPress={() => navigation.navigate('MisCitas')}
            />
          </Lista>
        </>
      )}

      {datos.ultimas_notas.length > 0 && (
        <>
          <Seccion titulo="Últimas notas" />
          <Lista>
            {datos.ultimas_notas.map((n, i) => (
              <ItemLista
                key={i}
                titulo={n.curso}
                subtitulo={`${n.evaluacion} · ${n.bimestre}° bimestre`}
                derecha={<Texto variante="subtitulo" color={colorNota(n.valor)}>{n.valor}</Texto>}
                onPress={() => navigation.navigate('MisNotas')}
              />
            ))}
          </Lista>
        </>
      )}

      {datos.proximas_clases_virtuales.length > 0 && (
        <>
          <Seccion titulo="Próximas clases virtuales" />
          <Lista>
            {datos.proximas_clases_virtuales.map((c) => <FilaClaseVirtual key={c.id_clase_virtual} clase={c} />)}
          </Lista>
        </>
      )}
    </>
  );
}
