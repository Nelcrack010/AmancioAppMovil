// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Qué es: Enlaces profundos (deep links): abrir una pantalla de la app desde un enlace como
//     amancioapp://tarea/5  o  amancioapp://chat/3.
// Lo usan: App.jsx
// <<< FIN GUÍA
import * as Linking from 'expo-linking';

/**
 * Enlaces profundos (deep links): abrir una pantalla de la app desde un enlace
 * como  amancioapp://tarea/5  o  amancioapp://chat/3.
 *
 * Las notificaciones push NO usan esto: se abren con src/navigation/abrirNotificacion.js
 * (con la tabla de src/config/notificaciones.js). Aquí solo se define qué ruta de
 * enlace corresponde a cada pantalla.
 *
 * Para agregar un enlace: añade la pantalla con su ruta en `config.screens`.
 * Las pantallas con ":algo" reciben ese valor como parámetro (convertido a número).
 */
const numero = (valor) => Number(valor) || valor;

export const CONFIGURACION_ENLACES = {
  prefixes: [Linking.createURL('/'), 'amancioapp://'],
  config: {
    screens: {
      Login: 'login',
      PrimerIngreso: 'primer-ingreso',
      // Pantallas de la barra de menú (están dentro de 'Menu').
      Menu: {
        initialRouteName: 'Inicio',
        screens: {
          Inicio: 'inicio',
          Cursos: 'cursos',
          MisNotas: 'mis-notas',
          Mensajes: 'mensajes',
          Horario: 'horario',
          MiAsistencia: 'mi-asistencia',
          MiConducta: 'mi-conducta',
          MisCitas: 'mis-citas',
          Notificaciones: 'notificaciones',
          Perfil: 'perfil',
          RegistrarAsistencia: 'registrar-asistencia',
          ReporteAsistencia: 'reporte-asistencia',
          Conducta: 'conducta',
          CatalogoFaltas: 'catalogo-faltas',
          Agenda: 'agenda',
        },
      },
      // Pantallas de detalle que se pueden abrir solo con un id.
      TareaDetalle: { path: 'tarea/:idTarea', parse: { idTarea: numero } },
      Entregas: { path: 'entregas/:idTarea', parse: { idTarea: numero } },
      Chat: { path: 'chat/:idConversacion', parse: { idConversacion: numero } },
      CursoDetalle: { path: 'curso/:idCarga', parse: { idCarga: numero } },
      ConductaAlumno: { path: 'conducta-alumno/:idAlumno', parse: { idAlumno: numero } },
      HistorialAlumno: { path: 'historial-alumno/:idAlumno', parse: { idAlumno: numero } },
      NotasCurso: { path: 'notas-curso/:idCarga', parse: { idCarga: numero } },
      SolicitarCita: 'solicitar-cita',
      Pendientes: 'pendientes',
    },
  },
};
