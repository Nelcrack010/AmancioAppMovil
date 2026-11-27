// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Académico (año y secciones), Aula virtual · Clases virtuales, Aula virtual · Materiales, Aula virtual
//     · Tareas   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: PublicarView (docente): un solo formulario para publicar o editar - una tarea          (tipo 'tarea':
//     título, descripción, fecha de entrega, bimestre, enunciado) - un material        (tipo 'material': título,
//     descripción, enlace, bimestre) - una clase virtual  (tipo 'clase':    tema, fecha y hora, enlace)
// Pantalla «Publicar» (src/navigation/pantallas.js): pantalla de detalle, título «Publicar»
//   Se abre desde: PestanaClases.jsx, PestanaMateriales.jsx, PestanaTareas.jsx  con
//       navigation.navigate('Publicar', {...})
// Desde aquí se va a: Menu
//
// Datos (repositorio → endpoint → backend):
//   AcademicoRepository.anioActivo() → GET /academico/anio-activo (backend: academico_routes.py → anio_activo())
//   AcademicoRepository.crearClase() → POST /clases/<int:id_carga> (backend: clase_routes.py → crear())
//   AcademicoRepository.editarClase() → PUT /clases/item/<int:id_clase> (backend: clase_routes.py → editar())
//   AcademicoRepository.editarMaterial() → PUT /material/item/<int:id_material> (backend: material_routes.py →
//       editar())
//   AcademicoRepository.publicarMaterial() → POST /material/<int:id_carga> (backend: material_routes.py →
//       publicar())
//   AcademicoRepository.publicarTarea() → POST /tareas/<int:id_carga> (backend: tarea_routes.py → publicar())
// Campos: «Archivo del enunciado (opcional)», «Descripción (opcional)», «Hora»
// Validación local (antes de enviar): el tema minimo: 0, maximo: 150; el título minimo: 3, maximo: 150; la
//     descripción minimo: 0, maximo: 2000; el enlace requerido: tipo === 'clase'
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
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import Selector from '../../components/Selector';
import { Aviso } from '../../components/Estados';
import { SelectorArchivo } from '../../components/Archivos';
import useAccion from '../../viewmodels/useAccion';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import { avisar } from '../../utils/dialogos';
import {
  bimestreActual, esFechaValida, esHoraValida, hoyISO, sumarDias, unirFechaHora,
} from '../../utils/fechas';
import { primerError, validarEnlace, validarTexto } from '../../utils/validaciones';
import { ESPACIO } from '../../config/tema';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useCallback, useMemo } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Etiqueta from '../../components/Etiqueta';
import DialogoTexto from '../../components/DialogoTexto';
import Lista from '../../components/Lista';
import { ItemLista } from '../../components/Lista';
import { Seccion, Fila, FilaDatos, Dato, Separador } from '../../components/Basicos';
import { Vacio, Cargando } from '../../components/Estados';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import ConductaRepository from '../../repositories/conductaRepository';
import MensajesRepository from '../../repositories/mensajesRepository';
import PerfilRepository from '../../repositories/perfilRepository';
import { useSesion } from '../../context/SesionContext';
import { confirmar, avisarResultado } from '../../utils/dialogos';
import { formatearFecha, formatearFechaHora } from '../../utils/fechas';
import { infoEstado, ESTADOS_CITA, ESTADOS_TAREA, ESTADOS_REPORTE } from '../../config/estados';
import { COLORES, RADIO, SOMBRA } from '../../config/tema';
// <<< FIN KIT DE IMPORTS

const BIMESTRES = [1, 2, 3, 4].map((n) => ({ valor: n, texto: `${n}° bimestre` }));

/**
 * PublicarView (docente): un solo formulario para publicar o editar
 *   - una tarea          (tipo 'tarea':    título, descripción, fecha de entrega, bimestre, enunciado)
 *   - un material        (tipo 'material': título, descripción, enlace, bimestre)
 *   - una clase virtual  (tipo 'clase':    tema, fecha y hora, enlace)
 *
 * params: { tipo, idCarga, item? }  (con `item` se edita en lugar de crear)
 */
export default function PublicarView({ navigation, route }) {
  const { tipo, idCarga, item } = route.params;
  const editando = Boolean(item);
  // PISTA: acción de guardar/enviar: accion.ejecutar(() => Repo.metodo(...)) devuelve { ok, resultado };
  //     accion.enviando = cargando; accion.error = mensaje de la API.
  const accion = useAccion();
  // PISTA: «anio» = datos que se cargan al abrir la pantalla: AcademicoRepository.anioActivo() → GET
  //     /academico/anio-activo (backend: academico_routes.py → anio_activo()). Úsalos con anio.datos;
  //     anio.recargar() vuelve a pedirlos.
  const anio = useConsulta(() => AcademicoRepository.anioActivo(), []);

  // Valores iniciales: los del elemento que se edita o valores por defecto.
  const fechaItem = item?.fecha || item?.fecha_entrega;
  const [titulo, setTitulo] = useState(item?.titulo || item?.tema || '');
  const [descripcion, setDescripcion] = useState(item?.descripcion || '');
  const [enlace, setEnlace] = useState(item?.archivo_url || item?.enlace || '');
  const [fecha, setFecha] = useState(fechaItem ? fechaItem.slice(0, 10) : sumarDias(hoyISO(), 7));
  const [hora, setHora] = useState(fechaItem ? fechaItem.slice(11, 16) : (tipo === 'tarea' ? '23:59' : '16:00'));
  const [bimestre, setBimestre] = useState(item?.bimestre || null);
  const [archivo, setArchivo] = useState(null);     // enunciado de la tarea (PDF, Word...)
  const [errorLocal, setErrorLocal] = useState(null);

  // Por defecto, el bimestre en curso según las fechas del año escolar.
  useEffect(() => {
    if (!bimestre && anio.datos) setBimestre(bimestreActual(anio.datos.bimestres));
  }, [anio.datos, bimestre]);

  const usaFecha = tipo !== 'material';
  const usaBimestre = tipo !== 'clase';

  // PISTA: guardar() se ejecuta al tocar el botón «}           icono={editando ? ».
  const guardar = async () => {
    const error = primerError(
      tipo === 'clase'
        ? validarTexto(titulo, 'el tema', { minimo: 0, maximo: 150 })
        : validarTexto(titulo, 'el título', { minimo: 3, maximo: 150 }),
      tipo !== 'clase' ? validarTexto(descripcion, 'la descripción', { minimo: 0, maximo: 2000 }) : null,
      validarEnlace(enlace, 'el enlace', { requerido: tipo === 'clase' }),
      usaFecha && !esFechaValida(fecha) ? 'La fecha debe tener el formato AAAA-MM-DD.' : null,
      usaFecha && !esHoraValida(hora) ? 'La hora debe tener el formato HH:MM (24 horas).' : null,
      usaBimestre && !bimestre ? 'Elige el bimestre.' : null,
    );
    setErrorLocal(error);
    if (error) return;

    const r = await accion.ejecutar(() => enviar());
    if (r.ok) {
      avisar('Listo', editando ? 'Los cambios se guardaron.' : 'Se publicó correctamente. Los estudiantes recibirán un aviso.');
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Menu');
      }
    }
  };

  /** Arma los datos y llama a la acción del repositorio que corresponde. */
  const enviar = () => {
    const url = enlace.trim() || null;
    if (tipo === 'tarea') {
      return AcademicoRepository.publicarTarea(idCarga, {
        titulo: titulo.trim(), descripcion: descripcion.trim() || null,
        fecha_entrega: unirFechaHora(fecha, hora), bimestre, archivo_url: url,
      }, archivo);
    }
    if (tipo === 'material') {
      const datos = { titulo: titulo.trim(), descripcion: descripcion.trim() || null, bimestre, archivo_url: url };
      return editando
        ? AcademicoRepository.editarMaterial(item.id_material, datos)
        : AcademicoRepository.publicarMaterial(idCarga, datos);
    }
    const datos = { tema: titulo.trim() || null, fecha: unirFechaHora(fecha, hora), enlace: url };
    return editando
      ? AcademicoRepository.editarClase(item.id_clase_virtual, datos)
      : AcademicoRepository.crearClase(idCarga, datos);
  };

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla>
      <Tarjeta>
        {(errorLocal || accion.error) && <Aviso tono="error">{errorLocal || accion.error}</Aviso>}

        <Campo
          etiqueta={tipo === 'clase' ? 'Tema (opcional)' : 'Título'}
          valor={titulo}
          alCambiar={setTitulo}
          maxLength={150}
        />
        {tipo !== 'clase' && (
          <Campo etiqueta="Descripción (opcional)" valor={descripcion} alCambiar={setDescripcion} multilinea />
        )}

        {usaFecha && (
          <View style={estilos.fila}>
            <Campo
              style={estilos.flex}
              etiqueta={tipo === 'tarea' ? 'Fecha de entrega' : 'Fecha'}
              valor={fecha}
              alCambiar={setFecha}
              placeholder="AAAA-MM-DD"
              maxLength={10}
            />
            <Campo style={estilos.hora} etiqueta="Hora" valor={hora} alCambiar={setHora} placeholder="HH:MM" maxLength={5} />
          </View>
        )}

        {tipo === 'tarea' && !editando && (
          <SelectorArchivo archivo={archivo} alCambiar={setArchivo} etiqueta="Archivo del enunciado (opcional)" />
        )}

        <Campo
          etiqueta={{ tarea: 'Enlace del enunciado (opcional)', material: 'Enlace del material', clase: 'Enlace de la clase (Meet, Zoom...)' }[tipo]}
          valor={enlace}
          alCambiar={setEnlace}
          placeholder="https://..."
          autoCapitalize="none"
          keyboardType="url"
        />

        {usaBimestre && (
          <>
            <Texto variante="pequeno" negrita>Bimestre</Texto>
            <Selector opciones={BIMESTRES} valor={bimestre} alCambiar={setBimestre} style={estilos.selector} />
          </>
        )}

        <Boton
          titulo={editando ? 'Guardar cambios' : 'Publicar'}
          icono={editando ? 'save-outline' : 'paper-plane-outline'}
          onPress={guardar}
          cargando={accion.enviando}
        />
      </Tarjeta>
    </Pantalla>
  );
}

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', gap: ESPACIO.sm },
  flex: { flex: 1 },
  hora: { width: 100 },
  selector: { marginTop: ESPACIO.xs },
});
