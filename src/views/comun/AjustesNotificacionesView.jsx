import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import Selector from '../../components/Selector';
import { Seccion } from '../../components/Basicos';
import { Aviso } from '../../components/Estados';
import AvisoPermisoNotificaciones from '../../components/AvisoPermisoNotificaciones';
import useConsulta from '../../viewmodels/useConsulta';
import useAccion from '../../viewmodels/useAccion';
import MensajesRepository from '../../repositories/mensajesRepository';
import { iconoDeNotificacion } from '../../navigation/abrirNotificacion';
import { avisar } from '../../utils/dialogos';
import { esHoraValida, formatearFechaHora } from '../../utils/fechas';
import { HORARIO_NO_MOLESTAR_SUGERIDO } from '../../config/notificaciones';
import { COLORES, ESPACIO } from '../../config/tema';

/**
 * AjustesNotificacionesView: silenciar o limitar las notificaciones PUSH (las que llegan
 * al celular). Los avisos siempre quedan guardados en "Avisos"; esto solo decide cuáles
 * suenan en el celular.
 *
 *   1. Silenciar todas           (interruptor)
 *   2. Pausar por un tiempo      (1 h, 8 h, 24 h; las opciones las manda el servidor)
 *   3. Horario "no molestar"     (todos los días, por ejemplo de 22:00 a 07:00)
 *   4. Qué avisos recibir        (un interruptor por tipo; la lista depende del rol)
 *
 * Los tipos de aviso, con su nombre y descripción, vienen del servidor
 * (TIPOS en app/services/notificacion_service.py). El ícono sale de src/config/notificaciones.js.
 */
export default function AjustesNotificacionesView() {
  const consulta = useConsulta(() => MensajesRepository.preferencias(), []);
  return (
    <Pantalla consulta={consulta}>
      {(datos) => <Formulario datos={datos} alGuardar={consulta.recargar} />}
    </Pantalla>
  );
}

function Formulario({ datos, alGuardar }) {
  const accion = useAccion();
  const [silenciarTodo, setSilenciarTodo] = useState(datos.silenciar_todo);
  const [activos, setActivos] = useState(() => Object.fromEntries(datos.tipos.map((t) => [t.tipo, t.activo])));
  const [usaNoMolestar, setUsaNoMolestar] = useState(Boolean(datos.no_molestar));
  const [desde, setDesde] = useState(datos.no_molestar?.desde || HORARIO_NO_MOLESTAR_SUGERIDO.desde);
  const [hasta, setHasta] = useState(datos.no_molestar?.hasta || HORARIO_NO_MOLESTAR_SUGERIDO.hasta);
  const [errorLocal, setErrorLocal] = useState(null);

  // Si el servidor devuelve datos nuevos (después de guardar), se actualiza el formulario.
  useEffect(() => {
    setSilenciarTodo(datos.silenciar_todo);
    setActivos(Object.fromEntries(datos.tipos.map((t) => [t.tipo, t.activo])));
  }, [datos]);

  /** Guarda en el servidor. `extra` sirve para la pausa (pausar_horas). */
  const guardar = async (extra = {}) => {
    if (usaNoMolestar && (!esHoraValida(desde) || !esHoraValida(hasta))) {
      setErrorLocal('Las horas deben tener el formato HH:MM (24 horas), por ejemplo 22:00.');
      return;
    }
    if (usaNoMolestar && desde === hasta) {
      setErrorLocal('La hora de inicio y la de fin no pueden ser iguales.');
      return;
    }
    setErrorLocal(null);
    const r = await accion.ejecutar(() => MensajesRepository.guardarPreferencias({
      silenciar_todo: silenciarTodo,
      tipos_silenciados: Object.keys(activos).filter((tipo) => !activos[tipo]),
      no_molestar_desde: usaNoMolestar ? desde : null,
      no_molestar_hasta: usaNoMolestar ? hasta : null,
      ...extra,
    }));
    if (r.ok) {
      alGuardar();
      if (!extra.pausar_horas && extra.pausar_horas !== 0) avisar('Listo', 'Tus preferencias se guardaron.');
    }
  };

  const pausado = Boolean(datos.pausado_hasta);
  const opcionesPausa = datos.opciones_pausa_horas.map((h) => ({ valor: h, texto: h === 1 ? '1 hora' : `${h} horas` }));

  return (
    <>
      <AvisoPermisoNotificaciones />
      <Aviso tono="info" icono="information-circle">
        Esto solo cambia lo que llega al celular. Todos los avisos siguen apareciendo en «Avisos».
      </Aviso>
      {(errorLocal || accion.error) && <Aviso tono="error">{errorLocal || accion.error}</Aviso>}

      {/* 1. Silenciar todas */}
      <Tarjeta>
        <Interruptor
          titulo="Silenciar todas las notificaciones"
          descripcion="No llegará ninguna notificación al celular."
          valor={silenciarTodo}
          alCambiar={setSilenciarTodo}
        />
      </Tarjeta>

      {/* 2. Pausar por un tiempo */}
      <Seccion titulo="Pausar por un tiempo" />
      <Tarjeta>
        {pausado ? (
          <>
            <Texto>Pausadas hasta el {formatearFechaHora(datos.pausado_hasta)}.</Texto>
            <Boton titulo="Quitar la pausa" variante="secundario" icono="play-outline"
              onPress={() => guardar({ pausar_horas: 0 })} cargando={accion.enviando} />
          </>
        ) : (
          <>
            <Texto variante="pequeno">Silenciarlas un rato (por ejemplo, durante un examen):</Texto>
            <Selector opciones={opcionesPausa} valor={null} alCambiar={(h) => guardar({ pausar_horas: h })} />
          </>
        )}
      </Tarjeta>

      {/* 3. Horario no molestar */}
      <Seccion titulo="Horario «no molestar»" />
      <Tarjeta>
        <Interruptor
          titulo="Todos los días"
          descripcion="Sin notificaciones entre estas horas."
          valor={usaNoMolestar}
          alCambiar={setUsaNoMolestar}
        />
        {usaNoMolestar && (
          <View style={estilos.horas}>
            <Campo style={estilos.flex} etiqueta="Desde" valor={desde} alCambiar={setDesde} placeholder="22:00" maxLength={5} />
            <Campo style={estilos.flex} etiqueta="Hasta" valor={hasta} alCambiar={setHasta} placeholder="07:00" maxLength={5} />
          </View>
        )}
      </Tarjeta>

      {/* 4. Qué avisos recibir */}
      <Seccion titulo="Qué notificaciones recibir" />
      <Tarjeta>
        {datos.tipos.map((t, i) => (
          <View key={t.tipo} style={i > 0 && estilos.conLinea}>
            <Interruptor
              icono={iconoDeNotificacion(t.tipo)}
              titulo={t.nombre}
              descripcion={t.descripcion}
              valor={activos[t.tipo] && !silenciarTodo}
              deshabilitado={silenciarTodo}
              alCambiar={(v) => setActivos((a) => ({ ...a, [t.tipo]: v }))}
            />
          </View>
        ))}
      </Tarjeta>

      <Boton titulo="Guardar" icono="save-outline" onPress={() => guardar()} cargando={accion.enviando} />
    </>
  );
}

/** Fila con título, descripción y un interruptor (Switch) a la derecha. */
function Interruptor({ icono, titulo, descripcion, valor, alCambiar, deshabilitado = false }) {
  return (
    <View style={[estilos.fila, deshabilitado && estilos.apagado]}>
      {icono && <Ionicons name={`${icono}-outline`} size={20} color={COLORES.guinda} />}
      <View style={estilos.flex}>
        <Texto negrita>{titulo}</Texto>
        {descripcion && <Texto variante="pequeno">{descripcion}</Texto>}
      </View>
      <Switch
        value={Boolean(valor)}
        onValueChange={alCambiar}
        disabled={deshabilitado}
        trackColor={{ false: COLORES.borde, true: COLORES.azul }}
        thumbColor={COLORES.blanco}
        accessibilityLabel={titulo}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.md, paddingVertical: ESPACIO.xs },
  flex: { flex: 1, gap: 2 },
  apagado: { opacity: 0.5 },
  conLinea: { borderTopWidth: 1, borderTopColor: COLORES.linea, paddingTop: ESPACIO.sm, marginTop: ESPACIO.sm },
  horas: { flexDirection: 'row', gap: ESPACIO.sm, marginTop: ESPACIO.sm },
});
