// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Académico (año y secciones), Asistencia   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: ConductaView (auxiliar): elegir sección y estudiante para registrar un reporte de conducta o revisar
//     su estado (nota de conducta, reportes, anulaciones).
// Pantalla «Conducta» (src/navigation/pantallas.js): en el menú de AUXILIAR («Conducta») (src/config/menus.js)
//   Se abre desde: InicioAuxiliar.jsx  con navigation.navigate('Conducta', {...})
// Desde aquí se va a: ConductaAlumno, RegistrarReporte
//
// Datos (repositorio → endpoint → backend):
//   AcademicoRepository.secciones() → GET /academico/secciones (backend: academico_routes.py → secciones())
//   AsistenciaRepository.alumnosDeSeccion() → GET /asistencia/seccion/<int:id_seccion>/resumen (backend:
//       asistencia_routes.py → resumen_de_seccion())
// Botones / secciones: «Sin estudiantes», «Ver conducta y reportes»
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
import Pantalla from '../../components/Pantalla';
import Lista, { BotonIcono, ItemLista } from '../../components/Lista';
import Campo from '../../components/Campo';
import Selector from '../../components/Selector';
import { Avatar } from '../../components/Basicos';
import { Cargando, ErrorVista, Vacio } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import { hoyISO } from '../../utils/fechas';
import { COLORES } from '../../config/tema';

/**
 * ConductaView (auxiliar): elegir sección y estudiante para registrar un reporte de
 * conducta o revisar su estado (nota de conducta, reportes, anulaciones).
 */
export default function ConductaView({ navigation }) {
  // PISTA: «secciones» = datos que se cargan al abrir la pantalla: AcademicoRepository.secciones() → GET
  //     /academico/secciones (backend: academico_routes.py → secciones()). Úsalos con secciones.datos;
  //     secciones.recargar() vuelve a pedirlos.
  const secciones = useConsulta(() => AcademicoRepository.secciones(), []);
  const [idSeccion, setIdSeccion] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  // PISTA: datos que se cargan al abrir la pantalla (useConsulta): .datos, .cargando, .error, .recargar().
  const alumnos = useConsulta(
    () => (idSeccion ? AsistenciaRepository.alumnosDeSeccion(idSeccion, hoyISO()) : null),
    [idSeccion],
  );

  useEffect(() => {
    if (!idSeccion && secciones.datos?.length) setIdSeccion(secciones.datos[0].id_seccion);
  }, [secciones.datos, idSeccion]);

  if (secciones.cargando) return <Cargando />;
  if (secciones.error) return <ErrorVista error={secciones.error} onReintentar={secciones.recargar} />;

  const texto = busqueda.trim().toLowerCase();

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla>
      <Selector
        opciones={secciones.datos.map((s) => ({ valor: s.id_seccion, texto: `${s.grado} ${s.nombre} · ${s.nivel}` }))}
        valor={idSeccion}
        alCambiar={setIdSeccion}
      />
      <Campo valor={busqueda} alCambiar={setBusqueda} placeholder="Buscar estudiante" />

      {alumnos.cargando ? <Cargando /> : alumnos.error ? (
        <ErrorVista error={alumnos.error} onReintentar={alumnos.recargar} />
      ) : (() => {
        const lista = alumnos.datos.filter((a) => `${a.nombres} ${a.apellidos}`.toLowerCase().includes(texto));
        if (lista.length === 0) return <Vacio icono="people-outline" titulo="Sin estudiantes" />;
        return (
          <Lista>
            {lista.map((a) => {
              const nombre = `${a.nombres} ${a.apellidos}`;
              return (
                <ItemLista
                  key={a.id_alumno}
                  izquierda={<Avatar nombre={nombre} tamano={36} />}
                  titulo={`${a.apellidos}, ${a.nombres}`}
                  subtitulo="Ver conducta y reportes"
                  derecha={(
                    <BotonIcono
                      icono="add-circle"
                      color={COLORES.guinda}
                      etiqueta={`Registrar reporte para ${a.nombres}`}
                      onPress={() => navigation.navigate('RegistrarReporte', { idAlumno: a.id_alumno, nombre })}
                    />
                  )}
                  onPress={() => navigation.navigate('ConductaAlumno', { idAlumno: a.id_alumno, titulo: a.nombres })}
                />
              );
            })}
          </Lista>
        );
      })()}
    </Pantalla>
  );
}
