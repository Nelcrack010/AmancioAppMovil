import React from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Boton from '../../components/Boton';
import Lista, { ItemLista } from '../../components/Lista';
import { Vacio } from '../../components/Estados';
import AvisoPermisoNotificaciones from '../../components/AvisoPermisoNotificaciones';
import { useSesion } from '../../context/SesionContext';
import useConsulta from '../../viewmodels/useConsulta';
import MensajesRepository from '../../repositories/mensajesRepository';
import { formatearFechaHora } from '../../utils/fechas';
import { COLORES, ESPACIO } from '../../config/tema';
import { destinoDeNotificacion, iconoDeNotificacion } from '../../navigation/abrirNotificacion';
import { CUALQUIER_PUSH, TIEMPO_REAL } from '../../config/tiempoReal';

/**
 * NotificacionesView: avisos del usuario (nueva tarea, calificación, cita, conducta,
 * mensaje...). Los no leídos van en negrita con un punto guinda. Al tocar uno se marca
 * como leído y se abre la pantalla relacionada.
 *
 * El ícono y la pantalla de cada tipo de aviso se configuran en src/config/notificaciones.js.
 */
export default function NotificacionesView({ navigation }) {
  const { usuario, refrescarContadores } = useSesion();
  // Tiempo real: los avisos nuevos aparecen solos (y al instante si llega un push).
  const consulta = useConsulta(() => MensajesRepository.notificaciones(), [], {
    actualizarCada: TIEMPO_REAL.AVISOS_MS,
    tiposPush: CUALQUIER_PUSH,
  });

  const abrir = async (n) => {
    if (!n.leida) {
      try {
        await MensajesRepository.marcarNotificacionLeida(n.id_notificacion);
        refrescarContadores();
      } catch {
        // si falla (sin red), igual se abre la pantalla
      }
    }
    const destino = destinoDeNotificacion(n, usuario?.rol);
    if (destino) navigation.navigate(...destino);
    else consulta.recargar();   // el aviso no abre otra pantalla: solo se actualiza la lista
  };

  const leerTodas = async () => {
    try {
      await MensajesRepository.marcarTodasLeidas();
      refrescarContadores();
      consulta.recargar();
    } catch {
      // sin conexión: no se hace nada
    }
  };

  return (
    <Pantalla consulta={consulta}>
      {(datos) => (datos.notificaciones.length === 0 ? (
        <>
          <AvisoPermisoNotificaciones />
          <BotonAjustes alTocar={() => navigation.navigate('AjustesNotificaciones')} />
          <Vacio icono="notifications-off-outline" titulo="Sin avisos" mensaje="Aquí verás tus notificaciones." />
        </>
      ) : (
        <>
          <AvisoPermisoNotificaciones />
          <View style={estilos.acciones}>
            <BotonAjustes alTocar={() => navigation.navigate('AjustesNotificaciones')} />
            {datos.no_leidas > 0 && (
              <Boton
                titulo={`Marcar ${datos.no_leidas} como leída(s)`}
                icono="checkmark-done-outline"
                variante="texto"
                pequeno
                onPress={leerTodas}
              />
            )}
          </View>
          <Lista>
            {datos.notificaciones.map((n) => (
              <ItemLista
                key={n.id_notificacion}
                icono={`${iconoDeNotificacion(n.tipo)}-outline`}
                colorIcono={n.leida ? COLORES.textoSecundario : COLORES.guinda}
                fondoIcono={n.leida ? COLORES.bordeSuave : COLORES.crema}
                titulo={n.titulo}
                subtitulo={n.mensaje}
                detalle={formatearFechaHora(n.fecha)}
                resaltado={!n.leida}
                acento={n.leida ? undefined : COLORES.guinda}
                onPress={() => abrir(n)}
              />
            ))}
          </Lista>
        </>
      ))}
    </Pantalla>
  );
}

/** Botón para abrir los ajustes de notificaciones (silenciar, elegir tipos...). */
function BotonAjustes({ alTocar }) {
  return <Boton titulo="Configurar" icono="settings-outline" variante="texto" pequeno onPress={alTocar} />;
}

const estilos = StyleSheet.create({
  acciones: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ESPACIO.xs,
  },
});
