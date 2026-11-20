import React from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../../components/Pantalla';
import Texto from '../../../components/Texto';
import Etiqueta from '../../../components/Etiqueta';
import Boton from '../../../components/Boton';
import Lista, { BotonIcono, ItemLista } from '../../../components/Lista';
import { Vacio } from '../../../components/Estados';
import useConsulta from '../../../viewmodels/useConsulta';
import AcademicoRepository from '../../../repositories/academicoRepository';
import { avisar, confirmar } from '../../../utils/dialogos';
import { formatearFechaHora } from '../../../utils/fechas';
import { ESTADOS_TAREA, colorNota, infoEstado } from '../../../config/estados';
import { COLORES, ESPACIO } from '../../../config/tema';

/**
 * Pestaña "Tareas" de un curso.
 *   - Estudiante: ve el estado de cada tarea (pendiente, entregada, calificada, vencida)
 *     y su nota; al tocarla puede entregarla.
 *   - Docente: publica tareas; al tocar una ve las entregas; el ícono de basurero la elimina.
 */
export default function PestanaTareas({ idCarga, esDocente, navigation }) {
  const tareas = useConsulta(() => AcademicoRepository.tareas(idCarga), [idCarga]);

  const eliminar = async (tarea) => {
    // El servidor no deja borrar una tarea que ya tiene entregas (se perderían las notas).
    if (tarea.entregas > 0) {
      avisar('No se puede eliminar', `"${tarea.titulo}" ya tiene ${tarea.entregas} entrega(s).`);
      return;
    }
    if (!await confirmar('Eliminar tarea', `Se eliminará "${tarea.titulo}".`, { textoAceptar: 'Eliminar', peligroso: true })) return;
    try {
      await AcademicoRepository.eliminarTarea(tarea.id_tarea);
      tareas.recargar();
    } catch (e) {
      avisar('No se pudo eliminar', e.message);
    }
  };

  return (
    <Pantalla
      consulta={tareas}
      pie={esDocente && (
        <Boton titulo="Publicar tarea" icono="add-circle-outline"
          onPress={() => navigation.navigate('Publicar', { tipo: 'tarea', idCarga, titulo: 'Nueva tarea' })} />
      )}
    >
      {(datos) => (datos.tareas.length === 0 ? (
        <Vacio icono="document-text-outline" titulo="Sin tareas" mensaje="Aún no se publicaron tareas en este curso." />
      ) : (
        <Lista>
          {datos.tareas.map((t) => {
            const estado = infoEstado(ESTADOS_TAREA, t.estado);
            const tieneNota = t.calificacion !== null && t.calificacion !== undefined;
            return (
              <ItemLista
                key={t.id_tarea}
                icono="document-text"
                titulo={t.titulo}
                subtitulo={`Entrega: ${formatearFechaHora(t.fecha_entrega)}`}
                detalle={`${t.bimestre}° bimestre${!esDocente && t.fuera_de_plazo ? ' · entregada fuera de plazo' : ''}`}
                derecha={esDocente ? (
                  <BotonIcono icono="trash-outline" color={COLORES.error} etiqueta="Eliminar tarea" onPress={() => eliminar(t)} />
                ) : (
                  <View style={estilos.estado}>
                    <Etiqueta texto={estado.texto} tono={estado.tono} />
                    {tieneNota && <Texto negrita color={colorNota(t.calificacion)}>{t.calificacion}</Texto>}
                  </View>
                )}
                onPress={esDocente
                  ? () => navigation.navigate('Entregas', { idTarea: t.id_tarea, titulo: t.titulo })
                  : () => navigation.navigate('TareaDetalle', { tarea: t, idCarga, titulo: t.titulo })}
              />
            );
          })}
        </Lista>
      ))}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  estado: { alignItems: 'flex-end', gap: ESPACIO.xs },
});
