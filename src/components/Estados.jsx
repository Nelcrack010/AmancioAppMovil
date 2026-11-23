// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: COMPONENTE · pieza visual reutilizable en varias pantallas
// Qué es: Estados de interfaz que pide la propuesta: Cargando, Vacío, Error y Sin conexión. Todas las pantallas
//     usan estos mismos componentes para verse consistentes.
//   <Cargando mensaje = 'Cargando...' />
//   <Vacio icono = 'file-tray-outline', titulo = 'No hay nada por aquí', mensaje />
//   <ErrorVista error, onReintentar />
//   <Aviso tono = 'info', icono, children />
//   <AvisoDatosGuardados aviso, actualizadoEn />
// Lo usan: App.jsx, AvisoPermisoNotificaciones.jsx, DialogoTexto.jsx, Pantalla.jsx, AppNavigator.jsx,
//     MiAsistenciaView.jsx, MisCitasView.jsx, MisNotasView.jsx (+31 más)
//
// Para modificar: un cambio aquí se ve en TODAS las pantallas que lo usan.
//   Si solo quieres cambiar una pantalla, cámbialo en esa pantalla (por ejemplo con una prop o un style).
// <<< FIN GUÍA
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Texto from './Texto';
import Boton from './Boton';
import { COLORES, ESPACIO, RADIO } from '../config/tema';
import { formatearMomentoLocal } from '../utils/fechas';

/**
 * Estados de interfaz que pide la propuesta: Cargando, Vacío, Error y Sin conexión.
 * Todas las pantallas usan estos mismos componentes para verse consistentes.
 */

/** Cargando: indicador guinda en el centro. */
export function Cargando({ mensaje = 'Cargando...' }) {
  return (
    <View style={estilos.centro}>
      <ActivityIndicator size="large" color={COLORES.guinda} />
      <Texto variante="pequeno">{mensaje}</Texto>
    </View>
  );
}

/** Vacío: no hay nada que mostrar (ej. "No tienes tareas"). */
export function Vacio({ icono = 'file-tray-outline', titulo = 'No hay nada por aquí', mensaje }) {
  return (
    <View style={estilos.centro}>
      <Ionicons name={icono} size={48} color={COLORES.textoSuave} />
      <Texto variante="subtitulo" centrado color={COLORES.textoSecundario}>{titulo}</Texto>
      {Boolean(mensaje) && <Texto variante="pequeno" centrado>{mensaje}</Texto>}
    </View>
  );
}

/** Error: algo falló y no hay datos guardados. Ofrece reintentar. */
export function ErrorVista({ error, onReintentar }) {
  const sinRed = error?.esDeRed;
  return (
    <View style={estilos.centro}>
      <Ionicons
        name={sinRed ? 'cloud-offline-outline' : 'alert-circle-outline'}
        size={48}
        color={sinRed ? COLORES.alerta : COLORES.error}
      />
      <Texto variante="subtitulo" centrado>{sinRed ? 'Sin conexión' : 'No se pudo cargar'}</Texto>
      <Texto variante="pequeno" centrado>{error?.message || 'Ocurrió un error inesperado.'}</Texto>
      {onReintentar && <Boton titulo="Reintentar" icono="refresh" variante="secundario" onPress={onReintentar} />}
    </View>
  );
}

/**
 * Aviso en línea (caja de color) para mensajes dentro de un formulario o pantalla.
 * tono: info | exito | alerta | error
 */
export function Aviso({ tono = 'info', icono, children }) {
  const colores = {
    info: [COLORES.infoFondo, COLORES.info, 'information-circle'],
    exito: [COLORES.exitoFondo, COLORES.exito, 'checkmark-circle'],
    alerta: [COLORES.alertaFondo, COLORES.alerta, 'warning'],
    error: [COLORES.errorFondo, COLORES.error, 'alert-circle'],
  }[tono];
  return (
    <View style={[estilos.aviso, { backgroundColor: colores[0], borderLeftColor: colores[1] }]}>
      <Ionicons name={icono || colores[2]} size={18} color={colores[1]} />
      <Texto variante="pequeno" color={colores[1]} style={estilos.textoAviso}>{children}</Texto>
    </View>
  );
}

/** Aviso de que se están mostrando datos guardados en el celular (modo sin conexión). */
export function AvisoDatosGuardados({ aviso, actualizadoEn }) {
  if (!aviso) return null;
  const cuando = actualizadoEn ? ` (guardados el ${formatearMomentoLocal(actualizadoEn)})` : '';
  return <Aviso tono="alerta" icono="cloud-offline">{aviso}{cuando}</Aviso>;
}

const estilos = StyleSheet.create({
  centro: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACIO.xl,
    gap: ESPACIO.sm,
    minHeight: 240,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.sm,
    padding: ESPACIO.md,
    borderRadius: RADIO.sm,
    borderLeftWidth: 4,
    marginBottom: ESPACIO.md,
  },
  textoAviso: { flex: 1 },
});
