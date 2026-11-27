// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: general   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: Panel del psicólogo: citas de hoy y solicitudes pendientes de programar.
// Se muestra dentro de: InicioView.jsx
// Desde aquí se va a: Agenda, CitaDetalle
// Botones / secciones: «Citas de hoy», «Solicitudes por programar», «Ver todas en la agenda»
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
import Lista, { ItemLista } from '../../components/Lista';
import { Seccion, Dato, FilaDatos } from '../../components/Basicos';
import { formatearFecha, soloHora } from '../../utils/fechas';
import { COLORES } from '../../config/tema';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Boton from '../../components/Boton';
import Campo from '../../components/Campo';
import Etiqueta from '../../components/Etiqueta';
import Selector from '../../components/Selector';
import DialogoTexto from '../../components/DialogoTexto';
import { Fila, Separador } from '../../components/Basicos';
import { Aviso, Vacio, Cargando } from '../../components/Estados';
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
import { formatearFechaHora, hoyISO, esFechaValida, sumarDias } from '../../utils/fechas';
import { infoEstado, ESTADOS_CITA, ESTADOS_TAREA, ESTADOS_REPORTE } from '../../config/estados';
import { ESPACIO, RADIO, SOMBRA } from '../../config/tema';
// <<< FIN KIT DE IMPORTS

/** Panel del psicólogo: citas de hoy y solicitudes pendientes de programar. */
export default function InicioPsicologo({ datos, navigation }) {
  const abrir = (cita) => navigation.navigate('CitaDetalle', { cita, titulo: cita.alumno });

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <>
      <FilaDatos>
        <Dato valor={datos.citas_de_hoy.length} rotulo="Citas de hoy" />
        <Dato valor={datos.solicitudes_pendientes} rotulo="Solicitudes pendientes" color={COLORES.alerta} />
      </FilaDatos>

      <Seccion titulo="Citas de hoy" />
      {datos.citas_de_hoy.length === 0 ? (
        <Texto variante="pequeno">No tienes citas programadas para hoy.</Texto>
      ) : (
        <Lista>
          {datos.citas_de_hoy.map((c) => (
            <ItemLista
              key={c.id_cita}
              izquierda={<Texto variante="subtitulo" color={COLORES.azul}>{soloHora(c.fecha_cita)}</Texto>}
              titulo={c.alumno}
              subtitulo={c.motivo}
              onPress={() => abrir(c)}
            />
          ))}
        </Lista>
      )}

      <Seccion titulo="Solicitudes por programar" />
      {datos.solicitudes.length === 0 ? (
        <Texto variante="pequeno">No hay solicitudes pendientes.</Texto>
      ) : (
        <Lista>
          {datos.solicitudes.map((c) => (
            <ItemLista
              key={c.id_cita}
              icono="time"
              colorIcono={COLORES.alerta}
              fondoIcono={COLORES.alertaFondo}
              titulo={c.alumno}
              subtitulo={c.motivo}
              detalle={`Solicitada el ${formatearFecha(c.fecha_solicitud)}${c.disponibilidad ? ` · ${c.disponibilidad}` : ''}`}
              onPress={() => abrir(c)}
            />
          ))}
          {datos.solicitudes_pendientes > datos.solicitudes.length && (
            <ItemLista icono="calendar" titulo="Ver todas en la agenda" onPress={() => navigation.navigate('Agenda')} />
          )}
        </Lista>
      )}
    </>
  );
}
