import React, { useState } from 'react';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import { Aviso } from '../../components/Estados';
import useAccion from '../../viewmodels/useAccion';
import ConductaRepository from '../../repositories/conductaRepository';
import { avisarResultado } from '../../utils/dialogos';
import { primerError, validarTexto } from '../../utils/validaciones';

/**
 * SolicitarCitaView (estudiante): pide una cita de psicología con un motivo y la
 * disponibilidad. Funciona sin conexión.
 */
export default function SolicitarCitaView({ navigation }) {
  const accion = useAccion();
  const [motivo, setMotivo] = useState('');
  const [disponibilidad, setDisponibilidad] = useState('');
  const [errorLocal, setErrorLocal] = useState(null);

  const solicitar = async () => {
    const error = primerError(
      validarTexto(motivo, 'el motivo', { minimo: 5, maximo: 200 }),
      validarTexto(disponibilidad, 'la disponibilidad', { minimo: 0, maximo: 200 }),
    );
    setErrorLocal(error);
    if (error) return;

    const r = await accion.ejecutar(() => ConductaRepository.solicitarCita({
      motivo: motivo.trim(),
      disponibilidad: disponibilidad.trim() || null,
    }));
    if (r.ok) {
      avisarResultado(r.resultado, 'Tu solicitud fue enviada. Recibirás un aviso cuando se programe.');
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Menu');
      }
    }
  };

  return (
    <Pantalla>
      <Tarjeta>
        <Texto variante="pequeno">
          Cuéntanos brevemente el motivo. Solo el área de psicología verá tu solicitud.
        </Texto>
        {(errorLocal || accion.error) && <Aviso tono="error">{errorLocal || accion.error}</Aviso>}
        <Campo etiqueta="Motivo" valor={motivo} alCambiar={setMotivo} multilinea maxLength={200} />
        <Campo
          etiqueta="Disponibilidad (opcional)"
          valor={disponibilidad}
          alCambiar={setDisponibilidad}
          placeholder="Ej. martes o jueves por la mañana"
          maxLength={200}
        />
        <Boton titulo="Enviar solicitud" icono="paper-plane-outline" onPress={solicitar} cargando={accion.enviando} />
      </Tarjeta>
    </Pantalla>
  );
}
