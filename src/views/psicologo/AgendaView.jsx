// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Citas de psicología   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: AgendaView (psicólogo): citas de un día (por defecto hoy) y las solicitudes que aún no tienen fecha.
//     Al tocar una se abre el detalle para programarla, atenderla o cancelarla.
// Pantalla «Agenda» (src/navigation/pantallas.js): en el menú de PSICOLOGO («Agenda») (src/config/menus.js)
//   Se abre desde: InicioPsicologo.jsx  con navigation.navigate('Agenda', {...})
// Desde aquí se va a: CitaDetalle
//
// Datos (repositorio → endpoint → backend):
//   ConductaRepository.agenda() → GET /citas/agenda (backend: cita_routes.py → agenda())
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
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Pantalla from '../../components/Pantalla';
import Lista, { ItemLista } from '../../components/Lista';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import { Seccion } from '../../components/Basicos';
import useConsulta from '../../viewmodels/useConsulta';
import ConductaRepository from '../../repositories/conductaRepository';
import { formatearFecha, hoyISO, nombreDia, soloHora, sumarDias } from '../../utils/fechas';
import { ESTADOS_CITA, infoEstado } from '../../config/estados';
import { COLORES, ESPACIO, RADIO, SOMBRA } from '../../config/tema';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useEffect, useCallback, useMemo } from 'react';
import Tarjeta from '../../components/Tarjeta';
import Boton from '../../components/Boton';
import Campo from '../../components/Campo';
import Selector from '../../components/Selector';
import DialogoTexto from '../../components/DialogoTexto';
import { Fila, FilaDatos, Dato, Separador } from '../../components/Basicos';
import { Aviso, Vacio, Cargando } from '../../components/Estados';
import useAccion from '../../viewmodels/useAccion';
import AcademicoRepository from '../../repositories/academicoRepository';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import MensajesRepository from '../../repositories/mensajesRepository';
import PerfilRepository from '../../repositories/perfilRepository';
import { useSesion } from '../../context/SesionContext';
import { confirmar, avisar, avisarResultado } from '../../utils/dialogos';
import { validarTexto, validarEnlace, primerError } from '../../utils/validaciones';
import { formatearFechaHora, esFechaValida } from '../../utils/fechas';
import { ESTADOS_TAREA, ESTADOS_REPORTE } from '../../config/estados';
// <<< FIN KIT DE IMPORTS

/**
 * AgendaView (psicólogo): citas de un día (por defecto hoy) y las solicitudes que aún
 * no tienen fecha. Al tocar una se abre el detalle para programarla, atenderla o
 * cancelarla.
 */
export default function AgendaView({ navigation }) {
  const [fecha, setFecha] = useState(hoyISO());
  // PISTA: «agenda» = datos que se cargan al abrir la pantalla: ConductaRepository.agenda() → GET /citas/agenda
  //     (backend: cita_routes.py → agenda()). Úsalos con agenda.datos; agenda.recargar() vuelve a pedirlos.
  const agenda = useConsulta(() => ConductaRepository.agenda(fecha), [fecha]);
  const abrir = (cita) => navigation.navigate('CitaDetalle', { cita, titulo: cita.alumno });

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla consulta={agenda}>
      {(datos) => (
        <>
          {/* Cambiar de día */}
          <View style={estilos.fecha}>
            <Pressable onPress={() => setFecha(sumarDias(fecha, -1))} style={estilos.flecha} accessibilityLabel="Día anterior">
              <Ionicons name="chevron-back" size={22} color={COLORES.azul} />
            </Pressable>
            <Pressable onPress={() => setFecha(hoyISO())} style={estilos.centro} accessibilityLabel="Volver a hoy">
              <Texto negrita>{nombreDia(fecha)}, {formatearFecha(fecha)}</Texto>
              <Texto variante="diminuto">{fecha === hoyISO() ? 'Hoy' : 'Toca para volver a hoy'}</Texto>
            </Pressable>
            <Pressable onPress={() => setFecha(sumarDias(fecha, 1))} style={estilos.flecha} accessibilityLabel="Día siguiente">
              <Ionicons name="chevron-forward" size={22} color={COLORES.azul} />
            </Pressable>
          </View>

          <Seccion titulo={`Citas del día (${datos.citas.length})`} />
          {datos.citas.length === 0 && <Texto variante="pequeno">No hay citas este día.</Texto>}
          <Lista>
            {datos.citas.map((c) => {
              const estado = infoEstado(ESTADOS_CITA, c.estado);
              return (
                <ItemLista
                  key={c.id_cita}
                  izquierda={<Texto variante="subtitulo" color={COLORES.azul}>{soloHora(c.fecha_cita)}</Texto>}
                  titulo={c.alumno}
                  subtitulo={c.motivo}
                  derecha={<Etiqueta texto={estado.texto} tono={estado.tono} />}
                  onPress={() => abrir(c)}
                />
              );
            })}
          </Lista>

          <Seccion titulo={`Solicitudes por programar (${datos.pendientes.length})`} />
          {datos.pendientes.length === 0 && <Texto variante="pequeno">No hay solicitudes pendientes.</Texto>}
          <Lista>
            {datos.pendientes.map((c) => (
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
          </Lista>
        </>
      )}
    </Pantalla>
  );
}

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  fecha: {
    flexDirection: 'row', alignItems: 'center', marginBottom: ESPACIO.sm,
    backgroundColor: COLORES.superficie, borderRadius: RADIO.lg, ...SOMBRA,
  },
  flecha: { padding: ESPACIO.md },
  centro: { flex: 1, alignItems: 'center' },
});
