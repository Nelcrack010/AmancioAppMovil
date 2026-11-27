// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Citas de psicología   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: HistorialAlumnoView (psicólogo): todas las citas de un estudiante con las observaciones de cada
//     atención (información reservada para psicología).
// Pantalla «HistorialAlumno» (src/navigation/pantallas.js): pantalla de detalle, título «Historial del
//     estudiante»
//   Se abre desde: ConductaAlumnoView.jsx, CitaDetalleView.jsx  con navigation.navigate('HistorialAlumno',
//       {...})
//
// Datos (repositorio → endpoint → backend):
//   ConductaRepository.historialCitas() → GET /citas/alumno/<int:id_alumno> (backend: cita_routes.py →
//       historial_de_alumno())
// Botones / secciones: «Sin citas»
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
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import { Dato, Fila, FilaDatos } from '../../components/Basicos';
import { Aviso, Vacio } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import ConductaRepository from '../../repositories/conductaRepository';
import { formatearFecha, formatearFechaHora } from '../../utils/fechas';
import { ESTADOS_CITA, infoEstado } from '../../config/estados';
import { COLORES } from '../../config/tema';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Boton from '../../components/Boton';
import Campo from '../../components/Campo';
import Selector from '../../components/Selector';
import DialogoTexto from '../../components/DialogoTexto';
import Lista from '../../components/Lista';
import { ItemLista } from '../../components/Lista';
import { Seccion, Separador } from '../../components/Basicos';
import { Cargando } from '../../components/Estados';
import useAccion from '../../viewmodels/useAccion';
import AcademicoRepository from '../../repositories/academicoRepository';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import MensajesRepository from '../../repositories/mensajesRepository';
import PerfilRepository from '../../repositories/perfilRepository';
import { useSesion } from '../../context/SesionContext';
import { confirmar, avisar, avisarResultado } from '../../utils/dialogos';
import { validarTexto, validarEnlace, primerError } from '../../utils/validaciones';
import { hoyISO, esFechaValida, sumarDias } from '../../utils/fechas';
import { ESTADOS_TAREA, ESTADOS_REPORTE } from '../../config/estados';
import { ESPACIO, RADIO, SOMBRA } from '../../config/tema';
// <<< FIN KIT DE IMPORTS

/**
 * HistorialAlumnoView (psicólogo): todas las citas de un estudiante con las
 * observaciones de cada atención (información reservada para psicología).
 * params: { idAlumno }
 */
export default function HistorialAlumnoView({ route }) {
  const { idAlumno } = route.params;
  // PISTA: «historial» = datos que se cargan al abrir la pantalla: ConductaRepository.historialCitas() → GET
  //     /citas/alumno/<int:id_alumno> (backend: cita_routes.py → historial_de_alumno()). Úsalos con
  //     historial.datos; historial.recargar() vuelve a pedirlos.
  const historial = useConsulta(() => ConductaRepository.historialCitas(idAlumno), [idAlumno]);

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla consulta={historial}>
      {(datos) => (
        <>
          <Texto variante="subtitulo">{datos.alumno}</Texto>
          <FilaDatos>
            <Dato valor={datos.total} rotulo="Citas" />
            <Dato valor={datos.atendidas} rotulo="Atendidas" color={COLORES.exito} />
          </FilaDatos>
          {datos.citas.length === 0 && <Vacio icono="heart-outline" titulo="Sin citas" />}
          {datos.citas.map((c) => {
            const estado = infoEstado(ESTADOS_CITA, c.estado);
            return (
              <Tarjeta key={c.id_cita}>
                <Etiqueta texto={estado.texto} tono={estado.tono} />
                <Texto negrita>{c.motivo}</Texto>
                <Fila rotulo="Solicitada" valor={formatearFecha(c.fecha_solicitud)} />
                <Fila rotulo="Cita" valor={c.fecha_cita ? formatearFechaHora(c.fecha_cita) : 'Sin fecha'} />
                {c.observacion && <Aviso tono="info" icono="lock-closed">{c.observacion}</Aviso>}
              </Tarjeta>
            );
          })}
        </>
      )}
    </Pantalla>
  );
}
