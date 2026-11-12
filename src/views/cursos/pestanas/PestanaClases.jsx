import React from 'react';
import Pantalla from '../../../components/Pantalla';
import Boton from '../../../components/Boton';
import { Vacio } from '../../../components/Estados';
import { ClaseVirtual } from '../../../components/Items';
import useConsulta from '../../../viewmodels/useConsulta';
import AcademicoRepository from '../../../repositories/academicoRepository';
import { avisar, confirmar } from '../../../utils/dialogos';

/**
 * Pestaña "Clases virtuales": enlaces de las clases (Meet, Zoom...) del curso.
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
      ) : datos.clases.map((c) => (
        <ClaseVirtual
          key={c.id_clase_virtual}
          clase={c}
          acciones={esDocente && (
            <>
              <Boton titulo="Editar" variante="texto" pequeno icono="create-outline"
                onPress={() => navigation.navigate('Publicar', { tipo: 'clase', idCarga, item: c, titulo: 'Editar clase' })} />
              <Boton titulo="Eliminar" variante="texto" pequeno icono="trash-outline" onPress={() => eliminar(c)} />
            </>
          )}
        />
      )))}
    </Pantalla>
  );
}
