import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Texto from '../../components/Texto';
import { Aviso, Cargando } from '../../components/Estados';
import useChatViewModel from '../../viewmodels/useChatViewModel';
import { formatearFechaHora } from '../../utils/fechas';
import { NOMBRES_ROL } from '../../config/estados';
import { COLORES, ESPACIO, FUENTES, RADIO, TAMANOS } from '../../config/tema';

const MAXIMO_CARACTERES = 2000;   // el mismo límite que valida la API

/**
 * ChatView: mensajes de una conversación (burbujas propias a la derecha, en azul,
 * como en el campus web) y caja para escribir.
 * Se actualiza en tiempo real mientras está abierta (ver useChatViewModel).
 */
export default function ChatView({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const chat = useChatViewModel({
    idConversacionInicial: route.params?.idConversacion,
    contacto: route.params?.contacto,
  });
  const [texto, setTexto] = useState('');
  const scroll = useRef(null);

  // Título de la cabecera: nombre del contacto.
  useLayoutEffect(() => {
    if (chat.contacto?.nombre) navigation.setOptions({ title: chat.contacto.nombre });
  }, [navigation, chat.contacto?.nombre]);

  // La caja se limpia enseguida; si el envío falla, el texto vuelve a la caja.
  const enviar = async () => {
    const escrito = texto;
    setTexto('');
    if (!await chat.enviar(escrito)) setTexto(escrito);
  };

  if (chat.cargando) return <Cargando mensaje="Cargando conversación..." />;

  return (
    <KeyboardAvoidingView
      style={estilos.fondo}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scroll}
        contentContainerStyle={estilos.lista}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
      >
        {chat.contacto?.rol && (
          <Texto variante="diminuto" centrado style={estilos.rol}>{NOMBRES_ROL[chat.contacto.rol]}</Texto>
        )}
        {chat.mensajes.length === 0 && chat.enCola.length === 0 && chat.enviandose.length === 0 && (
          <Texto variante="pequeno" centrado>Escribe el primer mensaje.</Texto>
        )}

        {chat.mensajes.map((m) => (
          <Burbuja key={m.id_mensaje} mio={m.mio} texto={m.contenido}
            pie={`${formatearFechaHora(m.fecha_envio)}${m.mio && m.leido ? ' · leído' : ''}`} />
        ))}
        {chat.enviandose.map((m) => (
          <Burbuja key={m.clave} mio pendiente texto={m.contenido} pie="Enviando..." />
        ))}
        {chat.enCola.map((m) => (
          <Burbuja
            key={m.idOperacion}
            mio
            pendiente
            texto={m.contenido}
            pie={m.estado === 'ERROR'
              ? 'No se pudo enviar · revisa «Operaciones pendientes»'
              : 'Pendiente · se enviará al volver la red'}
          />
        ))}
      </ScrollView>

      {chat.error && <View style={estilos.error}><Aviso tono="error">{chat.error.message}</Aviso></View>}

      <View style={[estilos.barra, { paddingBottom: Math.max(insets.bottom, ESPACIO.sm) }]}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escribe un mensaje"
          placeholderTextColor={COLORES.textoSuave}
          multiline
          maxLength={MAXIMO_CARACTERES}
          style={estilos.caja}
        />
        <Pressable
          onPress={enviar}
          disabled={!texto.trim()}
          style={[estilos.enviar, !texto.trim() && estilos.inactivo]}
          accessibilityLabel="Enviar mensaje"
        >
          <Ionicons name="send" size={20} color={COLORES.blanco} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

/** Burbuja de un mensaje. */
function Burbuja({ mio, texto, pie, pendiente = false }) {
  return (
    <View style={[estilos.burbuja, mio ? estilos.mia : estilos.suya, pendiente && estilos.pendiente]}>
      <Texto color={mio ? COLORES.blanco : COLORES.texto}>{texto}</Texto>
      <Texto variante="diminuto" color={mio ? 'rgba(255,255,255,0.75)' : COLORES.textoSecundario} style={estilos.pie}>
        {pie}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORES.fondo },
  lista: { padding: ESPACIO.lg, gap: ESPACIO.sm, flexGrow: 1, justifyContent: 'flex-end' },
  rol: { marginBottom: ESPACIO.sm },
  burbuja: { maxWidth: '82%', paddingHorizontal: ESPACIO.md, paddingVertical: ESPACIO.sm, borderRadius: RADIO.lg },
  // Como el chat del campus web: lo mío en azul a la derecha; lo del otro en gris a la izquierda.
  mia: { alignSelf: 'flex-end', backgroundColor: COLORES.azul, borderBottomRightRadius: 4 },
  suya: { alignSelf: 'flex-start', backgroundColor: '#E9E9EB', borderBottomLeftRadius: 4 },
  pendiente: { opacity: 0.6 },
  pie: { marginTop: 2, alignSelf: 'flex-end' },
  error: { paddingHorizontal: ESPACIO.lg },
  barra: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: ESPACIO.sm,
    paddingHorizontal: ESPACIO.md,
    paddingTop: ESPACIO.sm,
    backgroundColor: COLORES.superficie,
    borderTopWidth: 1,
    borderTopColor: COLORES.borde,
  },
  caja: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    paddingHorizontal: ESPACIO.md,
    paddingVertical: ESPACIO.sm,
    borderRadius: RADIO.lg,
    backgroundColor: COLORES.fondo,
    borderWidth: 1,
    borderColor: COLORES.borde,
    fontFamily: FUENTES.normal,
    fontSize: TAMANOS.normal,
    color: COLORES.texto,
  },
  enviar: {
    width: 44, height: 44, borderRadius: RADIO.total, backgroundColor: COLORES.azul,
    alignItems: 'center', justifyContent: 'center',
  },
  inactivo: { opacity: 0.5 },
});
