// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Aula virtual · Tareas   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: Contenido principal de la tarea una vez que sus datos están cargados.
// Pantalla «TareaDetalle» (src/navigation/pantallas.js): pantalla de detalle, título «Tarea»
//   Se abre desde: PestanaTareas.jsx  con navigation.navigate('TareaDetalle', {...})
// Desde aquí se va a: Menu
//
// Datos (repositorio → endpoint → backend):
//   AcademicoRepository.entregarTarea() → POST /tareas/item/<int:id_tarea>/entregar (backend: tarea_routes.py →
//       entregar()) · sin conexión: queda en cola
//   AcademicoRepository.tarea() → GET /tareas/item/<int:id_tarea> (backend: tarea_routes.py → obtener())
// Botones / secciones: «Mi entrega»
// Campos: «Comentario (opcional)», «O pega un enlace (opcional si subiste un archivo)», «Sube tu trabajo»
// Validación local (antes de enviar): el enlace de tu trabajo; el comentario minimo: 0, maximo: 1000
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
import { BotonArchivo, SelectorArchivo } from '../../components/Archivos';
import useAccion from '../../viewmodels/useAccion';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import { avisarResultado } from '../../utils/dialogos';
import { formatearFechaHora } from '../../utils/fechas';
import { primerError, validarEnlace, validarTexto } from '../../utils/validaciones';
import { ESTADOS_TAREA, infoEstado } from '../../config/estados';
import { COLORES } from '../../config/tema';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Selector from '../../components/Selector';
import DialogoTexto from '../../components/DialogoTexto';
import Lista from '../../components/Lista';
import { ItemLista } from '../../components/Lista';
import { FilaDatos, Dato, Separador } from '../../components/Basicos';
import { Vacio, Cargando } from '../../components/Estados';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import ConductaRepository from '../../repositories/conductaRepository';
import MensajesRepository from '../../repositories/mensajesRepository';
import PerfilRepository from '../../repositories/perfilRepository';
import { useSesion } from '../../context/SesionContext';
import { confirmar, avisar } from '../../utils/dialogos';
import { formatearFecha, hoyISO, esFechaValida, sumarDias } from '../../utils/fechas';
import { ESTADOS_CITA, ESTADOS_REPORTE } from '../../config/estados';
import { ESPACIO, RADIO, SOMBRA } from '../../config/tema';
// <<< FIN KIT DE IMPORTS

/**
 * Contenido principal de la tarea una vez que sus datos están cargados.
 */
function ContenidoTareaDetalle({ tarea, navigation }) {
  // PISTA: acción de guardar/enviar: accion.ejecutar(() => Repo.metodo(...)) devuelve { ok, resultado };
  //     accion.enviando = cargando; accion.error = mensaje de la API.
  const accion = useAccion();
  const [archivo, setArchivo] = useState(null);       // archivo elegido para subir
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

  // Se entrega con un ARCHIVO y/o un ENLACE (al menos uno de los dos).
  // PISTA: entregar() se ejecuta al tocar el botón «Entregar».
  const entregar = async () => {
    const error = primerError(
      !archivo && !enlace.trim() ? 'Sube un archivo o pega el enlace de tu trabajo.' : null,
      validarEnlace(enlace, 'el enlace de tu trabajo'),
      validarTexto(comentario, 'el comentario', { minimo: 0, maximo: 1000 }),
    );
    setErrorLocal(error);
    if (error) return;

    const r = await accion.ejecutar(() => AcademicoRepository.entregarTarea(
      tarea.id_tarea,
      { archivo_url: enlace.trim() || null, comentario: comentario.trim() || null },
      `Entrega: ${tarea.titulo}`,
      archivo,
    ));
    if (r.ok) {
      avisarResultado(r.resultado, yaEntrego ? 'Tu entrega fue reemplazada.' : 'Tu tarea fue entregada.');
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
        <Etiqueta texto={estado.texto} tono={estado.tono} />
        <Texto variante="subtitulo">{tarea.titulo}</Texto>
        {tarea.descripcion && <Texto>{tarea.descripcion}</Texto>}
        <Fila rotulo="Fecha de entrega" valor={formatearFechaHora(tarea.fecha_entrega)} />
        <Fila rotulo="Bimestre" valor={`${tarea.bimestre}°`} />
        <BotonArchivo archivo={tarea.adjunto} texto="Enunciado" />
        <BotonEnlace texto="Ver enunciado" icono="document-attach-outline" url={tarea.archivo_adjunto_url} />
      </Tarjeta>

      {yaEntrego && (
        <>
          <Seccion titulo="Mi entrega" />
          <Tarjeta colorBorde={calificada ? COLORES.exito : COLORES.azul}>
            <Fila rotulo="Enviada" valor={formatearFechaHora(tarea.fecha_envio)} />
            {tarea.fuera_de_plazo && <Etiqueta texto="Fuera de plazo" tono="alerta" />}
            <BotonArchivo archivo={tarea.archivo} />
            <BotonEnlace texto="Abrir mi enlace" url={tarea.archivo_url} />
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
            {yaEntrego && (
              <Texto variante="pequeno">Tu nueva entrega reemplaza a la anterior (archivo y enlace).</Texto>
            )}
            <SelectorArchivo archivo={archivo} alCambiar={setArchivo} etiqueta="Sube tu trabajo" />
            <Campo
              etiqueta="O pega un enlace (opcional si subiste un archivo)"
              valor={enlace}
              alCambiar={setEnlace}
              placeholder="https://drive.google.com/..."
              autoCapitalize="none"
              keyboardType="url"
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

  // PISTA: datos que se cargan al abrir la pantalla (useConsulta): .datos, .cargando, .error, .recargar().
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
