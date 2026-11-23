// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: general   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: LoginView: inicio de sesión con usuario y contraseña. Arriba, el bloque guinda con el logo (como la
//     portada del login del campus web); abajo, la tarjeta blanca con el formulario.
// Se muestra dentro de: AppNavigator.jsx
// Botones / secciones: «Ingresar», «Servidor»
// Campos: «Contraseña», «Dirección del servidor», «Usuario»
// Validación local (antes de enviar): tu usuario minimo: 3, maximo: 50; tu contraseña minimo: 1, maximo: 200
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
import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Texto from '../../components/Texto';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import DialogoTexto from '../../components/DialogoTexto';
import { Aviso } from '../../components/Estados';
import { useSesion } from '../../context/SesionContext';
import useAccion from '../../viewmodels/useAccion';
import {
  cambiarServidor, esperarServidor, normalizarServidor, probarServidor, servidorActual,
} from '../../services/servidor';
import { validarTexto, primerError } from '../../utils/validaciones';
import { NOMBRE_APP } from '../../config/constants';
import { COLORES, ESPACIO, RADIO, SOMBRA } from '../../config/tema';

/**
 * LoginView: inicio de sesión con usuario y contraseña.
 * Arriba, el bloque guinda con el logo (como la portada del login del campus web);
 * abajo, la tarjeta blanca con el formulario.
 *
 * Al pie, "Servidor: ... · Cambiar": la dirección del backend. Así el mismo APK sirve en
 * cualquier PC, escribiendo su IP (ver src/services/servidor.js).
 */
export default function LoginView() {
  const { iniciarSesion, sesionVencida } = useSesion();
  // PISTA: acción de guardar/enviar: accion.ejecutar(() => Repo.metodo(...)) devuelve { ok, resultado };
  //     accion.enviando = cargando; accion.error = mensaje de la API.
  const accion = useAccion();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [errorLocal, setErrorLocal] = useState(null);
  const [servidor, setServidor] = useState(servidorActual());
  const [editandoServidor, setEditandoServidor] = useState(false);

  // La dirección guardada se lee al abrir la app: mostrarla cuando esté lista.
  useEffect(() => {
    esperarServidor().then(() => setServidor(servidorActual()));
  }, []);

  // PISTA: entrar() se ejecuta al tocar el botón «Ingresar».
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

  /** Prueba la dirección escrita y, si el backend responde, la guarda. Devuelve el error o null. */
  const guardarServidor = async (texto) => {
    const url = normalizarServidor(texto);
    if (!/^https?:\/\/[^\s/]+$/i.test(url)) {
      return 'Escribe una dirección como http://192.168.1.20:5000';
    }
    if (!await probarServidor(url)) {
      return `No responde ${url}. Revisa que el backend esté encendido y que el celular esté en la misma red que la PC.`;
    }
    await cambiarServidor(url);
    setServidor(url);
    accion.limpiarError();
    return null;
  };

  const mensajeError = errorLocal || accion.error;

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
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

          {/* Dirección del backend: se puede cambiar sin volver a compilar el APK. */}
          <Pressable
            onPress={() => setEditandoServidor(true)}
            style={estilos.servidor}
            accessibilityRole="button"
            accessibilityLabel={`Servidor ${servidor}. Cambiar`}
          >
            <Ionicons name="server-outline" size={14} color={COLORES.textoSecundario} />
            <Texto variante="diminuto" numberOfLines={1} style={estilos.textoServidor}>Servidor: {servidor}</Texto>
            <Texto variante="diminuto" negrita color={COLORES.azul}>Cambiar</Texto>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <DialogoTexto
        visible={editandoServidor}
        titulo="Servidor"
        mensaje="Dirección del backend: la IP de la PC donde corre python run.py, por ejemplo http://192.168.1.20:5000. El celular debe estar en la misma red WiFi que la PC."
        etiqueta="Dirección del servidor"
        valorInicial={servidor}
        minimo={4}
        maximo={200}
        multilinea={false}
        propsCampo={{ autoCapitalize: 'none', autoCorrect: false, keyboardType: 'url' }}
        textoAceptar="Probar y guardar"
        alAceptar={guardarServidor}
        alCerrar={() => setEditandoServidor(false)}
      />
    </SafeAreaView>
  );
}

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
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
  servidor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ESPACIO.xs,
    marginHorizontal: ESPACIO.lg,
    marginTop: ESPACIO.lg,
    marginBottom: ESPACIO.xl,
    padding: ESPACIO.sm,
  },
  textoServidor: { flexShrink: 1 },
});
