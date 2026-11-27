// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: general   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: Panel del docente: entregas por calificar, clases de hoy y próximas clases virtuales.
// Se muestra dentro de: InicioView.jsx
// Desde aquí se va a: Cursos, Entregas
// Botones / secciones: «Accesos rápidos», «Clases de hoy», «Entregas por calificar», «Materiales, tareas, clases
//     y registro de notas», «Mis cursos», «Próximas clases virtuales»
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
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import Lista, { ItemLista } from '../../components/Lista';
import { Seccion } from '../../components/Basicos';
import { BloqueHorario, FilaClaseVirtual } from '../../components/Items';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Boton from '../../components/Boton';
import Campo from '../../components/Campo';
import Selector from '../../components/Selector';
import DialogoTexto from '../../components/DialogoTexto';
import { Fila, FilaDatos, Dato, Separador } from '../../components/Basicos';
import { Aviso, Vacio, Cargando } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import useAccion from '../../viewmodels/useAccion';
import AcademicoRepository from '../../repositories/academicoRepository';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import ConductaRepository from '../../repositories/conductaRepository';
import MensajesRepository from '../../repositories/mensajesRepository';
import PerfilRepository from '../../repositories/perfilRepository';
import { useSesion } from '../../context/SesionContext';
import { confirmar, avisar, avisarResultado } from '../../utils/dialogos';
import { validarTexto, validarEnlace, primerError } from '../../utils/validaciones';
import { formatearFecha, formatearFechaHora, hoyISO, esFechaValida, sumarDias } from '../../utils/fechas';
import { infoEstado, ESTADOS_CITA, ESTADOS_TAREA, ESTADOS_REPORTE } from '../../config/estados';
import { COLORES, ESPACIO, RADIO, SOMBRA } from '../../config/tema';
// <<< FIN KIT DE IMPORTS

/** Panel del docente: entregas por calificar, clases de hoy y próximas clases virtuales. */
export default function InicioDocente({ datos, navigation }) {
  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
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
