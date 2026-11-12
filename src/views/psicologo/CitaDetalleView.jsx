import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import DialogoTexto from '../../components/DialogoTexto';
import { Fila, Seccion } from '../../components/Basicos';
import { Aviso } from '../../components/Estados';
import useAccion from '../../viewmodels/useAccion';
import ConductaRepository from '../../repositories/conductaRepository';
import { avisar } from '../../utils/dialogos';
import {
  esFechaValida, esHoraValida, formatearFecha, formatearFechaHora, hoyISO, sumarDias, unirFechaHora,
} from '../../utils/fechas';
import { ESTADOS_CITA, infoEstado } from '../../config/estados';
import { ESPACIO } from '../../config/tema';

/**
 * CitaDetalleView (psicólogo): gestiona una cita.
 *   - PENDIENTE o PROGRAMADA: programar / reprogramar (fecha y hora futuras) o cancelar.
 *   - PROGRAMADA: marcar como atendida con la observación (reservada).
 * El estudiante recibe un aviso cuando su cita se programa, reprograma o cancela.
 * params: { cita }
 */
export default function CitaDetalleView({ navigation, route }) {
  const { cita } = route.params;
  const accion = useAccion();
  const [fecha, setFecha] = useState(cita.fecha_cita ? cita.fecha_cita.slice(0, 10) : sumarDias(hoyISO(), 1));
  const [hora, setHora] = useState(cita.fecha_cita ? cita.fecha_cita.slice(11, 16) : '10:00');
  const [errorLocal, setErrorLocal] = useState(null);
  const [dialogo, setDialogo] = useState(null);   // 'completar' | 'cancelar' | null

  const estado = infoEstado(ESTADOS_CITA, cita.estado);
  const activa = cita.estado === 'PENDIENTE' || cita.estado === 'PROGRAMADA';

  /** Ejecuta una acción, avisa y vuelve a la agenda. */
  const terminar = (mensaje) => {
    avisar('Listo', mensaje);
    navigation.goBack();
  };

  const programar = async () => {
    const error = !esFechaValida(fecha) ? 'La fecha debe tener el formato AAAA-MM-DD.'
      : !esHoraValida(hora) ? 'La hora debe tener el formato HH:MM (24 horas).' : null;
    setErrorLocal(error);
    if (error) return;
    const r = await accion.ejecutar(() => ConductaRepository.programarCita(cita.id_cita, unirFechaHora(fecha, hora)));
    if (r.ok) terminar(r.resultado.message || 'Cita programada.');
  };

  /** Para el diálogo de texto: devuelve el mensaje de error o null si salió bien. */
  const conTexto = (accionApi, mensajeOk) => async (texto) => {
    try {
      await accionApi(cita.id_cita, texto);
      setDialogo(null);
      terminar(mensajeOk);
      return null;
    } catch (e) {
      return e.message;
    }
  };

  return (
    <>
      <Pantalla>
        <Tarjeta>
          <Etiqueta texto={estado.texto} tono={estado.tono} />
          <Texto variante="subtitulo">{cita.alumno}</Texto>
          <Texto>{cita.motivo}</Texto>
          <Fila rotulo="Solicitada" valor={formatearFecha(cita.fecha_solicitud)} />
          {cita.disponibilidad && <Fila rotulo="Disponibilidad" valor={cita.disponibilidad} />}
          {cita.fecha_cita && <Fila rotulo="Fecha de la cita" valor={formatearFechaHora(cita.fecha_cita)} />}
          {cita.observacion && <Aviso tono="info" icono="lock-closed">{cita.observacion}</Aviso>}
        </Tarjeta>

        <View style={estilos.botones}>
          <Boton titulo="Estado de conducta" icono="shield-checkmark-outline" variante="secundario" pequeno
            onPress={() => navigation.navigate('ConductaAlumno', { idAlumno: cita.id_alumno, titulo: cita.alumno })} />
          <Boton titulo="Historial de citas" icono="time-outline" variante="secundario" pequeno
            onPress={() => navigation.navigate('HistorialAlumno', { idAlumno: cita.id_alumno, titulo: cita.alumno })} />
        </View>

        {activa && (
          <>
            <Seccion titulo={cita.estado === 'PROGRAMADA' ? 'Reprogramar' : 'Programar'} />
            <Tarjeta>
              {(errorLocal || accion.error) && <Aviso tono="error">{errorLocal || accion.error}</Aviso>}
              <View style={estilos.fila}>
                <Campo style={estilos.flex} etiqueta="Fecha" valor={fecha} alCambiar={setFecha} placeholder="AAAA-MM-DD" maxLength={10} />
                <Campo style={estilos.hora} etiqueta="Hora" valor={hora} alCambiar={setHora} placeholder="HH:MM" maxLength={5} />
              </View>
              <Boton
                titulo={cita.estado === 'PROGRAMADA' ? 'Reprogramar cita' : 'Programar cita'}
                icono="calendar-outline"
                onPress={programar}
                cargando={accion.enviando}
              />
            </Tarjeta>

            <View style={estilos.botones}>
              {cita.estado === 'PROGRAMADA' && (
                <Boton titulo="Marcar como atendida" icono="checkmark-circle-outline" variante="guinda"
                  onPress={() => setDialogo('completar')} />
              )}
              <Boton titulo="Cancelar cita" icono="close-circle-outline" variante="peligro" onPress={() => setDialogo('cancelar')} />
            </View>
          </>
        )}
      </Pantalla>

      <DialogoTexto
        visible={dialogo === 'completar'}
        titulo="Registrar atención"
        mensaje="La observación es reservada: solo la ve psicología."
        etiqueta="Observación"
        minimo={3}
        maximo={2000}
        textoAceptar="Guardar"
        alAceptar={conTexto(ConductaRepository.completarCita, 'La cita quedó como atendida.')}
        alCerrar={() => setDialogo(null)}
      />
      <DialogoTexto
        visible={dialogo === 'cancelar'}
        titulo="Cancelar cita"
        mensaje="El estudiante recibirá un aviso con el motivo."
        etiqueta="Motivo de la cancelación"
        minimo={5}
        textoAceptar="Cancelar cita"
        peligroso
        alAceptar={conTexto(ConductaRepository.cancelarCita, 'La cita fue cancelada.')}
        alCerrar={() => setDialogo(null)}
      />
    </>
  );
}

const estilos = StyleSheet.create({
  botones: { gap: ESPACIO.sm, marginBottom: ESPACIO.md },
  fila: { flexDirection: 'row', gap: ESPACIO.sm },
  flex: { flex: 1 },
  hora: { width: 100 },
});
