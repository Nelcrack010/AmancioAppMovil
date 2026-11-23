// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Asistencia   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: MiAsistenciaView (estudiante): total de faltas, tardanzas y justificadas del año, y el detalle por
//     día, que se puede filtrar por mes.
// Pantalla «MiAsistencia» (src/navigation/pantallas.js): en el menú de ALUMNO («Asistencia»)
//     (src/config/menus.js)
//
// Datos (repositorio → endpoint → backend):
//   AsistenciaRepository.mia() → GET /asistencia/mia (backend: asistencia_routes.py → mi_asistencia())
// Botones / secciones: «Detalle por día», «Sin registros»
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
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Lista, { ItemLista } from '../../components/Lista';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import Selector from '../../components/Selector';
import { Dato, FilaDatos, Seccion } from '../../components/Basicos';
import { Vacio } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import { formatearFecha, nombreDia } from '../../utils/fechas';
import { etiquetasAsistencia } from '../../config/estados';
import { COLORES, ESPACIO } from '../../config/tema';

const NOMBRES_MES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto',
  'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const TODOS = 'TODOS';

/**
 * MiAsistenciaView (estudiante): total de faltas, tardanzas y justificadas del año, y el
 * detalle por día, que se puede filtrar por mes.
 */
export default function MiAsistenciaView() {
  // PISTA: «asistencia» = datos que se cargan al abrir la pantalla: AsistenciaRepository.mia() → GET
  //     /asistencia/mia (backend: asistencia_routes.py → mi_asistencia()). Úsalos con asistencia.datos;
  //     asistencia.recargar() vuelve a pedirlos.
  const asistencia = useConsulta(() => AsistenciaRepository.mia(), []);
  const [mes, setMes] = useState(TODOS);

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla consulta={asistencia}>
      {(datos) => {
        const r = datos.resumen;
        // Meses que tienen registros, para el filtro ("2026-10" → "Octubre").
        const meses = [...new Set(datos.registros.map((x) => x.fecha.slice(0, 7)))];
        const registros = mes === TODOS ? datos.registros : datos.registros.filter((x) => x.fecha.startsWith(mes));
        const total = r.P + r.T + r.F + r.J;

        return (
          <>
            <FilaDatos>
              <Dato valor={r.P} rotulo="Presente" color={COLORES.exito} />
              <Dato valor={r.T} rotulo="Tardanzas" color={COLORES.alerta} />
              <Dato valor={r.F} rotulo="Faltas" color={COLORES.error} />
              <Dato valor={r.J} rotulo="Justificadas" color={COLORES.azul} />
            </FilaDatos>
            {total > 0 && (
              <Texto variante="pequeno" centrado style={estilos.porcentaje}>
                Asistencia: {Math.round(((r.P + r.T) * 100) / total)}% de {total} día(s) registrados
              </Texto>
            )}

            <Seccion titulo="Detalle por día" />
            {meses.length > 1 && (
              <Selector
                valor={mes}
                alCambiar={setMes}
                opciones={[
                  { valor: TODOS, texto: 'Todos' },
                  ...meses.map((m) => ({ valor: m, texto: NOMBRES_MES[Number(m.slice(5, 7)) - 1] })),
                ]}
              />
            )}
            {registros.length === 0 ? (
              <Vacio icono="calendar-outline" titulo="Sin registros" />
            ) : (
              <Lista>
                {registros.map((x) => (
                  <ItemLista
                    key={x.fecha}
                    titulo={`${nombreDia(x.fecha)}, ${formatearFecha(x.fecha)}`}
                    subtitulo={x.observacion}
                    // Una justificada muestra las dos: "Tardanza" + "Justificada".
                    derecha={(
                      <View style={estilos.etiquetas}>
                        {etiquetasAsistencia(x).map((e) => <Etiqueta key={e.texto} texto={e.texto} tono={e.tono} />)}
                      </View>
                    )}
                  />
                ))}
              </Lista>
            )}
          </>
        );
      }}
    </Pantalla>
  );
}

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  porcentaje: { marginBottom: ESPACIO.xs },
  etiquetas: { alignItems: 'flex-end', gap: 4 },
});
