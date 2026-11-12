import React from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Boton from '../../components/Boton';
import { Avatar } from '../../components/Basicos';
import { Vacio } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import MensajesRepository from '../../repositories/mensajesRepository';
import { formatearFechaHora } from '../../utils/fechas';
import { NOMBRES_ROL } from '../../config/estados';
import { COLORES, ESPACIO, RADIO } from '../../config/tema';

/**
 * MensajesView: conversaciones del usuario con el último mensaje y los no leídos.
 * El botón "Nuevo mensaje" abre la lista de contactos permitidos para el rol.
 */
export default function MensajesView({ navigation }) {
  const conversaciones = useConsulta(() => MensajesRepository.conversaciones(), []);

  return (
    <Pantalla
      consulta={conversaciones}
      pie={<Boton titulo="Nuevo mensaje" icono="create-outline" onPress={() => navigation.navigate('Contactos')} />}
    >
      {(lista) => (lista.length === 0 ? (
        <Vacio icono="chatbubbles-outline" titulo="Sin conversaciones" mensaje="Escribe a un docente, auxiliar o a psicología." />
      ) : lista.map((c) => (
        <Tarjeta
          key={c.id_conversacion}
          onPress={() => navigation.navigate('Chat', { idConversacion: c.id_conversacion, titulo: c.contacto })}
        >
          <View style={estilos.fila}>
            <Avatar nombre={c.contacto} />
            <View style={estilos.flex}>
              <Texto negrita numberOfLines={1}>{c.contacto}</Texto>
              <Texto variante="diminuto">{NOMBRES_ROL[c.rol_contacto]} · {formatearFechaHora(c.fecha_actualizacion)}</Texto>
              <Texto variante="pequeno" numberOfLines={1} negrita={c.no_leidos > 0}
                color={c.no_leidos > 0 ? COLORES.texto : COLORES.textoSecundario}>
                {c.ultimo_mensaje}
              </Texto>
            </View>
            {c.no_leidos > 0 && (
              <View style={estilos.globo}>
                <Texto variante="diminuto" negrita color={COLORES.blanco}>{c.no_leidos}</Texto>
              </View>
            )}
          </View>
        </Tarjeta>
      )))}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.md },
  flex: { flex: 1, gap: 2 },
  globo: {
    minWidth: 22, height: 22, borderRadius: RADIO.total, paddingHorizontal: 6,
    backgroundColor: COLORES.guinda, alignItems: 'center', justifyContent: 'center',
  },
});
