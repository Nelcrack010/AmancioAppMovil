import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import Selector from '../../components/Selector';
import { Aviso } from '../../components/Estados';
import useAccion from '../../viewmodels/useAccion';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import { avisar } from '../../utils/dialogos';
import {
  bimestreActual, esFechaValida, esHoraValida, hoyISO, sumarDias, unirFechaHora,
} from '../../utils/fechas';
import { primerError, validarEnlace, validarTexto } from '../../utils/validaciones';
import { ESPACIO } from '../../config/tema';

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
  const accion = useAccion();
  const anio = useConsulta(() => AcademicoRepository.anioActivo(), []);

  // Valores iniciales: los del elemento que se edita o valores por defecto.
  const fechaItem = item?.fecha || item?.fecha_entrega;
  const [titulo, setTitulo] = useState(item?.titulo || item?.tema || '');
  const [descripcion, setDescripcion] = useState(item?.descripcion || '');
  const [enlace, setEnlace] = useState(item?.archivo_url || item?.enlace || '');
  const [fecha, setFecha] = useState(fechaItem ? fechaItem.slice(0, 10) : sumarDias(hoyISO(), 7));
  const [hora, setHora] = useState(fechaItem ? fechaItem.slice(11, 16) : (tipo === 'tarea' ? '23:59' : '16:00'));
  const [bimestre, setBimestre] = useState(item?.bimestre || null);
  const [errorLocal, setErrorLocal] = useState(null);

  // Por defecto, el bimestre en curso según las fechas del año escolar.
  useEffect(() => {
    if (!bimestre && anio.datos) setBimestre(bimestreActual(anio.datos.bimestres));
  }, [anio.datos, bimestre]);

  const usaFecha = tipo !== 'material';
  const usaBimestre = tipo !== 'clase';

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
      navigation.goBack();
    }
  };

  /** Arma los datos y llama a la acción del repositorio que corresponde. */
  const enviar = () => {
    const url = enlace.trim() || null;
    if (tipo === 'tarea') {
      return AcademicoRepository.publicarTarea(idCarga, {
        titulo: titulo.trim(), descripcion: descripcion.trim() || null,
        fecha_entrega: unirFechaHora(fecha, hora), bimestre, archivo_url: url,
      });
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

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', gap: ESPACIO.sm },
  flex: { flex: 1 },
  hora: { width: 100 },
  selector: { marginTop: ESPACIO.xs },
});
