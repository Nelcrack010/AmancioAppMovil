// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Citas de psicología   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: CitaDetalleView (psicólogo): gestiona una cita. - PENDIENTE o PROGRAMADA: programar / reprogramar
//     (fecha y hora futuras) o cancelar. - PROGRAMADA: marcar como atendida con la observación (reservada). El
//     estudiante recibe un aviso cuando su cita se programa, reprograma o cancela.
// Pantalla «CitaDetalle» (src/navigation/pantallas.js): pantalla de detalle, título «Cita»
//   Se abre desde: InicioPsicologo.jsx, AgendaView.jsx  con navigation.navigate('CitaDetalle', {...})
// Desde aquí se va a: ConductaAlumno, HistorialAlumno, Menu
//
// Datos (repositorio → endpoint → backend):
//   ConductaRepository.cancelarCita() → PATCH /citas/<int:id_cita>/cancelar (backend: cita_routes.py →
//       cancelar())
//   ConductaRepository.completarCita() → PATCH /citas/<int:id_cita>/completar (backend: cita_routes.py →
//       completar())
//   ConductaRepository.programarCita() → PATCH /citas/<int:id_cita>/programar (backend: cita_routes.py →
//       programar())
// Botones / secciones: «Cancelar cita», «Estado de conducta», «Historial de citas», «Marcar como atendida»,
//     «Registrar atención»
// Campos: «Fecha», «Hora», «Motivo de la cancelación», «Observación»
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
  // PISTA: acción de guardar/enviar: accion.ejecutar(() => Repo.metodo(...)) devuelve { ok, resultado };
  //     accion.enviando = cargando; accion.error = mensaje de la API.
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
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Menu');
    }
  };

  // PISTA: programar() se ejecuta al tocar el botón «Programar cita».
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

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
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

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  botones: { gap: ESPACIO.sm, marginBottom: ESPACIO.md },
  fila: { flexDirection: 'row', gap: ESPACIO.sm },
  flex: { flex: 1 },
  hora: { width: 100 },
});
