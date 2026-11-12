import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Boton from '../../components/Boton';
import { Vacio } from '../../components/Estados';
import { useSesion } from '../../context/SesionContext';
import useConsulta from '../../viewmodels/useConsulta';
import MensajesRepository from '../../repositories/mensajesRepository';
import { formatearFechaHora } from '../../utils/fechas';
import { COLORES, ESPACIO, RADIO } from '../../config/tema';

/**
 * Ícono y pantalla que se abre al tocar cada tipo de notificación.
 * `destino(n, rol)` devuelve [pantalla, params] o null si no abre nada.
 */
const TIPOS = {
  TAREA: { icono: 'document-text', destino: () => ['Cursos'] },
  CALIFICACION: { icono: 'star', destino: () => ['Cursos'] },
  CLASE: { icono: 'videocam', destino: () => ['Cursos'] },
  LIBRETA: { icono: 'ribbon', destino: () => ['MisNotas'] },
  CITA: { icono: 'heart', destino: (n, rol) => [rol === 'PSICOLOGO' ? 'Agenda' : 'MisCitas'] },
  CONDUCTA: { icono: 'shield', destino: (n, rol) => (rol === 'ALUMNO' ? ['MiConducta'] : null) },
  MENSAJE: { icono: 'chatbubble', destino: (n) => (n.id_referencia ? ['Chat', { idConversacion: n.id_referencia }] : ['Mensajes']) },
};

/**
 * NotificacionesView: avisos del usuario (nueva tarea, calificación, cita, conducta,
 * mensaje...). Al tocar uno se marca como leído y se abre la pantalla relacionada.
 */
export default function NotificacionesView({ navigation }) {
  const { usuario, refrescarContadores } = useSesion();
  const consulta = useConsulta(() => MensajesRepository.notificaciones(), []);

  const abrir = async (n) => {
    if (!n.leida) {
      try {
        await MensajesRepository.marcarNotificacionLeida(n.id_notificacion);
        refrescarContadores();
      } catch {
        // si falla (sin red), igual se abre la pantalla
      }
    }
    const destino = TIPOS[n.tipo]?.destino(n, usuario.rol);
    if (destino) navigation.navigate(...destino);
    else consulta.recargar();
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
        <Vacio icono="notifications-off-outline" titulo="Sin avisos" mensaje="Aquí verás tus notificaciones." />
      ) : (
        <>
          {datos.no_leidas > 0 && (
            <Boton
              titulo={`Marcar ${datos.no_leidas} como leída(s)`}
              icono="checkmark-done-outline"
              variante="secundario"
              pequeno
              onPress={leerTodas}
              style={estilos.leerTodas}
            />
          )}
          {datos.notificaciones.map((n) => (
            <Tarjeta key={n.id_notificacion} onPress={() => abrir(n)} colorBorde={n.leida ? undefined : COLORES.guinda}>
              <View style={estilos.fila}>
                <View style={[estilos.icono, !n.leida && estilos.iconoNuevo]}>
                  <Ionicons name={`${TIPOS[n.tipo]?.icono || 'notifications'}-outline`} size={20}
                    color={n.leida ? COLORES.textoSecundario : COLORES.guinda} />
                </View>
                <View style={estilos.flex}>
                  <Texto negrita={!n.leida}>{n.titulo}</Texto>
                  <Texto variante="pequeno">{n.mensaje}</Texto>
                  <Texto variante="diminuto">{formatearFechaHora(n.fecha)}</Texto>
                </View>
              </View>
            </Tarjeta>
          ))}
        </>
      ))}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  leerTodas: { alignSelf: 'flex-end', marginBottom: ESPACIO.md },
  fila: { flexDirection: 'row', gap: ESPACIO.md, alignItems: 'flex-start' },
  flex: { flex: 1, gap: 2 },
  icono: {
    width: 36, height: 36, borderRadius: RADIO.total, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORES.bordeSuave,
  },
  iconoNuevo: { backgroundColor: COLORES.crema },
});
