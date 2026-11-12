import React from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../../components/Pantalla';
import Tarjeta from '../../../components/Tarjeta';
import Texto from '../../../components/Texto';
import Etiqueta from '../../../components/Etiqueta';
import Boton from '../../../components/Boton';
import { Vacio } from '../../../components/Estados';
import useConsulta from '../../../viewmodels/useConsulta';
import AcademicoRepository from '../../../repositories/academicoRepository';
import { avisar, confirmar } from '../../../utils/dialogos';
import { formatearFechaHora } from '../../../utils/fechas';
import { ESTADOS_TAREA, infoEstado } from '../../../config/estados';
import { COLORES, ESPACIO } from '../../../config/tema';

/**
 * Pestaña "Tareas" de un curso.
 *   - Estudiante: ve el estado de cada tarea (pendiente, entregada, calificada, vencida)
 *     y al tocarla puede entregarla.
 *   - Docente: publica tareas, ve las entregas y puede eliminar una tarea.
 */
export default function PestanaTareas({ idCarga, esDocente, navigation }) {
  const tareas = useConsulta(() => AcademicoRepository.tareas(idCarga), [idCarga]);

  const eliminar = async (tarea) => {
    if (!await confirmar('Eliminar tarea', `Se eliminará "${tarea.titulo}" y sus entregas.`, { textoAceptar: 'Eliminar', peligroso: true })) return;
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
      ) : datos.tareas.map((t) => {
        const estado = infoEstado(ESTADOS_TAREA, t.estado);
        return (
          <Tarjeta
            key={t.id_tarea}
            colorBorde={esDocente ? COLORES.azul : undefined}
            onPress={esDocente
              ? () => navigation.navigate('Entregas', { idTarea: t.id_tarea, titulo: t.titulo })
              : () => navigation.navigate('TareaDetalle', { tarea: t, idCarga, titulo: t.titulo })}
          >
            <View style={estilos.fila}>
              <Texto negrita style={estilos.flex}>{t.titulo}</Texto>
              {!esDocente && <Etiqueta texto={estado.texto} tono={estado.tono} />}
            </View>
            <Texto variante="pequeno">Entrega: {formatearFechaHora(t.fecha_entrega)} · {t.bimestre}° bimestre</Texto>
            {!esDocente && t.calificacion !== null && t.calificacion !== undefined && (
              <Texto variante="pequeno" negrita color={COLORES.azul}>Nota: {t.calificacion}</Texto>
            )}
            {!esDocente && t.fuera_de_plazo && <Etiqueta texto="Entregada fuera de plazo" tono="alerta" />}
            {esDocente && (
              <View style={estilos.acciones}>
                <Texto variante="pequeno" negrita color={COLORES.azul}>Ver entregas</Texto>
                <Boton titulo="Eliminar" variante="texto" pequeno icono="trash-outline" onPress={() => eliminar(t)} />
              </View>
            )}
          </Tarjeta>
        );
      }))}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.sm },
  flex: { flex: 1 },
  acciones: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
