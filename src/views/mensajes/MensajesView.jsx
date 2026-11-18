import React from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Texto from '../../components/Texto';
import Boton from '../../components/Boton';
import Lista, { ItemLista } from '../../components/Lista';
import { Avatar } from '../../components/Basicos';
import { Vacio } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import MensajesRepository from '../../repositories/mensajesRepository';
import { formatearFecha, hoyISO, soloHora } from '../../utils/fechas';
import { NOMBRES_ROL } from '../../config/estados';
import { TIEMPO_REAL } from '../../config/tiempoReal';
import { COLORES, ESPACIO, RADIO } from '../../config/tema';

/**
 * MensajesView: conversaciones del usuario con el último mensaje y los no leídos.
 * El botón "Nuevo mensaje" abre la lista de contactos permitidos para el rol.
 */
export default function MensajesView({ navigation }) {
  // Tiempo real: la lista se actualiza sola (último mensaje y globos de no leídos).
  const conversaciones = useConsulta(() => MensajesRepository.conversaciones(), [], {
    actualizarCada: TIEMPO_REAL.CONVERSACIONES_MS,
    tiposPush: ['MENSAJE'],
  });

  return (
    <Pantalla
      consulta={conversaciones}
      pie={<Boton titulo="Nuevo mensaje" icono="create-outline" onPress={() => navigation.navigate('Contactos')} />}
    >
      {(lista) => (lista.length === 0 ? (
        <Vacio icono="chatbubbles-outline" titulo="Sin conversaciones" mensaje="Escribe a un docente, auxiliar o a psicología." />
      ) : (
        <Lista>
          {lista.map((c) => (
            <ItemLista
              key={c.id_conversacion}
              izquierda={<Avatar nombre={c.contacto} tamano={42} />}
              titulo={c.contacto}
              subtitulo={c.ultimo_mensaje}
              detalle={NOMBRES_ROL[c.rol_contacto]}
              resaltado={c.no_leidos > 0}
              derecha={<HoraYGlobo fecha={c.fecha_actualizacion} noLeidos={c.no_leidos} />}
              onPress={() => navigation.navigate('Chat', { idConversacion: c.id_conversacion, titulo: c.contacto })}
            />
          ))}
        </Lista>
      ))}
    </Pantalla>
  );
}

/** A la derecha de cada conversación: la hora (o la fecha) y el globo de no leídos. */
function HoraYGlobo({ fecha, noLeidos }) {
  const esHoy = fecha?.slice(0, 10) === hoyISO();
  return (
    <View style={estilos.derecha}>
      <Texto variante="diminuto" color={noLeidos > 0 ? COLORES.guinda : COLORES.textoSuave}>
        {esHoy ? soloHora(fecha) : formatearFecha(fecha).replace(/ \d{4}$/, '')}
      </Texto>
      {noLeidos > 0 && (
        <View style={estilos.globo}>
          <Texto variante="diminuto" negrita color={COLORES.blanco}>{noLeidos}</Texto>
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  derecha: { alignItems: 'flex-end', gap: ESPACIO.xs },
  globo: {
    minWidth: 20, height: 20, borderRadius: RADIO.total, paddingHorizontal: 6,
    backgroundColor: COLORES.guinda, alignItems: 'center', justifyContent: 'center',
  },
});
