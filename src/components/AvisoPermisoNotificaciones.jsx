// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: COMPONENTE · pieza visual reutilizable en varias pantallas
// Qué es: Aviso que aparece SOLO si el celular no deja que la app muestre notificaciones (el usuario negó el
//     permiso). Ofrece pedirlo otra vez o abrir los Ajustes del celular. Se revisa cada vez que la pantalla se
//     abre (por ejemplo, al volver de Ajustes).
//   <AvisoPermisoNotificaciones />
// Lo usan: AjustesNotificacionesView.jsx, NotificacionesView.jsx
//
// Para modificar: un cambio aquí se ve en TODAS las pantallas que lo usan.
//   Si solo quieres cambiar una pantalla, cámbialo en esa pantalla (por ejemplo con una prop o un style).
// <<< FIN GUÍA
import React, { useCallback, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Boton from './Boton';
import { Aviso } from './Estados';
import { estadoPermisoNotificaciones, prepararNotificaciones } from '../services/notificacionesPushService';
import { ESPACIO } from '../config/tema';

/**
 * Aviso que aparece SOLO si el celular no deja que la app muestre notificaciones
 * (el usuario negó el permiso). Ofrece pedirlo otra vez o abrir los Ajustes del celular.
 * Se revisa cada vez que la pantalla se abre (por ejemplo, al volver de Ajustes).
 */
export default function AvisoPermisoNotificaciones() {
  const [permiso, setPermiso] = useState(null);

  const revisar = useCallback(() => {
    estadoPermisoNotificaciones().then(setPermiso);
  }, []);
  useFocusEffect(revisar);

  if (!permiso || permiso.concedido) return null;

  const activar = async () => {
    if (permiso.sePuedePedir && await prepararNotificaciones()) {
      revisar();
      return;
    }
    Linking.openSettings();     // Android ya no pregunta: se activa en los Ajustes del celular
  };

  return (
    <View style={estilos.contenedor}>
      <Aviso tono="alerta" icono="notifications-off">
        Tu celular no deja que la app muestre notificaciones. Actívalas para que suenen los
        mensajes y avisos.
      </Aviso>
      <Boton titulo="Activar notificaciones" icono="notifications-outline" variante="secundario" onPress={activar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: ESPACIO.sm, marginBottom: ESPACIO.md },
});
