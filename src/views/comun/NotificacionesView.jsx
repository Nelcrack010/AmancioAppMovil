import React from 'react';
import { StyleSheet } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Boton from '../../components/Boton';
import Lista, { ItemLista } from '../../components/Lista';
import { Vacio } from '../../components/Estados';
import { useSesion } from '../../context/SesionContext';
import useConsulta from '../../viewmodels/useConsulta';
import MensajesRepository from '../../repositories/mensajesRepository';
import { formatearFechaHora } from '../../utils/fechas';
import { COLORES, ESPACIO } from '../../config/tema';

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
 * mensaje...). Los no leídos van en negrita con un punto guinda. Al tocar uno se marca
 * como leído y se abre la pantalla relacionada.
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
              variante="texto"
              pequeno
              onPress={leerTodas}
              style={estilos.leerTodas}
            />
          )}
          <Lista>
            {datos.notificaciones.map((n) => (
              <ItemLista
                key={n.id_notificacion}
                icono={`${TIPOS[n.tipo]?.icono || 'notifications'}-outline`}
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

const estilos = StyleSheet.create({
  leerTodas: { alignSelf: 'flex-end', marginBottom: ESPACIO.xs },
});
