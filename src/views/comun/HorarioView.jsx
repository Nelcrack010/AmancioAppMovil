// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Horario   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: HorarioView: horario del estudiante (según su sección) o del docente (según su carga). Vista por día
//     con el bloque actual destacado, o vista de toda la semana. Se guarda en el celular, así que también se ve
//     sin conexión.
// Pantalla «Horario» (src/navigation/pantallas.js): en el menú de ALUMNO («Horario»), DOCENTE («Horario»)
//     (src/config/menus.js)
//
// Datos (repositorio → endpoint → backend):
//   AcademicoRepository.horario() → GET /horario/mi-horario (backend: horario_routes.py → mi_horario())
// Botones / secciones: «Sin horario»
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
import React, { useState } from 'react';
import { View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Selector from '../../components/Selector';
import Lista from '../../components/Lista';
import { Seccion } from '../../components/Basicos';
import { Vacio } from '../../components/Estados';
import { BloqueHorario, BloqueReceso } from '../../components/Items';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import { hoyISO, nombreDia } from '../../utils/fechas';

const SEMANA = 'SEMANA';

/**
 * HorarioView: horario del estudiante (según su sección) o del docente (según su carga).
 * Vista por día con el bloque actual destacado, o vista de toda la semana.
 * Se guarda en el celular, así que también se ve sin conexión.
 */
export default function HorarioView() {
  // PISTA: «horario» = datos que se cargan al abrir la pantalla: AcademicoRepository.horario() → GET
  //     /horario/mi-horario (backend: horario_routes.py → mi_horario()). Úsalos con horario.datos;
  //     horario.recargar() vuelve a pedirlos.
  const horario = useConsulta(() => AcademicoRepository.horario(), []);
  const hoy = nombreDia(hoyISO());
  const [diaElegido, setDiaElegido] = useState(null);

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla consulta={horario}>
      {(datos) => {
        if (!datos.dias?.length) {
          return <Vacio icono="calendar-outline" titulo="Sin horario" mensaje="Aún no hay un horario configurado." />;
        }
        // Por defecto se muestra el día de hoy (o el primero, si hoy no hay clases).
        const dia = diaElegido || (datos.dias.some((d) => d.dia === hoy) ? hoy : datos.dias[0].dia);
        const opciones = [
          ...datos.dias.map((d) => ({ valor: d.dia, texto: d.dia === hoy ? `${d.dia} (hoy)` : d.dia })),
          { valor: SEMANA, texto: 'Semana' },
        ];
        const diasAMostrar = dia === SEMANA ? datos.dias : datos.dias.filter((d) => d.dia === dia);

        return (
          <>
            <Selector opciones={opciones} valor={dia} alCambiar={setDiaElegido} />
            {diasAMostrar.map((d) => (
              <View key={d.dia}>
                {dia === SEMANA && <Seccion titulo={d.dia} />}
                {/* Todos los bloques del día en una sola lista, con los recesos intercalados */}
                <Lista>
                  {conRecesos(d.bloques, datos.recesos).map((b) => (b.esReceso ? (
                    <BloqueReceso key={`r-${b.hora_inicio}`} receso={b} />
                  ) : (
                    <BloqueHorario
                      key={`${b.hora_inicio}-${b.curso}`}
                      bloque={b}
                      actual={d.dia === hoy && esBloqueActual(b)}
                    />
                  )))}
                </Lista>
              </View>
            ))}
          </>
        );
      }}
    </Pantalla>
  );
}

/** Mezcla los bloques de clase con los recesos, ordenados por hora de inicio. */
function conRecesos(bloques, recesos = []) {
  const ultimoFin = bloques.length ? bloques[bloques.length - 1].hora_fin : '00:00';
  const recesosDelDia = recesos
    .filter((r) => r.hora_inicio < ultimoFin)            // solo los que caen dentro de la jornada
    .map((r) => ({ ...r, esReceso: true }));
  return [...bloques, ...recesosDelDia].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
}

/** true si la hora actual está dentro del bloque ("08:00" ≤ ahora < "09:00"). */
function esBloqueActual(bloque) {
  const d = new Date();
  const ahora = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return bloque.hora_inicio <= ahora && ahora < bloque.hora_fin;
}
