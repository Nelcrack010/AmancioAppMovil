import React from 'react';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import { Seccion } from '../../components/Basicos';
import { BloqueHorario, ClaseVirtual } from '../../components/Items';
import { COLORES } from '../../config/tema';

/** Panel del docente: clases de hoy, entregas por calificar y próximas clases virtuales. */
export default function InicioDocente({ datos, navigation }) {
  return (
    <>
      <Seccion titulo="Entregas por calificar" />
      {datos.entregas_por_calificar.length === 0 ? (
        <Texto variante="pequeno">No tienes entregas pendientes de calificar.</Texto>
      ) : datos.entregas_por_calificar.map((t) => (
        <Tarjeta
          key={t.id_tarea}
          colorBorde={COLORES.azul}
          onPress={() => navigation.navigate('Entregas', { idTarea: t.id_tarea, titulo: t.titulo })}
        >
          <Texto negrita>{t.titulo}</Texto>
          <Texto variante="pequeno">{t.curso} · {t.seccion}</Texto>
          <Etiqueta texto={`${t.por_calificar} por calificar`} tono="info" />
        </Tarjeta>
      ))}

      <Seccion titulo="Clases de hoy" />
      {datos.clases_de_hoy.length === 0
        ? <Texto variante="pequeno">Hoy no tienes clases.</Texto>
        : datos.clases_de_hoy.map((b) => <BloqueHorario key={`${b.hora_inicio}-${b.detalle}`} bloque={b} />)}

      {datos.proximas_clases_virtuales.length > 0 && (
        <>
          <Seccion titulo="Próximas clases virtuales" />
          {datos.proximas_clases_virtuales.map((c) => <ClaseVirtual key={c.id_clase_virtual} clase={c} />)}
        </>
      )}

      <Seccion titulo="Accesos rápidos" />
      <Tarjeta onPress={() => navigation.navigate('Cursos')}>
        <Texto negrita>Mis cursos</Texto>
        <Texto variante="pequeno">Materiales, tareas, clases y registro de notas.</Texto>
      </Tarjeta>
    </>
  );
}
