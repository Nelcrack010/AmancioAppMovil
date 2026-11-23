// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Notificaciones (avisos)   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: NotificacionesView: avisos del usuario (nueva tarea, calificación, cita, conducta, mensaje...). Los no
//     leídos van en negrita con un punto guinda. Al tocar uno se marca como leído y se abre la pantalla
//     relacionada.
// Pantalla «Notificaciones» (src/navigation/pantallas.js): en el menú de ALUMNO («Avisos»), DOCENTE («Avisos»),
//     AUXILIAR («Avisos»), PSICOLOGO («Avisos»), ADMIN («Avisos») (src/config/menus.js)
// Desde aquí se va a: AjustesNotificaciones
//
// Datos (repositorio → endpoint → backend):
//   MensajesRepository.marcarNotificacionLeida() → PATCH /notificaciones/<int:id_notificacion>/leida (backend:
//       notificacion_routes.py → marcar_leida())
//   MensajesRepository.marcarTodasLeidas() → PATCH /notificaciones/leer-todas (backend: notificacion_routes.py →
//       marcar_todas())
//   MensajesRepository.notificaciones() → GET /notificaciones (backend: notificacion_routes.py →
//       mis_notificaciones())
// Botones / secciones: «Configurar», «Sin avisos»
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
  // PISTA: «consulta» = datos que se cargan al abrir la pantalla: MensajesRepository.notificaciones() → GET
  //     /notificaciones (backend: notificacion_routes.py → mis_notificaciones()). Úsalos con consulta.datos;
  //     consulta.recargar() vuelve a pedirlos.
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

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
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

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  acciones: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ESPACIO.xs,
  },
});
