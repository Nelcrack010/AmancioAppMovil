import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Pantalla from '../../components/Pantalla';
import Lista, { ItemLista } from '../../components/Lista';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import { Seccion } from '../../components/Basicos';
import useConsulta from '../../viewmodels/useConsulta';
import ConductaRepository from '../../repositories/conductaRepository';
import { formatearFecha, hoyISO, nombreDia, soloHora, sumarDias } from '../../utils/fechas';
import { ESTADOS_CITA, infoEstado } from '../../config/estados';
import { COLORES, ESPACIO, RADIO, SOMBRA } from '../../config/tema';

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
          <Lista>
            {datos.citas.map((c) => {
              const estado = infoEstado(ESTADOS_CITA, c.estado);
              return (
                <ItemLista
                  key={c.id_cita}
                  izquierda={<Texto variante="subtitulo" color={COLORES.azul}>{soloHora(c.fecha_cita)}</Texto>}
                  titulo={c.alumno}
                  subtitulo={c.motivo}
                  derecha={<Etiqueta texto={estado.texto} tono={estado.tono} />}
                  onPress={() => abrir(c)}
                />
              );
            })}
          </Lista>

          <Seccion titulo={`Solicitudes por programar (${datos.pendientes.length})`} />
          {datos.pendientes.length === 0 && <Texto variante="pequeno">No hay solicitudes pendientes.</Texto>}
          <Lista>
            {datos.pendientes.map((c) => (
              <ItemLista
                key={c.id_cita}
                icono="time"
                colorIcono={COLORES.alerta}
                fondoIcono={COLORES.alertaFondo}
                titulo={c.alumno}
                subtitulo={c.motivo}
                detalle={`Solicitada el ${formatearFecha(c.fecha_solicitud)}${c.disponibilidad ? ` · ${c.disponibilidad}` : ''}`}
                onPress={() => abrir(c)}
              />
            ))}
          </Lista>
        </>
      )}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fecha: {
    flexDirection: 'row', alignItems: 'center', marginBottom: ESPACIO.sm,
    backgroundColor: COLORES.superficie, borderRadius: RADIO.lg, ...SOMBRA,
  },
  flecha: { padding: ESPACIO.md },
  centro: { flex: 1, alignItems: 'center' },
});
