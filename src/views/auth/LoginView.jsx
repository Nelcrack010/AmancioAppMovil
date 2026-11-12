import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Texto from '../../components/Texto';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import { Aviso } from '../../components/Estados';
import { useSesion } from '../../context/SesionContext';
import useAccion from '../../viewmodels/useAccion';
import { validarTexto, primerError } from '../../utils/validaciones';
import { NOMBRE_APP } from '../../config/constants';
import { COLORES, ESPACIO, RADIO, SOMBRA } from '../../config/tema';

/**
 * LoginView: inicio de sesión con usuario y contraseña.
 * Arriba, el bloque guinda con el logo (como la portada del login del campus web);
 * abajo, la tarjeta blanca con el formulario.
 */
export default function LoginView() {
  const { iniciarSesion, sesionVencida } = useSesion();
  const accion = useAccion();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [errorLocal, setErrorLocal] = useState(null);

  const entrar = async () => {
    // 1. Validación local, antes de llamar a la API.
    const error = primerError(
      validarTexto(usuario, 'tu usuario', { minimo: 3, maximo: 50 }),
      validarTexto(clave, 'tu contraseña', { minimo: 1, maximo: 200 }),
    );
    setErrorLocal(error);
    if (error) return;

    // 2. Llamar a la API. Si sale bien, AppNavigator cambia de pantalla solo.
    await accion.ejecutar(() => iniciarSesion(usuario.trim(), clave));
  };

  const mensajeError = errorLocal || accion.error;

  return (
    <SafeAreaView style={estilos.fondo} edges={['top']}>
      <KeyboardAvoidingView style={estilos.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">
          {/* Portada guinda con el logo del colegio */}
          <View style={estilos.portada}>
            <Image source={require('../../../assets/logo.png')} style={estilos.logo} resizeMode="contain" />
            <Texto variante="titulo" color={COLORES.blanco} centrado>{NOMBRE_APP}</Texto>
            <Texto color={COLORES.crema} centrado>I.E.P. Amancio Varona · Tumán</Texto>
          </View>

          {/* Tarjeta del formulario */}
          <View style={estilos.tarjeta}>
            <Texto variante="subtitulo" color={COLORES.guinda}>Iniciar sesión</Texto>
            <Texto variante="pequeno" style={estilos.subtitulo}>
              Ingresa con tu usuario del campus virtual.
            </Texto>

            {sesionVencida && (
              <Aviso tono="alerta">Tu sesión expiró. Vuelve a ingresar; tus operaciones pendientes se conservan.</Aviso>
            )}
            {mensajeError && <Aviso tono="error">{mensajeError}</Aviso>}

            <Campo
              etiqueta="Usuario"
              valor={usuario}
              alCambiar={setUsuario}
              placeholder="Ej. ALU-12345678"
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="next"
            />
            <View>
              <Campo
                etiqueta="Contraseña"
                valor={clave}
                alCambiar={setClave}
                placeholder="Tu contraseña"
                secureTextEntry={!verClave}
                autoCapitalize="none"
                onSubmitEditing={entrar}
                returnKeyType="go"
              />
              <Pressable
                onPress={() => setVerClave(!verClave)}
                style={estilos.ojo}
                accessibilityLabel={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <Ionicons name={verClave ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORES.textoSecundario} />
              </Pressable>
            </View>

            <Boton titulo="Ingresar" icono="log-in-outline" onPress={entrar} cargando={accion.enviando} />

            <Texto variante="diminuto" centrado style={estilos.nota}>
              En tu primer ingreso la contraseña es tu DNI y deberás cambiarla.
            </Texto>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORES.guinda },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, backgroundColor: COLORES.fondo },
  portada: {
    backgroundColor: COLORES.guinda,
    alignItems: 'center',
    paddingTop: ESPACIO.xl * 2,
    paddingBottom: ESPACIO.xl * 3,
    paddingHorizontal: ESPACIO.xl,
    gap: ESPACIO.xs,
  },
  logo: { width: 96, height: 96, marginBottom: ESPACIO.md },
  tarjeta: {
    backgroundColor: COLORES.superficie,
    marginHorizontal: ESPACIO.lg,
    marginTop: -ESPACIO.xl * 2,
    borderRadius: RADIO.lg,
    padding: ESPACIO.xl,
    ...SOMBRA,
    elevation: 6,
  },
  subtitulo: { marginBottom: ESPACIO.lg },
  ojo: { position: 'absolute', right: ESPACIO.sm, top: 30, padding: ESPACIO.sm },
  nota: { marginTop: ESPACIO.lg },
});
