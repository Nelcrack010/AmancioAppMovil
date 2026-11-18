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
  const accion = useAccion();
  const [nota, setNota] = useState('');
  const [observacion, setObservacion] = useState('');
  const [errorLocal, setErrorLocal] = useState(null);

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
