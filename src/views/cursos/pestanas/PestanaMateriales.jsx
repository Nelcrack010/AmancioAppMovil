import React from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../../components/Pantalla';
import Boton from '../../../components/Boton';
import Lista, { BotonIcono, ItemLista } from '../../../components/Lista';
import { Vacio } from '../../../components/Estados';
import { abrirEnlace } from '../../../components/Items';
import useConsulta from '../../../viewmodels/useConsulta';
import AcademicoRepository from '../../../repositories/academicoRepository';
import { avisar, confirmar } from '../../../utils/dialogos';
import { formatearFecha } from '../../../utils/fechas';
import { COLORES } from '../../../config/tema';

/**
 * Pestaña "Materiales": archivos y enlaces publicados por el docente.
 * Al tocar un material se abre su enlace. El docente además puede subir, editar y eliminar.
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
      ) : (
        <Lista>
          {datos.materiales.map((m) => (
            <ItemLista
              key={m.id_material}
              icono="folder-open"
              colorIcono={COLORES.azul}
              fondoIcono={COLORES.infoFondo}
              titulo={m.titulo}
              subtitulo={m.descripcion}
              detalle={`${m.bimestre}° bimestre · ${formatearFecha(m.fecha_publicacion)}`}
              derecha={esDocente && (
                <View style={estilos.acciones}>
                  <BotonIcono icono="create-outline" etiqueta="Editar material"
                    onPress={() => navigation.navigate('Publicar', { tipo: 'material', idCarga, item: m, titulo: 'Editar material' })} />
                  <BotonIcono icono="trash-outline" color={COLORES.error} etiqueta="Eliminar material" onPress={() => eliminar(m)} />
                </View>
              )}
              onPress={m.archivo_url ? () => abrirEnlace(m.archivo_url) : undefined}
            />
          ))}
        </Lista>
      ))}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  acciones: { flexDirection: 'row' },
});
