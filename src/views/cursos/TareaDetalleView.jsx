import React, { useLayoutEffect, useState } from 'react';
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
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import { avisarResultado } from '../../utils/dialogos';
import { formatearFechaHora } from '../../utils/fechas';
import { primerError, validarEnlace, validarTexto } from '../../utils/validaciones';
import { ESTADOS_TAREA, infoEstado } from '../../config/estados';
import { COLORES } from '../../config/tema';

/**
 * Contenido principal de la tarea una vez que sus datos están cargados.
 */
function ContenidoTareaDetalle({ tarea, navigation }) {
  const accion = useAccion();
  const [enlace, setEnlace] = useState(tarea.archivo_url || '');
  const [comentario, setComentario] = useState('');
  const [errorLocal, setErrorLocal] = useState(null);

  useLayoutEffect(() => {
    if (tarea?.titulo) {
      navigation.setOptions({ title: tarea.titulo });
    }
  }, [navigation, tarea?.titulo]);

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

/**
 * TareaDetalleView (estudiante): detalle de una tarea, su entrega y su calificación.
 * Admite ser abierta con el objeto completo `tarea` o solo con `idTarea` / `id` (deep linking o push).
 */
export default function TareaDetalleView({ navigation, route }) {
  const tareaParam = route.params?.tarea;
  const idTarea = route.params?.idTarea || route.params?.id || tareaParam?.id_tarea;

  const consulta = useConsulta(
    () => (!tareaParam && idTarea ? AcademicoRepository.tarea(idTarea) : null),
    [idTarea, tareaParam]
  );

  const tarea = tareaParam || consulta.datos?.tarea;

  if (!tarea) {
    return <Pantalla consulta={consulta} />;
  }

  return <ContenidoTareaDetalle tarea={tarea} navigation={navigation} />;
}
