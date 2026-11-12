import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Texto from '../Texto';
import { useSesion } from '../../context/SesionContext';
import { useConexion } from '../../context/ConexionContext';
import { confirmar } from '../../utils/dialogos';
import { NOMBRES_ROL } from '../../config/estados';
import { COLORES, ESPACIO, RADIO } from '../../config/tema';

/**
 * MenuMas: panel que sube desde abajo con las opciones que no caben en la barra,
 * más el botón "Cerrar sesión".
 */
export default function MenuMas({ visible, opciones, pantallaActiva, contadores, alElegir, alCerrar }) {
  const insets = useSafeAreaInsets();
  const { usuario, cerrarSesion } = useSesion();
  const { pendientes } = useConexion();

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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={alCerrar}>
      {/* Fondo oscuro: tocarlo cierra el panel */}
      <Pressable style={estilos.fondo} onPress={alCerrar} accessibilityLabel="Cerrar menú" />

      <View style={[estilos.panel, { paddingBottom: insets.bottom + ESPACIO.lg }]}>
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
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  panel: {
    backgroundColor: COLORES.guinda,
    borderTopLeftRadius: RADIO.lg + 8,
    borderTopRightRadius: RADIO.lg + 8,
    paddingHorizontal: ESPACIO.lg,
    paddingTop: ESPACIO.sm,
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
