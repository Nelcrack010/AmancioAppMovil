import React from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../../components/Pantalla';
import Tarjeta from '../../../components/Tarjeta';
import Texto from '../../../components/Texto';
import Etiqueta from '../../../components/Etiqueta';
import Boton from '../../../components/Boton';
import { Vacio } from '../../../components/Estados';
import { BotonEnlace } from '../../../components/Items';
import useConsulta from '../../../viewmodels/useConsulta';
import AcademicoRepository from '../../../repositories/academicoRepository';
import { avisar, confirmar } from '../../../utils/dialogos';
import { formatearFecha } from '../../../utils/fechas';
import { ESPACIO } from '../../../config/tema';

/**
 * Pestaña "Materiales": archivos y enlaces publicados por el docente.
 * El docente además puede subir, editar y eliminar materiales.
 */
export default function PestanaMateriales({ idCarga, esDocente, navigation }) {
  const materiales = useConsulta(() => AcademicoRepository.materiales(idCarga), [idCarga]);

  const eliminar = async (m) => {
    if (!await confirmar('Eliminar material', `Se eliminará "${m.titulo}".`, { textoAceptar: 'Eliminar', peligroso: true })) return;
    try {
      await AcademicoRepository.eliminarMaterial(m.id_material);
      materiales.recargar();
    } catch (e) {
      avisar('No se pudo eliminar', e.message);
    }
  };

  return (
    <Pantalla
      consulta={materiales}
      pie={esDocente && (
        <Boton titulo="Publicar material" icono="add-circle-outline"
          onPress={() => navigation.navigate('Publicar', { tipo: 'material', idCarga, titulo: 'Nuevo material' })} />
      )}
    >
      {(datos) => (datos.materiales.length === 0 ? (
        <Vacio icono="folder-open-outline" titulo="Sin materiales" mensaje="El docente aún no publicó materiales." />
      ) : datos.materiales.map((m) => (
        <Tarjeta key={m.id_material}>
          <View style={estilos.fila}>
            <Texto negrita style={estilos.flex}>{m.titulo}</Texto>
            <Etiqueta texto={`${m.bimestre}° bim.`} tono="guinda" />
          </View>
          {m.descripcion && <Texto variante="pequeno">{m.descripcion}</Texto>}
          <Texto variante="diminuto">Publicado el {formatearFecha(m.fecha_publicacion)}</Texto>
          <View style={estilos.acciones}>
            <BotonEnlace texto="Abrir material" url={m.archivo_url} />
            {esDocente && (
              <View style={estilos.fila}>
                <Boton titulo="Editar" variante="texto" pequeno icono="create-outline"
                  onPress={() => navigation.navigate('Publicar', { tipo: 'material', idCarga, item: m, titulo: 'Editar material' })} />
                <Boton titulo="Eliminar" variante="texto" pequeno icono="trash-outline" onPress={() => eliminar(m)} />
              </View>
            )}
          </View>
        </Tarjeta>
      )))}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.sm },
  flex: { flex: 1 },
  acciones: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
});
