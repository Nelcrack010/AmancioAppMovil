import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Texto from '../Texto';
import MenuMas from './MenuMas';
import BannerConexion from './BannerConexion';
import { useSesion } from '../../context/SesionContext';
import { puedeSalir } from '../../navigation/guardiaSalida';
import { MAXIMO_EN_BARRA } from '../../config/menus';
import { COLORES, ESPACIO, RADIO } from '../../config/tema';

/**
 * MenuBar: barra de menú inferior (reemplaza al menú lateral del campus web).
 *
 * Recibe las opciones del rol (src/config/menus.js). Si caben todas (hasta
 * MAXIMO_EN_BARRA + 1) se muestran todas; si no, se muestran las primeras
 * MAXIMO_EN_BARRA y el resto va dentro del botón "Más".
 *
 * Lo usa CampusNavigator como `tabBar` del navegador de pestañas, por eso recibe
 * `state` (qué pantalla está activa) y `navigation` (para cambiar de pantalla).
 */
export default function MenuBar({ state, navigation, opciones }) {
  const insets = useSafeAreaInsets();
  const { contadores } = useSesion();
  const [masAbierto, setMasAbierto] = useState(false);

  const caben = opciones.length <= MAXIMO_EN_BARRA + 1;
  const visibles = caben ? opciones : opciones.slice(0, MAXIMO_EN_BARRA);
  const enMas = caben ? [] : opciones.slice(MAXIMO_EN_BARRA);

  const pantallaActiva = state.routes[state.index].name;
  const masActivo = enMas.some((o) => o.pantalla === pantallaActiva);

  const ir = async (pantalla) => {
    setMasAbierto(false);
    if (pantalla === pantallaActiva) return;
    // Si la pantalla actual tiene cambios sin guardar, se pregunta antes de salir.
    if (await puedeSalir()) navigation.navigate(pantalla);
  };

  // Suma de no leídos de las opciones escondidas en "Más" (para el globo de "Más").
  const contadorMas = enMas.reduce((total, o) => total + (o.contador ? contadores[o.contador] : 0), 0);

  return (
    <View>
      <BannerConexion />
      <View style={[estilos.barra, { paddingBottom: Math.max(insets.bottom, ESPACIO.sm) }]}>
        {visibles.map((opcion) => (
          <BotonMenu
            key={opcion.pantalla}
            titulo={opcion.titulo}
            icono={opcion.icono}
            activo={opcion.pantalla === pantallaActiva}
            contador={opcion.contador ? contadores[opcion.contador] : 0}
            onPress={() => ir(opcion.pantalla)}
          />
        ))}
        {enMas.length > 0 && (
          <BotonMenu
            titulo="Más"
            icono="grid"
            activo={masActivo}
            contador={contadorMas}
            onPress={() => setMasAbierto(true)}
          />
        )}
      </View>

      <MenuMas
        visible={masAbierto}
        opciones={enMas}
        pantallaActiva={pantallaActiva}
        contadores={contadores}
        alElegir={ir}
        alCerrar={() => setMasAbierto(false)}
      />
    </View>
  );
}

/** Un botón de la barra: ícono + texto + globo de no leídos. */
function BotonMenu({ titulo, icono, activo, contador, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: activo }}
      accessibilityLabel={contador ? `${titulo}, ${contador} sin leer` : titulo}
      style={estilos.boton}
    >
      <View style={[estilos.pastilla, activo && estilos.pastillaActiva]}>
        <Ionicons
          name={activo ? icono : `${icono}-outline`}
          size={22}
          color={activo ? COLORES.crema : 'rgba(255,255,255,0.75)'}
        />
        {contador > 0 && (
          <View style={estilos.globo}>
            <Texto variante="diminuto" negrita color={COLORES.guinda}>
              {contador > 99 ? '99+' : contador}
            </Texto>
          </View>
        )}
      </View>
      <Texto
        variante="diminuto"
        negrita={activo}
        numberOfLines={1}
        color={activo ? COLORES.crema : 'rgba(255,255,255,0.75)'}
      >
        {titulo}
      </Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  // Mismo guinda del menú lateral del campus web.
  barra: {
    flexDirection: 'row',
    backgroundColor: COLORES.guinda,
    paddingTop: ESPACIO.sm,
    paddingHorizontal: ESPACIO.xs,
  },
  boton: { flex: 1, alignItems: 'center', gap: 2, minHeight: 52 },
  pastilla: {
    paddingHorizontal: ESPACIO.lg,
    paddingVertical: 4,
    borderRadius: RADIO.total,
  },
  // En la web la opción activa tenía fondo blanco al 10 %.
  pastillaActiva: { backgroundColor: 'rgba(255,255,255,0.14)' },
  globo: {
    position: 'absolute',
    top: -4,
    right: 4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: RADIO.total,
    backgroundColor: COLORES.crema,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
