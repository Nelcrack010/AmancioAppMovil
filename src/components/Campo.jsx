import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Texto from './Texto';
import { COLORES, ESPACIO, FUENTES, RADIO, TAMANOS } from '../config/tema';

/**
 * Campo de formulario: rótulo + caja de texto + ayuda o error.
 *
 *     <Campo etiqueta="Título" valor={titulo} alCambiar={setTitulo} error={errores.titulo} />
 *
 * Cualquier otra prop (keyboardType, secureTextEntry, placeholder...) pasa al TextInput.
 * multilinea = true para textos largos (descripción, observación).
 */
export default function Campo({
  etiqueta, valor, alCambiar, error, ayuda, multilinea = false, style, ...resto
}) {
  return (
    <View style={[estilos.contenedor, style]}>
      {etiqueta && <Texto variante="pequeno" negrita color={COLORES.texto}>{etiqueta}</Texto>}
      <TextInput
        value={valor}
        onChangeText={alCambiar}
        multiline={multilinea}
        placeholderTextColor={COLORES.textoSuave}
        style={[estilos.caja, multilinea && estilos.multilinea, error && estilos.cajaError]}
        {...resto}
      />
      {error ? (
        <Texto variante="diminuto" color={COLORES.error}>{error}</Texto>
      ) : ayuda ? (
        <Texto variante="diminuto">{ayuda}</Texto>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: ESPACIO.xs, marginBottom: ESPACIO.md },
  caja: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: RADIO.md,
    paddingHorizontal: ESPACIO.md,
    paddingVertical: ESPACIO.sm,
    backgroundColor: COLORES.superficie,
    fontFamily: FUENTES.normal,
    fontSize: TAMANOS.normal,
    color: COLORES.texto,
  },
  multilinea: { minHeight: 96, textAlignVertical: 'top' },
  cajaError: { borderColor: COLORES.error },
});
