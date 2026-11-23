// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Aula virtual · Tareas   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: CalificarEntregaView (docente): pone la nota (0 a 20) y una observación a una entrega. Una entrega se
//     califica una sola vez (regla del servidor). El estudiante recibe un aviso.
// Pantalla «CalificarEntrega» (src/navigation/pantallas.js): pantalla de detalle, título «Calificar entrega»
//   Se abre desde: EntregasView.jsx  con navigation.navigate('CalificarEntrega', {...})
// Desde aquí se va a: Menu
//
// Datos (repositorio → endpoint → backend):
//   AcademicoRepository.calificarEntrega() → PATCH /tareas/entregas/<int:id_entrega>/calificar (backend:
//       tarea_routes.py → calificar())
// Botones / secciones: «Guardar calificación»
// Campos: «Nota (0 a 20)», «Observación (opcional)»
// Validación local (antes de enviar): la observación minimo: 0, maximo: 1000
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
import { Fila } from '../../components/Basicos';
import { Aviso } from '../../components/Estados';
import { BotonEnlace } from '../../components/Items';
import { BotonArchivo } from '../../components/Archivos';
import useAccion from '../../viewmodels/useAccion';
import AcademicoRepository from '../../repositories/academicoRepository';
import { avisar } from '../../utils/dialogos';
import { formatearFechaHora } from '../../utils/fechas';
import { aNumero, primerError, validarNota, validarTexto } from '../../utils/validaciones';

/**
 * CalificarEntregaView (docente): pone la nota (0 a 20) y una observación a una entrega.
 * Una entrega se califica una sola vez (regla del servidor). El estudiante recibe un aviso.
 * params: { alumno, tarea }
 */
export default function CalificarEntregaView({ navigation, route }) {
  const { alumno, tarea } = route.params;
  // PISTA: acción de guardar/enviar: accion.ejecutar(() => Repo.metodo(...)) devuelve { ok, resultado };
  //     accion.enviando = cargando; accion.error = mensaje de la API.
  const accion = useAccion();
  const [nota, setNota] = useState('');
  const [observacion, setObservacion] = useState('');
  const [errorLocal, setErrorLocal] = useState(null);

  // PISTA: calificar() se ejecuta al tocar el botón «Guardar calificación».
  const calificar = async () => {
    const error = primerError(
      validarNota(nota),
      validarTexto(observacion, 'la observación', { minimo: 0, maximo: 1000 }),
    );
    setErrorLocal(error);
    if (error) return;

    const r = await accion.ejecutar(() => AcademicoRepository.calificarEntrega(alumno.id_entrega, {
      calificacion: aNumero(nota),
      observacion: observacion.trim() || null,
    }));
    if (r.ok) {
      avisar('Entrega calificada', `${alumno.nombres} recibirá un aviso con su nota.`);
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
        <Texto variante="subtitulo">{alumno.apellidos}, {alumno.nombres}</Texto>
        <Texto variante="pequeno">{tarea.titulo}</Texto>
        <Fila rotulo="Enviada" valor={formatearFechaHora(alumno.fecha_envio)} />
        {alumno.fuera_de_plazo && <Aviso tono="alerta">Entregada fuera de plazo.</Aviso>}
        {alumno.comentario_alumno && <Aviso tono="info" icono="chatbox-ellipses">{alumno.comentario_alumno}</Aviso>}
        <BotonArchivo archivo={alumno.archivo} />
        <BotonEnlace texto="Abrir el enlace del trabajo" url={alumno.archivo_url} />
      </Tarjeta>

      <Tarjeta>
        {(errorLocal || accion.error) && <Aviso tono="error">{errorLocal || accion.error}</Aviso>}
        <Campo etiqueta="Nota (0 a 20)" valor={nota} alCambiar={setNota} keyboardType="decimal-pad" maxLength={5} />
        <Campo etiqueta="Observación (opcional)" valor={observacion} alCambiar={setObservacion} multilinea />
        <Boton titulo="Guardar calificación" icono="checkmark-circle-outline" onPress={calificar} cargando={accion.enviando} />
      </Tarjeta>
    </Pantalla>
  );
}
