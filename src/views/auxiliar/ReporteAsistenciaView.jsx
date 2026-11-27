// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Académico (año y secciones), Asistencia   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: Rangos rápidos de fechas: [desde, hasta].
// Pantalla «ReporteAsistencia» (src/navigation/pantallas.js): en el menú de AUXILIAR («Reporte de asistencia»),
//     ADMIN («Asistencia») (src/config/menus.js)
//   Se abre desde: InicioAdmin.jsx, InicioAuxiliar.jsx  con navigation.navigate('ReporteAsistencia', {...})
// Desde aquí se va a: ConductaAlumno
//
// Datos (repositorio → endpoint → backend):
//   AcademicoRepository.secciones() → GET /academico/secciones (backend: academico_routes.py → secciones())
//   AsistenciaRepository.resumen() → GET /asistencia/seccion/<int:id_seccion>/resumen (backend:
//       asistencia_routes.py → resumen_de_seccion())
// Botones / secciones: «Sección sin estudiantes»
// Campos: «Desde», «Hasta»
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
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Lista, { ItemLista } from '../../components/Lista';
import Texto from '../../components/Texto';
import Campo from '../../components/Campo';
import Selector from '../../components/Selector';
import { Seccion } from '../../components/Basicos';
import { Aviso, Cargando, ErrorVista, Vacio } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import { esFechaValida, hoyISO, sumarDias } from '../../utils/fechas';
import { COLORES, ESPACIO } from '../../config/tema';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useCallback, useMemo } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Tarjeta from '../../components/Tarjeta';
import Boton from '../../components/Boton';
import Etiqueta from '../../components/Etiqueta';
import DialogoTexto from '../../components/DialogoTexto';
import { Fila, FilaDatos, Dato, Separador } from '../../components/Basicos';
import useAccion from '../../viewmodels/useAccion';
import ConductaRepository from '../../repositories/conductaRepository';
import MensajesRepository from '../../repositories/mensajesRepository';
import PerfilRepository from '../../repositories/perfilRepository';
import { useSesion } from '../../context/SesionContext';
import { confirmar, avisar, avisarResultado } from '../../utils/dialogos';
import { validarTexto, validarEnlace, primerError } from '../../utils/validaciones';
import { formatearFecha, formatearFechaHora } from '../../utils/fechas';
import { infoEstado, ESTADOS_CITA, ESTADOS_TAREA, ESTADOS_REPORTE } from '../../config/estados';
import { RADIO, SOMBRA } from '../../config/tema';
// <<< FIN KIT DE IMPORTS

/** Rangos rápidos de fechas: [desde, hasta]. */
const RANGOS = {
  semana: () => [sumarDias(hoyISO(), -6), hoyISO()],
  mes: () => [`${hoyISO().slice(0, 8)}01`, hoyISO()],
  anio: () => [`${hoyISO().slice(0, 4)}-01-01`, hoyISO()],
};

/**
 * ReporteAsistenciaView (auxiliar y administrador): resumen de asistencia por sección y
 * rango de fechas. Por cada estudiante: presentes, tardanzas, faltas, justificadas y
 * porcentaje. Al tocar un estudiante se ve su conducta.
 */
export default function ReporteAsistenciaView({ navigation }) {
  // PISTA: «secciones» = datos que se cargan al abrir la pantalla: AcademicoRepository.secciones() → GET
  //     /academico/secciones (backend: academico_routes.py → secciones()). Úsalos con secciones.datos;
  //     secciones.recargar() vuelve a pedirlos.
  const secciones = useConsulta(() => AcademicoRepository.secciones(), []);
  const [idSeccion, setIdSeccion] = useState(null);
  const [rango, setRango] = useState('mes');
  const [desde, setDesde] = useState(RANGOS.mes()[0]);
  const [hasta, setHasta] = useState(RANGOS.mes()[1]);

  useEffect(() => {
    if (!idSeccion && secciones.datos?.length) setIdSeccion(secciones.datos[0].id_seccion);
  }, [secciones.datos, idSeccion]);

  const fechasValidas = esFechaValida(desde) && esFechaValida(hasta) && desde <= hasta;
  // PISTA: datos que se cargan al abrir la pantalla (useConsulta): .datos, .cargando, .error, .recargar().
  const reporte = useConsulta(
    () => (idSeccion && fechasValidas ? AsistenciaRepository.resumen(idSeccion, desde, hasta) : null),
    [idSeccion, desde, hasta, fechasValidas],
  );

  const elegirRango = (clave) => {
    setRango(clave);
    if (RANGOS[clave]) {
      const [d, h] = RANGOS[clave]();
      setDesde(d);
      setHasta(h);
    }
  };

  if (secciones.cargando) return <Cargando />;
  if (secciones.error) return <ErrorVista error={secciones.error} onReintentar={secciones.recargar} />;

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla>
      <Selector
        opciones={secciones.datos.map((s) => ({ valor: s.id_seccion, texto: `${s.grado} ${s.nombre} · ${s.nivel}` }))}
        valor={idSeccion}
        alCambiar={setIdSeccion}
      />
      <Selector
        opciones={[
          { valor: 'semana', texto: 'Últimos 7 días' },
          { valor: 'mes', texto: 'Este mes' },
          { valor: 'anio', texto: 'Todo el año' },
          { valor: 'otro', texto: 'Otro rango' },
        ]}
        valor={rango}
        alCambiar={elegirRango}
      />
      {rango === 'otro' && (
        <View style={estilos.fila}>
          <Campo style={estilos.flex} etiqueta="Desde" valor={desde} alCambiar={setDesde} placeholder="AAAA-MM-DD" maxLength={10} />
          <Campo style={estilos.flex} etiqueta="Hasta" valor={hasta} alCambiar={setHasta} placeholder="AAAA-MM-DD" maxLength={10} />
        </View>
      )}
      {!fechasValidas && <Aviso tono="alerta">Revisa las fechas: formato AAAA-MM-DD y "desde" menor o igual que "hasta".</Aviso>}

      {fechasValidas && (reporte.cargando ? <Cargando /> : reporte.error ? (
        <ErrorVista error={reporte.error} onReintentar={reporte.recargar} />
      ) : reporte.datos.alumnos.length === 0 ? (
        <Vacio icono="people-outline" titulo="Sección sin estudiantes" />
      ) : (
        <>
          {reporte.aviso && <Aviso tono="alerta" icono="cloud-offline">{reporte.aviso}</Aviso>}
          <Seccion titulo={`${reporte.datos.seccion} · ${reporte.datos.alumnos.length} estudiantes`} />
          <Lista>
            {reporte.datos.alumnos.map((a) => (
              <ItemLista
                key={a.id_alumno}
                titulo={`${a.apellidos}, ${a.nombres}`}
                subtitulo={`P ${a.P} · T ${a.T} · F ${a.F} · J ${a.J}`}
                detalle={`${a.dias} día(s) registrados`}
                acento={a.porcentaje !== null && a.porcentaje < 85 ? COLORES.error : undefined}
                derecha={(
                  <Texto variante="subtitulo" color={a.porcentaje !== null && a.porcentaje < 85 ? COLORES.error : COLORES.azul}>
                    {a.porcentaje === null ? '—' : `${a.porcentaje}%`}
                  </Texto>
                )}
                onPress={() => navigation.navigate('ConductaAlumno', { idAlumno: a.id_alumno, titulo: a.nombres })}
              />
            ))}
          </Lista>
        </>
      ))}
    </Pantalla>
  );
}

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.sm },
  flex: { flex: 1 },
});
