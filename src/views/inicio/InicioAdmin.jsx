// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: general   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: Panel del administrador: solo consulta (la gestión se hace en el campus web).
// Se muestra dentro de: InicioView.jsx
// Desde aquí se va a: CatalogoFaltas, ReporteAsistencia
// Botones / secciones: «Catálogo de faltas», «Consultas», «Por sección y fechas; toca un estudiante para ver su
//     conducta», «Reporte de asistencia», «Resumen del colegio», «Tipos de falta y puntos que descuentan»
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
import React from 'react';
import Lista, { ItemLista } from '../../components/Lista';
import { Seccion, Dato, FilaDatos } from '../../components/Basicos';
import { Aviso } from '../../components/Estados';
import { COLORES } from '../../config/tema';

/**
 * Panel del administrador: solo consulta (la gestión se hace en el campus web).
 */
export default function InicioAdmin({ datos, navigation }) {
  const t = datos.totales;
  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <>
      <Seccion titulo="Resumen del colegio" />
      <FilaDatos>
        <Dato valor={t.alumnos_matriculados} rotulo="Estudiantes" />
        <Dato valor={t.docentes} rotulo="Docentes" color={COLORES.azul} />
      </FilaDatos>
      <FilaDatos>
        <Dato valor={t.citas_pendientes} rotulo="Citas pendientes" color={COLORES.alerta} />
        <Dato valor={t.reportes_del_mes} rotulo="Reportes del mes" color={COLORES.error} />
      </FilaDatos>

      <Seccion titulo="Consultas" />
      <Lista>
        <ItemLista
          icono="stats-chart"
          titulo="Reporte de asistencia"
          subtitulo="Por sección y fechas; toca un estudiante para ver su conducta"
          onPress={() => navigation.navigate('ReporteAsistencia')}
        />
        <ItemLista
          icono="list"
          titulo="Catálogo de faltas"
          subtitulo="Tipos de falta y puntos que descuentan"
          onPress={() => navigation.navigate('CatalogoFaltas')}
        />
      </Lista>

      <Aviso tono="info">
        La gestión administrativa (personal, matrícula, estructura académica) se realiza en el campus web.
      </Aviso>
    </>
  );
}
