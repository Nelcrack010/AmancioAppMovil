// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: COMPONENTE · pieza visual reutilizable en varias pantallas
// Qué es: Botones a la derecha de la cabecera (como en el HeaderCampus de la web): campana de notificaciones con
//     su contador y acceso al perfil.
//   <BotonesEncabezado />
// Lo usan: MenuNavigator.jsx
//
// Para modificar: un cambio aquí se ve en TODAS las pantallas que lo usan.
//   Si solo quieres cambiar una pantalla, cámbialo en esa pantalla (por ejemplo con una prop o un style).
// <<< FIN GUÍA
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Texto from '../Texto';
import { useSesion } from '../../context/SesionContext';
import { puedeSalir } from '../../navigation/guardiaSalida';
import { COLORES, ESPACIO, RADIO } from '../../config/tema';

/**
 * Botones a la derecha de la cabecera (como en el HeaderCampus de la web):
 * campana de notificaciones con su contador y acceso al perfil.
 */
export default function BotonesEncabezado() {
  const navigation = useNavigation();
  const { contadores } = useSesion();

  // Antes de cambiar de pantalla se revisa si hay cambios sin guardar.
  const ir = async (pantalla) => {
    if (await puedeSalir()) navigation.navigate(pantalla);
  };

  return (
    <View style={estilos.fila}>
      <Pressable
        onPress={() => ir('Notificaciones')}
        style={estilos.boton}
        accessibilityLabel={`Notificaciones, ${contadores.notificaciones} sin leer`}
      >
        <Ionicons name="notifications-outline" size={24} color={COLORES.guinda} />
        {contadores.notificaciones > 0 && (
          <View style={estilos.globo}>
            <Texto variante="diminuto" negrita color={COLORES.blanco}>
              {contadores.notificaciones > 9 ? '9+' : contadores.notificaciones}
            </Texto>
          </View>
        )}
      </Pressable>
      <Pressable
        onPress={() => ir('Perfil')}
        style={estilos.boton}
        accessibilityLabel="Mi perfil"
      >
        <Ionicons name="person-circle-outline" size={26} color={COLORES.guinda} />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.xs, marginRight: ESPACIO.sm },
  boton: { padding: ESPACIO.sm },
  globo: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: RADIO.total,
    paddingHorizontal: 3,
    backgroundColor: COLORES.guinda,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
