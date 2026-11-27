// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Aula virtual · Tareas   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: EntregasView (docente): cada estudiante con su entrega (o sin ella) de una tarea. - "Por calificar":
//     al tocarla se abre la pantalla para poner la nota. - "Calificada": al tocarla se abre el trabajo enviado.
// Pantalla «Entregas» (src/navigation/pantallas.js): pantalla de detalle, título «Entregas»
//   Se abre desde: PestanaTareas.jsx, InicioDocente.jsx  con navigation.navigate('Entregas', {...})
// Desde aquí se va a: CalificarEntrega
//
// Datos (repositorio → endpoint → backend):
//   AcademicoRepository.entregas() → GET /tareas/item/<int:id_tarea>/entregas (backend: tarea_routes.py →
//       entregas())
// Botones / secciones: «Nadie en este grupo»
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
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import Selector from '../../components/Selector';
import Lista, { ItemLista } from '../../components/Lista';
import { Avatar, Dato, FilaDatos } from '../../components/Basicos';
import { Vacio } from '../../components/Estados';
import { abrirEnlace } from '../../components/Items';
import { urlDeArchivo } from '../../services/archivos';
import { BotonArchivo } from '../../components/Archivos';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import { formatearFechaHora } from '../../utils/fechas';
import { ESTADOS_TAREA, colorNota, infoEstado } from '../../config/estados';
import { COLORES, ESPACIO } from '../../config/tema';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useEffect, useCallback, useMemo } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Tarjeta from '../../components/Tarjeta';
import Boton from '../../components/Boton';
import Campo from '../../components/Campo';
import DialogoTexto from '../../components/DialogoTexto';
import { Seccion, Fila, Separador } from '../../components/Basicos';
import { Aviso, Cargando } from '../../components/Estados';
import useAccion from '../../viewmodels/useAccion';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import ConductaRepository from '../../repositories/conductaRepository';
import MensajesRepository from '../../repositories/mensajesRepository';
import PerfilRepository from '../../repositories/perfilRepository';
import { useSesion } from '../../context/SesionContext';
import { confirmar, avisar, avisarResultado } from '../../utils/dialogos';
import { validarTexto, validarEnlace, primerError } from '../../utils/validaciones';
import { formatearFecha, hoyISO, esFechaValida, sumarDias } from '../../utils/fechas';
import { ESTADOS_CITA, ESTADOS_REPORTE } from '../../config/estados';
import { RADIO, SOMBRA } from '../../config/tema';
// <<< FIN KIT DE IMPORTS

/**
 * EntregasView (docente): cada estudiante con su entrega (o sin ella) de una tarea.
 *   - "Por calificar": al tocarla se abre la pantalla para poner la nota.
 *   - "Calificada": al tocarla se abre el trabajo enviado.
 * params: { idTarea }
 */
export default function EntregasView({ navigation, route }) {
  const idTarea = route.params?.idTarea || route.params?.id;
  // PISTA: datos que se cargan al abrir la pantalla (useConsulta): .datos, .cargando, .error, .recargar().
  const entregas = useConsulta(() => (idTarea ? AcademicoRepository.entregas(idTarea) : null), [idTarea]);
  const [filtro, setFiltro] = useState('TODAS');

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla consulta={entregas}>
      {(datos) => {
        const lista = filtro === 'TODAS' ? datos.alumnos : datos.alumnos.filter((a) => a.estado === filtro);
        return (
          <>
            <Texto variante="pequeno" style={estilos.plazo}>
              Entrega hasta el {formatearFechaHora(datos.tarea.fecha_entrega)}
            </Texto>
            {datos.tarea.adjunto && (
              <View style={estilos.plazo}><BotonArchivo archivo={datos.tarea.adjunto} texto="Enunciado" /></View>
            )}

            <FilaDatos>
              <Dato valor={datos.resumen.ENTREGADA} rotulo="Por calificar" color={COLORES.azul} />
              <Dato valor={datos.resumen.CALIFICADA} rotulo="Calificadas" color={COLORES.exito} />
              <Dato valor={datos.resumen.PENDIENTE + datos.resumen.VENCIDA} rotulo="Sin entregar" color={COLORES.error} />
            </FilaDatos>

            <Selector
              valor={filtro}
              alCambiar={setFiltro}
              opciones={[
                { valor: 'TODAS', texto: 'Todas' },
                { valor: 'ENTREGADA', texto: 'Por calificar' },
                { valor: 'CALIFICADA', texto: 'Calificadas' },
                { valor: 'PENDIENTE', texto: 'Pendientes' },
                { valor: 'VENCIDA', texto: 'Vencidas' },
              ]}
            />

            {lista.length === 0 ? <Vacio titulo="Nadie en este grupo" /> : (
              <Lista>
                {lista.map((a) => {
                  const estado = infoEstado(ESTADOS_TAREA, a.estado);
                  const porCalificar = a.estado === 'ENTREGADA';
                  // Calificada: se abre lo que entregó (primero el archivo; si no, el enlace).
                  const trabajo = urlDeArchivo(a.archivo) || a.archivo_url;
                  let alTocar;
                  if (porCalificar) alTocar = () => navigation.navigate('CalificarEntrega', { alumno: a, tarea: datos.tarea });
                  else if (trabajo) alTocar = () => abrirEnlace(trabajo);

                  return (
                    <ItemLista
                      key={a.id_alumno}
                      izquierda={<Avatar nombre={`${a.nombres} ${a.apellidos}`} tamano={36} />}
                      titulo={`${a.apellidos}, ${a.nombres}`}
                      subtitulo={a.fecha_envio
                        ? `Enviada: ${formatearFechaHora(a.fecha_envio)}${a.fuera_de_plazo ? ' · fuera de plazo' : ''}`
                        : 'Sin entregar'}
                      detalle={[a.archivo?.nombre, porCalificar ? 'Toca para calificar' : null].filter(Boolean).join(' · ') || undefined}
                      acento={porCalificar ? COLORES.azul : undefined}
                      derecha={(
                        <View style={estilos.derecha}>
                          <Etiqueta texto={estado.texto} tono={estado.tono} />
                          {a.calificacion !== null && (
                            <Texto negrita color={colorNota(a.calificacion)}>{a.calificacion}</Texto>
                          )}
                        </View>
                      )}
                      onPress={alTocar}
                    />
                  );
                })}
              </Lista>
            )}
          </>
        );
      }}
    </Pantalla>
  );
}

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  plazo: { marginBottom: ESPACIO.md, paddingHorizontal: ESPACIO.xs },
  derecha: { alignItems: 'flex-end', gap: ESPACIO.xs },
});
