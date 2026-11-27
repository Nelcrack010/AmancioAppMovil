// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Conducta, Perfil   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: MiConductaView (estudiante): su nota de conducta, la de cada bimestre y sus reportes.
// Pantalla «MiConducta» (src/navigation/pantallas.js): en el menú de ALUMNO («Conducta») (src/config/menus.js)
//
// Datos (repositorio → endpoint → backend):
//   ConductaRepository.miConducta() → GET /perfil/mi-perfil/<username> (backend: perfil_routes.py →
//       mi_perfil()); GET /conducta/alumno/<int:id_alumno> (backend: conducta_routes.py → estado_conducta())
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
import ResumenConducta from '../../components/ResumenConducta';
import { useSesion } from '../../context/SesionContext';
import useConsulta from '../../viewmodels/useConsulta';
import ConductaRepository from '../../repositories/conductaRepository';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Boton from '../../components/Boton';
import Campo from '../../components/Campo';
import Etiqueta from '../../components/Etiqueta';
import Selector from '../../components/Selector';
import DialogoTexto from '../../components/DialogoTexto';
import Lista from '../../components/Lista';
import { ItemLista } from '../../components/Lista';
import { Seccion, Fila, FilaDatos, Dato, Separador } from '../../components/Basicos';
import { Aviso, Vacio, Cargando } from '../../components/Estados';
import useAccion from '../../viewmodels/useAccion';
import AcademicoRepository from '../../repositories/academicoRepository';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import MensajesRepository from '../../repositories/mensajesRepository';
import PerfilRepository from '../../repositories/perfilRepository';
import { confirmar, avisar, avisarResultado } from '../../utils/dialogos';
import { validarTexto, validarEnlace, primerError } from '../../utils/validaciones';
import { formatearFecha, formatearFechaHora, hoyISO, esFechaValida, sumarDias } from '../../utils/fechas';
import { infoEstado, ESTADOS_CITA, ESTADOS_TAREA, ESTADOS_REPORTE } from '../../config/estados';
import { COLORES, ESPACIO, RADIO, SOMBRA } from '../../config/tema';
// <<< FIN KIT DE IMPORTS

/**
 * MiConductaView (estudiante): su nota de conducta, la de cada bimestre y sus reportes.
 */
export default function MiConductaView() {
  const { usuario } = useSesion();
  // PISTA: «conducta» = datos que se cargan al abrir la pantalla: ConductaRepository.miConducta() → GET
  //     /perfil/mi-perfil/<username> (backend: perfil_routes.py → mi_perfil()); GET
  //     /conducta/alumno/<int:id_alumno> (backend: conducta_routes.py → estado_conducta()). Úsalos con
  //     conducta.datos; conducta.recargar() vuelve a pedirlos.
  const conducta = useConsulta(() => ConductaRepository.miConducta(usuario.username), [usuario.username]);

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla consulta={conducta}>
      {(datos) => <ResumenConducta datos={datos} />}
    </Pantalla>
  );
}
