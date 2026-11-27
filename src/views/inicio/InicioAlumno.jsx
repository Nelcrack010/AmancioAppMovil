// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: general   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: Panel del estudiante: resumen del año (conducta, asistencia), próximas tareas, clases de hoy, cita de
//     psicología, últimas notas y próximas clases virtuales.
// Se muestra dentro de: InicioView.jsx
// Desde aquí se va a: CursoDetalle, MisCitas, MisNotas
// Botones / secciones: «Clases de hoy», «Próximas clases virtuales», «Próximas tareas», «Tu cita de psicología»,
//     «Últimas notas»
//
// Para modificar:
//   • Texto, etiqueta o botón → búscalo aquí abajo (Ctrl+F) y cámbialo.
//   • Mostrar un campo nuevo → primero que venga en el JSON (SELECT del repository del backend), luego aquí:
//     {x.campo && <Texto variante="pequeno">Campo: {x.campo}</Texto>}
//   • Campo de formulario → const [valor, setValor] = useState(''); <Campo etiqueta="..." valor={valor}
//       alCambiar={setValor} />
//     y agrégalo al objeto que se envía en accion.ejecutar(...).
//   • Regla local → validarTexto/validarEnlace dentro de primerError(...) (src/utils/validaciones.js). Pon la
//       misma regla en el service.
//   • Botón → <Boton titulo="..." variante="primario|guinda|secundario|peligro|texto" pequeno onPress={() =>
//       ...} />
//   • Ir a otra pantalla → navigation.navigate('Nombre', { id }). Pantalla nueva: src/navigation/pantallas.js.
// <<< FIN GUÍA
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
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Boton from '../../components/Boton';
import Campo from '../../components/Campo';
import Selector from '../../components/Selector';
import DialogoTexto from '../../components/DialogoTexto';
import { Fila, Separador } from '../../components/Basicos';
import { Vacio, Cargando } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import useAccion from '../../viewmodels/useAccion';
import AcademicoRepository from '../../repositories/academicoRepository';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import ConductaRepository from '../../repositories/conductaRepository';
import MensajesRepository from '../../repositories/mensajesRepository';
import PerfilRepository from '../../repositories/perfilRepository';
import { useSesion } from '../../context/SesionContext';
import { confirmar, avisar, avisarResultado } from '../../utils/dialogos';
import { validarTexto, validarEnlace, primerError } from '../../utils/validaciones';
import { formatearFecha, hoyISO, esFechaValida, sumarDias } from '../../utils/fechas';
import { ESTADOS_TAREA, ESTADOS_REPORTE } from '../../config/estados';
import { ESPACIO, RADIO, SOMBRA } from '../../config/tema';
// <<< FIN KIT DE IMPORTS

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

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <>
      <FilaDatos>
        <Dato
          valor={datos.conducta?.nota}
          rotulo={datos.conducta?.bimestre ? `Conducta · ${datos.conducta.bimestre}° bim.` : 'Conducta'}
        />
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
