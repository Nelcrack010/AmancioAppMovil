// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: general   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: Panel del auxiliar: secciones sin asistencia registrada hoy y reportes del día.
// Se muestra dentro de: InicioView.jsx
// Desde aquí se va a: Conducta, RegistrarAsistencia, ReporteAsistencia
// Botones / secciones: «Accesos rápidos», «Asistencia pendiente de hoy», «Elige la sección y el estudiante»,
//     «Registrar un reporte de conducta», «Reporte de asistencia», «Resumen por sección y rango de fechas»
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

/** Panel del auxiliar: secciones sin asistencia registrada hoy y reportes del día. */
export default function InicioAuxiliar({ datos, navigation }) {
  const pendientes = datos.secciones_sin_asistencia_hoy;

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <>
      <FilaDatos>
        <Dato valor={pendientes.length} rotulo="Secciones sin asistencia" color={COLORES.alerta} />
        <Dato valor={datos.reportes_de_hoy} rotulo="Reportes de hoy" />
      </FilaDatos>

      <Seccion titulo="Asistencia pendiente de hoy" />
      {pendientes.length === 0 ? (
        <Aviso tono="exito">Todas las secciones tienen la asistencia de hoy registrada.</Aviso>
      ) : (
        <Lista>
          {pendientes.map((s) => (
            <ItemLista
              key={s.id_seccion}
              icono="checkmark-done"
              colorIcono={COLORES.alerta}
              fondoIcono={COLORES.alertaFondo}
              titulo={s.seccion}
              subtitulo={`${s.alumnos} estudiante(s) · toca para registrar`}
              onPress={() => navigation.navigate('RegistrarAsistencia', { idSeccion: s.id_seccion })}
            />
          ))}
        </Lista>
      )}

      <Seccion titulo="Accesos rápidos" />
      <Lista>
        <ItemLista
          icono="shield-checkmark"
          titulo="Registrar un reporte de conducta"
          subtitulo="Elige la sección y el estudiante"
          onPress={() => navigation.navigate('Conducta')}
        />
        <ItemLista
          icono="stats-chart"
          titulo="Reporte de asistencia"
          subtitulo="Resumen por sección y rango de fechas"
          onPress={() => navigation.navigate('ReporteAsistencia')}
        />
      </Lista>
    </>
  );
}
