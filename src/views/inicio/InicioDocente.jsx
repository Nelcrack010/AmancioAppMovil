import React from 'react';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import Lista, { ItemLista } from '../../components/Lista';
import { Seccion } from '../../components/Basicos';
import { BloqueHorario, FilaClaseVirtual } from '../../components/Items';

/** Panel del docente: entregas por calificar, clases de hoy y próximas clases virtuales. */
export default function InicioDocente({ datos, navigation }) {
  return (
    <>
      <Seccion titulo="Entregas por calificar" />
      {datos.entregas_por_calificar.length === 0 ? (
        <Texto variante="pequeno">No tienes entregas pendientes de calificar.</Texto>
      ) : (
        <Lista>
          {datos.entregas_por_calificar.map((t) => (
            <ItemLista
              key={t.id_tarea}
              icono="document-text"
              titulo={t.titulo}
              subtitulo={`${t.curso} · ${t.seccion}`}
              derecha={<Etiqueta texto={`${t.por_calificar} nueva(s)`} tono="info" />}
              onPress={() => navigation.navigate('Entregas', { idTarea: t.id_tarea, titulo: t.titulo })}
            />
          ))}
        </Lista>
      )}

      <Seccion titulo="Clases de hoy" />
      {datos.clases_de_hoy.length === 0 ? (
        <Texto variante="pequeno">Hoy no tienes clases.</Texto>
      ) : (
        <Lista>
          {datos.clases_de_hoy.map((b) => <BloqueHorario key={`${b.hora_inicio}-${b.detalle}`} bloque={b} />)}
        </Lista>
      )}

      {datos.proximas_clases_virtuales.length > 0 && (
        <>
          <Seccion titulo="Próximas clases virtuales" />
          <Lista>
            {datos.proximas_clases_virtuales.map((c) => <FilaClaseVirtual key={c.id_clase_virtual} clase={c} />)}
          </Lista>
        </>
      )}

      <Seccion titulo="Accesos rápidos" />
      <Lista>
        <ItemLista
          icono="book"
          titulo="Mis cursos"
          subtitulo="Materiales, tareas, clases y registro de notas"
          onPress={() => navigation.navigate('Cursos')}
        />
      </Lista>
    </>
  );
}
