import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Easing, Modal, Platform, Pressable, StyleSheet, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Texto from '../Texto';
import { useSesion } from '../../context/SesionContext';
import { useConexion } from '../../context/ConexionContext';
import { confirmar } from '../../utils/dialogos';
import { NOMBRES_ROL } from '../../config/estados';
import { COLORES, ESPACIO, RADIO } from '../../config/tema';

const DURACION_MS = 240;
const usarDriverNativo = Platform.OS !== 'web';   // en el navegador no existe el driver nativo

/**
 * MenuMas: panel que sube desde abajo con las opciones que no caben en la barra,
 * más el botón "Cerrar sesión".
 *
 * El fondo oscuro y el panel se animan POR SEPARADO: el fondo aparece con un fundido
 * (cubre toda la pantalla, también la barra de estado) y solo el panel sube. Antes se
 * usaba animationType="slide", que subía el fondo oscuro junto con el panel.
 */
export default function MenuMas({ visible, opciones, pantallaActiva, contadores, alElegir, alCerrar }) {
  const insets = useSafeAreaInsets();
  const { height: altoPantalla } = useWindowDimensions();
  const { usuario, cerrarSesion } = useSesion();
  const { pendientes } = useConexion();

  // `montado` mantiene el Modal abierto mientras termina la animación de cierre.
  const [montado, setMontado] = useState(visible);
  const progreso = useRef(new Animated.Value(0)).current;   // 0 = cerrado, 1 = abierto

  useEffect(() => {
    if (visible) {
      setMontado(true);
      Animated.timing(progreso, {
        toValue: 1, duration: DURACION_MS, easing: Easing.out(Easing.cubic), useNativeDriver: usarDriverNativo,
      }).start();
    } else {
      Animated.timing(progreso, {
        toValue: 0, duration: DURACION_MS * 0.8, easing: Easing.in(Easing.cubic), useNativeDriver: usarDriverNativo,
      }).start(({ finished }) => { if (finished) setMontado(false); });
    }
  }, [visible, progreso]);

  const subirPanel = progreso.interpolate({ inputRange: [0, 1], outputRange: [altoPantalla, 0] });

  const salir = async () => {
    // Al cerrar sesión se borra la cola: se avisa si hay trabajo sin enviar.
    const mensaje = pendientes > 0
      ? `Tienes ${pendientes} operación(es) sin enviar. Si cierras sesión se perderán.`
      : '¿Seguro que quieres cerrar sesión?';
    if (await confirmar('Cerrar sesión', mensaje, { textoAceptar: 'Cerrar sesión', peligroso: true })) {
      alCerrar();
      await cerrarSesion();
    }
  };

  return (
    <Modal
      visible={montado}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={alCerrar}
    >
      <View style={estilos.contenedor}>
        {/* Fondo oscuro (aparece con fundido): tocarlo cierra el panel */}
        <Animated.View style={[StyleSheet.absoluteFill, estilos.fondo, { opacity: progreso }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={alCerrar} accessibilityLabel="Cerrar menú" />
        </Animated.View>

        <Animated.View
          style={[estilos.panel, { paddingBottom: insets.bottom + ESPACIO.lg, transform: [{ translateY: subirPanel }] }]}
        >
          <View style={estilos.asa} />
          <Texto variante="subtitulo" color={COLORES.crema}>Menú</Texto>
          <Texto variante="pequeno" color="rgba(255,255,255,0.7)" style={estilos.rol}>
            {usuario?.username} · {NOMBRES_ROL[usuario?.rol]}
          </Texto>

          {opciones.map((opcion) => {
            const activa = opcion.pantalla === pantallaActiva;
            const contador = opcion.contador ? contadores[opcion.contador] : 0;
            return (
              <Pressable
                key={opcion.pantalla}
                onPress={() => alElegir(opcion.pantalla)}
                style={[estilos.opcion, activa && estilos.opcionActiva]}
                accessibilityRole="button"
              >
                <Ionicons name={activa ? opcion.icono : `${opcion.icono}-outline`} size={22} color={COLORES.blanco} />
                <Texto negrita={activa} color={COLORES.blanco} style={estilos.textoOpcion}>{opcion.titulo}</Texto>
                {contador > 0 && (
                  <View style={estilos.globo}>
                    <Texto variante="diminuto" negrita color={COLORES.guinda}>{contador}</Texto>
                  </View>
                )}
              </Pressable>
            );
          })}

          <Pressable onPress={salir} style={[estilos.opcion, estilos.salir]} accessibilityRole="button">
            <Ionicons name="log-out-outline" size={22} color={COLORES.crema} />
            <Texto negrita color={COLORES.crema} style={estilos.textoOpcion}>Cerrar sesión</Texto>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  // El panel queda abajo; el fondo oscuro ocupa toda la pantalla detrás de él.
  contenedor: { flex: 1, justifyContent: 'flex-end' },
  fondo: { backgroundColor: 'rgba(0,0,0,0.5)' },
  panel: {
    backgroundColor: COLORES.guinda,
    borderTopLeftRadius: RADIO.lg + 8,
    borderTopRightRadius: RADIO.lg + 8,
    paddingHorizontal: ESPACIO.lg,
    paddingTop: ESPACIO.sm,
    // Sombra hacia arriba para separar el panel del contenido de detrás.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 24,
  },
  asa: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginBottom: ESPACIO.md,
  },
  rol: { marginBottom: ESPACIO.md },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.md,
    paddingVertical: ESPACIO.md,
    paddingHorizontal: ESPACIO.md,
    borderRadius: RADIO.md,
  },
  opcionActiva: { backgroundColor: 'rgba(255,255,255,0.12)' },
  textoOpcion: { flex: 1 },
  salir: { marginTop: ESPACIO.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', borderRadius: 0 },
  globo: {
    minWidth: 22, height: 22, borderRadius: RADIO.total, paddingHorizontal: 6,
    backgroundColor: COLORES.crema, alignItems: 'center', justifyContent: 'center',
  },
});
