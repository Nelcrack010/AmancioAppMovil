import React from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../../components/Pantalla';
import Boton from '../../../components/Boton';
import Lista, { BotonIcono } from '../../../components/Lista';
import { Vacio } from '../../../components/Estados';
import { FilaClaseVirtual } from '../../../components/Items';
import useConsulta from '../../../viewmodels/useConsulta';
import AcademicoRepository from '../../../repositories/academicoRepository';
import { avisar, confirmar } from '../../../utils/dialogos';
import { COLORES } from '../../../config/tema';

/**
 * Pestaña "Clases virtuales": enlaces de las clases (Meet, Zoom...). Al tocar una se abre.
 * El docente además puede programar, editar y eliminar clases.
 */
export default function PestanaClases({ idCarga, esDocente, navigation }) {
  const clases = useConsulta(() => AcademicoRepository.clases(idCarga), [idCarga]);

  const eliminar = async (c) => {
    if (!await confirmar('Eliminar clase', `Se eliminará la clase "${c.tema || 'sin tema'}".`, { textoAceptar: 'Eliminar', peligroso: true })) return;
    try {
      await AcademicoRepository.eliminarClase(c.id_clase_virtual);
      clases.recargar();
    } catch (e) {
      avisar('No se pudo eliminar', e.message);
    }
  };

  return (
    <Pantalla
      consulta={clases}
      pie={esDocente && (
        <Boton titulo="Programar clase" icono="add-circle-outline"
          onPress={() => navigation.navigate('Publicar', { tipo: 'clase', idCarga, titulo: 'Nueva clase virtual' })} />
      )}
    >
      {(datos) => (datos.clases.length === 0 ? (
        <Vacio icono="videocam-outline" titulo="Sin clases virtuales" mensaje="No hay clases virtuales programadas." />
      ) : (
        <Lista>
          {datos.clases.map((c) => (
            <FilaClaseVirtual
              key={c.id_clase_virtual}
              clase={c}
              acciones={esDocente && (
                <View style={estilos.acciones}>
                  <BotonIcono icono="create-outline" etiqueta="Editar clase"
                    onPress={() => navigation.navigate('Publicar', { tipo: 'clase', idCarga, item: c, titulo: 'Editar clase' })} />
                  <BotonIcono icono="trash-outline" color={COLORES.error} etiqueta="Eliminar clase" onPress={() => eliminar(c)} />
                </View>
              )}
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
