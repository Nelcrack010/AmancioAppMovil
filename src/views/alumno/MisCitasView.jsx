// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Citas de psicología   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: MisCitasView (estudiante): historial de sus citas de psicología y botón para solicitar una nueva. La
//     observación del psicólogo es reservada: no se muestra aquí.
// Pantalla «MisCitas» (src/navigation/pantallas.js): en el menú de ALUMNO («Citas psicología»)
//     (src/config/menus.js)
//   Se abre desde: InicioAlumno.jsx  con navigation.navigate('MisCitas', {...})
// Desde aquí se va a: SolicitarCita
//
// Datos (repositorio → endpoint → backend):
//   ConductaRepository.misCitas() → GET /citas/mis-citas (backend: cita_routes.py → mis_citas())
// Botones / secciones: «Sin citas», «Solicitar una cita»
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
import Boton from '../../components/Boton';
import { Fila } from '../../components/Basicos';
import { Vacio } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import ConductaRepository from '../../repositories/conductaRepository';
import { formatearFecha, formatearFechaHora } from '../../utils/fechas';
import { ESTADOS_CITA, infoEstado } from '../../config/estados';
import { COLORES } from '../../config/tema';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Campo from '../../components/Campo';
import Selector from '../../components/Selector';
import DialogoTexto from '../../components/DialogoTexto';
import Lista from '../../components/Lista';
import { ItemLista } from '../../components/Lista';
import { Seccion, FilaDatos, Dato, Separador } from '../../components/Basicos';
import { Aviso, Cargando } from '../../components/Estados';
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
 * MisCitasView (estudiante): historial de sus citas de psicología y botón para solicitar
 * una nueva. La observación del psicólogo es reservada: no se muestra aquí.
 */
export default function MisCitasView({ navigation }) {
  // PISTA: «citas» = datos que se cargan al abrir la pantalla: ConductaRepository.misCitas() → GET
  //     /citas/mis-citas (backend: cita_routes.py → mis_citas()). Úsalos con citas.datos; citas.recargar()
  //     vuelve a pedirlos.
  const citas = useConsulta(() => ConductaRepository.misCitas(), []);

  // Solo se permite una solicitud activa (pendiente o programada) a la vez.
  const tieneActiva = (citas.datos || []).some((c) => c.estado === 'PENDIENTE' || c.estado === 'PROGRAMADA');

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla
      consulta={citas}
      pie={!tieneActiva && (
        <Boton titulo="Solicitar una cita" icono="add-circle-outline" onPress={() => navigation.navigate('SolicitarCita')} />
      )}
    >
      {(lista) => (lista.length === 0 ? (
        <Vacio icono="heart-outline" titulo="Sin citas" mensaje="Si necesitas conversar con psicología, solicita una cita." />
      ) : lista.map((c) => {
        const estado = infoEstado(ESTADOS_CITA, c.estado);
        return (
          <Tarjeta key={c.id_cita} colorBorde={c.estado === 'PROGRAMADA' ? COLORES.azul : undefined}>
            <Etiqueta texto={estado.texto} tono={estado.tono} />
            <Texto negrita>{c.motivo}</Texto>
            <Fila rotulo="Solicitada" valor={formatearFecha(c.fecha_solicitud)} />
            {c.disponibilidad && <Fila rotulo="Disponibilidad" valor={c.disponibilidad} />}
            <Fila rotulo="Fecha de la cita" valor={c.fecha_cita ? formatearFechaHora(c.fecha_cita) : 'Por asignar'} />
            {c.motivo_cancelacion && <Fila rotulo="Motivo de cancelación" valor={c.motivo_cancelacion} />}
          </Tarjeta>
        );
      }))}
    </Pantalla>
  );
}
