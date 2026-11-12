import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import { Seccion } from '../../components/Basicos';
import useConsulta from '../../viewmodels/useConsulta';
import ConductaRepository from '../../repositories/conductaRepository';
import { formatearFecha, hoyISO, nombreDia, soloHora, sumarDias } from '../../utils/fechas';
import { ESTADOS_CITA, infoEstado } from '../../config/estados';
import { COLORES, ESPACIO, RADIO } from '../../config/tema';

/**
 * AgendaView (psicólogo): citas de un día (por defecto hoy) y las solicitudes que aún
 * no tienen fecha. Al tocar una se abre el detalle para programarla, atenderla o
 * cancelarla.
 */
export default function AgendaView({ navigation }) {
  const [fecha, setFecha] = useState(hoyISO());
  const agenda = useConsulta(() => ConductaRepository.agenda(fecha), [fecha]);
  const abrir = (cita) => navigation.navigate('CitaDetalle', { cita, titulo: cita.alumno });

  return (
    <Pantalla consulta={agenda}>
      {(datos) => (
        <>
          {/* Cambiar de día */}
          <View style={estilos.fecha}>
            <Pressable onPress={() => setFecha(sumarDias(fecha, -1))} style={estilos.flecha} accessibilityLabel="Día anterior">
              <Ionicons name="chevron-back" size={22} color={COLORES.azul} />
            </Pressable>
            <Pressable onPress={() => setFecha(hoyISO())} style={estilos.centro} accessibilityLabel="Volver a hoy">
              <Texto negrita>{nombreDia(fecha)}, {formatearFecha(fecha)}</Texto>
              <Texto variante="diminuto">{fecha === hoyISO() ? 'Hoy' : 'Toca para volver a hoy'}</Texto>
            </Pressable>
            <Pressable onPress={() => setFecha(sumarDias(fecha, 1))} style={estilos.flecha} accessibilityLabel="Día siguiente">
              <Ionicons name="chevron-forward" size={22} color={COLORES.azul} />
            </Pressable>
          </View>

          <Seccion titulo={`Citas del día (${datos.citas.length})`} />
          {datos.citas.length === 0 && <Texto variante="pequeno">No hay citas este día.</Texto>}
          {datos.citas.map((c) => {
            const estado = infoEstado(ESTADOS_CITA, c.estado);
            return (
              <Tarjeta key={c.id_cita} colorBorde={COLORES.azul} onPress={() => abrir(c)}>
                <View style={estilos.fila}>
                  <Texto variante="subtitulo" color={COLORES.azul}>{soloHora(c.fecha_cita)}</Texto>
                  <Texto negrita style={estilos.flex}>{c.alumno}</Texto>
                  <Etiqueta texto={estado.texto} tono={estado.tono} />
                </View>
                <Texto variante="pequeno">{c.motivo}</Texto>
              </Tarjeta>
            );
          })}

          <Seccion titulo={`Solicitudes por programar (${datos.pendientes.length})`} />
          {datos.pendientes.length === 0 && <Texto variante="pequeno">No hay solicitudes pendientes.</Texto>}
          {datos.pendientes.map((c) => (
            <Tarjeta key={c.id_cita} colorBorde={COLORES.alerta} onPress={() => abrir(c)}>
              <Texto negrita>{c.alumno}</Texto>
              <Texto variante="pequeno">{c.motivo}</Texto>
              <Texto variante="diminuto">
                Solicitada el {formatearFecha(c.fecha_solicitud)}
                {c.disponibilidad ? ` · ${c.disponibilidad}` : ''}
              </Texto>
            </Tarjeta>
          ))}
        </>
      )}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fecha: {
    flexDirection: 'row', alignItems: 'center', marginBottom: ESPACIO.sm,
    backgroundColor: COLORES.superficie, borderRadius: RADIO.md, borderWidth: 1, borderColor: COLORES.borde,
  },
  flecha: { padding: ESPACIO.md },
  centro: { flex: 1, alignItems: 'center' },
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.sm },
  flex: { flex: 1 },
});
