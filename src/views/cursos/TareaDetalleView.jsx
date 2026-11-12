import React, { useState } from 'react';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import { Fila, Seccion } from '../../components/Basicos';
import { Aviso } from '../../components/Estados';
import { BotonEnlace } from '../../components/Items';
import useAccion from '../../viewmodels/useAccion';
import AcademicoRepository from '../../repositories/academicoRepository';
import { avisarResultado } from '../../utils/dialogos';
import { formatearFechaHora } from '../../utils/fechas';
import { primerError, validarEnlace, validarTexto } from '../../utils/validaciones';
import { ESTADOS_TAREA, infoEstado } from '../../config/estados';
import { COLORES } from '../../config/tema';

/**
 * TareaDetalleView (estudiante): detalle de una tarea, su entrega y su calificación.
 *
 * La entrega es un ENLACE al trabajo (Drive, OneDrive, YouTube...), que es lo que acepta
 * la API actual. Se puede reenviar mientras no esté calificada. Funciona sin conexión:
 * la entrega queda pendiente y se envía sola al volver la red.
 *
 * params: { tarea, idCarga }
 */
export default function TareaDetalleView({ navigation, route }) {
  const { tarea } = route.params;
  const accion = useAccion();
  const [enlace, setEnlace] = useState(tarea.archivo_url || '');
  const [comentario, setComentario] = useState('');
  const [errorLocal, setErrorLocal] = useState(null);

  const estado = infoEstado(ESTADOS_TAREA, tarea.estado);
  const calificada = tarea.estado === 'CALIFICADA';
  const yaEntrego = Boolean(tarea.id_entrega);

  const entregar = async () => {
    const error = primerError(
      validarEnlace(enlace, 'el enlace de tu trabajo', { requerido: true }),
      validarTexto(comentario, 'el comentario', { minimo: 0, maximo: 1000 }),
    );
    setErrorLocal(error);
    if (error) return;

    const r = await accion.ejecutar(() => AcademicoRepository.entregarTarea(
      tarea.id_tarea,
      { archivo_url: enlace.trim(), comentario: comentario.trim() || null },
      `Entrega: ${tarea.titulo}`,
    ));
    if (r.ok) {
      avisarResultado(r.resultado, yaEntrego ? 'Tu entrega fue reemplazada.' : 'Tu tarea fue entregada.');
      navigation.goBack();
    }
  };

  return (
    <Pantalla>
      <Tarjeta>
        <Etiqueta texto={estado.texto} tono={estado.tono} />
        <Texto variante="subtitulo">{tarea.titulo}</Texto>
        {tarea.descripcion && <Texto>{tarea.descripcion}</Texto>}
        <Fila rotulo="Fecha de entrega" valor={formatearFechaHora(tarea.fecha_entrega)} />
        <Fila rotulo="Bimestre" valor={`${tarea.bimestre}°`} />
        <BotonEnlace texto="Ver enunciado" icono="document-attach-outline" url={tarea.archivo_adjunto_url} />
      </Tarjeta>

      {yaEntrego && (
        <>
          <Seccion titulo="Mi entrega" />
          <Tarjeta colorBorde={calificada ? COLORES.exito : COLORES.azul}>
            <Fila rotulo="Enviada" valor={formatearFechaHora(tarea.fecha_envio)} />
            {tarea.fuera_de_plazo && <Etiqueta texto="Fuera de plazo" tono="alerta" />}
            <BotonEnlace texto="Abrir mi trabajo" url={tarea.archivo_url} />
            {calificada && (
              <>
                <Fila rotulo="Calificación" valor={`${tarea.calificacion} / 20`} />
                {tarea.retroalimentacion_docente && (
                  <Aviso tono="info" icono="chatbox-ellipses">{tarea.retroalimentacion_docente}</Aviso>
                )}
              </>
            )}
          </Tarjeta>
        </>
      )}

      {!calificada && (
        <>
          <Seccion titulo={yaEntrego ? 'Reemplazar entrega' : 'Entregar tarea'} />
          <Tarjeta>
            {(errorLocal || accion.error) && <Aviso tono="error">{errorLocal || accion.error}</Aviso>}
            <Campo
              etiqueta="Enlace de tu trabajo"
              valor={enlace}
              alCambiar={setEnlace}
              placeholder="https://drive.google.com/..."
              autoCapitalize="none"
              keyboardType="url"
              ayuda="Sube tu archivo a Drive (o similar) y pega aquí el enlace compartido."
            />
            <Campo etiqueta="Comentario (opcional)" valor={comentario} alCambiar={setComentario} multilinea />
            <Boton
              titulo={yaEntrego ? 'Reemplazar entrega' : 'Entregar'}
              icono="cloud-upload-outline"
              onPress={entregar}
              cargando={accion.enviando}
            />
          </Tarjeta>
        </>
      )}
    </Pantalla>
  );
}
