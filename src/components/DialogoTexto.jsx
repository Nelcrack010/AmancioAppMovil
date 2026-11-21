import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, View } from 'react-native';
import Texto from './Texto';
import Campo from './Campo';
import Boton from './Boton';
import { Aviso } from './Estados';
import { validarTexto } from '../utils/validaciones';
import { COLORES, ESPACIO, RADIO } from '../config/tema';

/**
 * DialogoTexto: ventana para pedir un texto antes de una acción
 * (motivo de anulación, motivo de cancelación, observación de la atención...).
 *
 *     <DialogoTexto
 *       visible={abierto}
 *       titulo="Anular reporte"
 *       etiqueta="Motivo"
 *       minimo={5}
 *       textoAceptar="Anular"
 *       alAceptar={async (texto) => { ... }}   // si devuelve un mensaje, se muestra como error
 *       alCerrar={() => setAbierto(false)}
 *     />
 */
export default function DialogoTexto({
  visible, titulo, mensaje, etiqueta, minimo = 1, maximo = 300, textoAceptar = 'Aceptar',
  peligroso = false, alAceptar, alCerrar,
  valorInicial = '', multilinea = true, propsCampo = {},   // opcionales (ej. la dirección del servidor)
}) {
  const [texto, setTexto] = useState(valorInicial);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Cada vez que se abre, empieza con el valor inicial (vacío por defecto).
  useEffect(() => {
    if (visible) {
      setTexto(valorInicial);
      setError(null);
    }
  }, [visible, valorInicial]);

  const aceptar = async () => {
    const errorLocal = validarTexto(texto, etiqueta.toLowerCase(), { minimo, maximo });
    if (errorLocal) {
      setError(errorLocal);
      return;
    }
    setEnviando(true);
    const errorServidor = await alAceptar(texto.trim());
    setEnviando(false);
    if (errorServidor) setError(errorServidor);
    else alCerrar();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={alCerrar}>
      <KeyboardAvoidingView style={estilos.fondo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={estilos.caja}>
          <Texto variante="subtitulo" color={COLORES.guinda}>{titulo}</Texto>
          {/* Boolean(): un texto vacío ('') no se puede dibujar suelto dentro de un View */}
          {Boolean(mensaje) && <Texto variante="pequeno">{mensaje}</Texto>}
          {error && <Aviso tono="error">{error}</Aviso>}
          <Campo
            etiqueta={etiqueta}
            valor={texto}
            alCambiar={setTexto}
            multilinea={multilinea}
            maxLength={maximo}
            autoFocus
            {...propsCampo}
          />
          <View style={estilos.botones}>
            <Boton titulo="Cancelar" variante="texto" onPress={alCerrar} style={estilos.flex} />
            <Boton
              titulo={textoAceptar}
              variante={peligroso ? 'peligro' : 'primario'}
              onPress={aceptar}
              cargando={enviando}
              style={estilos.flex}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: ESPACIO.lg },
  caja: { backgroundColor: COLORES.superficie, borderRadius: RADIO.lg, padding: ESPACIO.lg, gap: ESPACIO.sm },
  botones: { flexDirection: 'row', gap: ESPACIO.sm },
  flex: { flex: 1 },
});
