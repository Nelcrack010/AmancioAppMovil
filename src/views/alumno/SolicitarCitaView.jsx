// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Citas de psicología   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: SolicitarCitaView (estudiante): pide una cita de psicología con un motivo y la disponibilidad.
//     Funciona sin conexión.
// Pantalla «SolicitarCita» (src/navigation/pantallas.js): pantalla de detalle, título «Solicitar cita»
//   Se abre desde: MisCitasView.jsx  con navigation.navigate('SolicitarCita', {...})
// Desde aquí se va a: Menu
//
// Datos (repositorio → endpoint → backend):
//   ConductaRepository.solicitarCita() → POST /citas (backend: cita_routes.py → solicitar()) · sin conexión:
//       queda en cola
// Botones / secciones: «Enviar solicitud»
// Campos: «Disponibilidad (opcional)», «Motivo»
// Validación local (antes de enviar): el motivo minimo: 5, maximo: 200; la disponibilidad minimo: 0, maximo: 200
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
  // PISTA: acción de guardar/enviar: accion.ejecutar(() => Repo.metodo(...)) devuelve { ok, resultado };
  //     accion.enviando = cargando; accion.error = mensaje de la API.
  const accion = useAccion();
  const [motivo, setMotivo] = useState('');
  const [disponibilidad, setDisponibilidad] = useState('');
  const [errorLocal, setErrorLocal] = useState(null);

  // PISTA: solicitar() se ejecuta al tocar el botón «Enviar solicitud».
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

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
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
