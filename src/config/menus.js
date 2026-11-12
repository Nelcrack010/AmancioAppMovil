/**
 * Opciones del menú (barra inferior) de cada rol.
 *
 * En el campus web cada rol tenía un menú lateral (aside). En el celular se usa una
 * barra de menú inferior: las primeras MAXIMO_EN_BARRA opciones se ven siempre y el
 * resto aparece al tocar "Más".
 *
 * Cada opción tiene:
 *   - pantalla: nombre de la pantalla registrada en src/navigation/pantallas.js
 *   - titulo:   texto que se muestra en la barra y en la cabecera
 *   - icono:    nombre de un ícono de Ionicons (https://icons.expo.fyi). Activo se usa
 *               el ícono relleno y, inactivo, su versión "-outline".
 *   - contador: (opcional) 'mensajes' o 'notificaciones' para mostrar un globo con
 *               la cantidad de no leídos.
 *
 * Para agregar, quitar o reordenar opciones de un rol solo se edita esta lista.
 */

/** Cuántas opciones caben en la barra antes de agrupar el resto en "Más". */
export const MAXIMO_EN_BARRA = 4;

// Opciones que comparten todos los roles (van al final, dentro de "Más").
const NOTIFICACIONES = { pantalla: 'Notificaciones', titulo: 'Avisos', icono: 'notifications', contador: 'notificaciones' };
const PERFIL = { pantalla: 'Perfil', titulo: 'Mi perfil', icono: 'person' };
const MENSAJES = { pantalla: 'Mensajes', titulo: 'Mensajes', icono: 'chatbubbles', contador: 'mensajes' };
const INICIO = { pantalla: 'Inicio', titulo: 'Inicio', icono: 'home' };

export const MENU_POR_ROL = {
  ALUMNO: [
    INICIO,
    { pantalla: 'Cursos', titulo: 'Cursos', icono: 'book' },
    { pantalla: 'MisNotas', titulo: 'Notas', icono: 'ribbon' },
    MENSAJES,
    { pantalla: 'Horario', titulo: 'Horario', icono: 'calendar' },
    { pantalla: 'MiAsistencia', titulo: 'Asistencia', icono: 'checkmark-done' },
    { pantalla: 'MiConducta', titulo: 'Conducta', icono: 'shield-checkmark' },
    { pantalla: 'MisCitas', titulo: 'Citas psicología', icono: 'heart' },
    NOTIFICACIONES,
    PERFIL,
  ],

  DOCENTE: [
    INICIO,
    { pantalla: 'Cursos', titulo: 'Mis cursos', icono: 'book' },
    { pantalla: 'Horario', titulo: 'Horario', icono: 'calendar' },
    MENSAJES,
    NOTIFICACIONES,
    PERFIL,
  ],

  AUXILIAR: [
    INICIO,
    { pantalla: 'RegistrarAsistencia', titulo: 'Asistencia', icono: 'checkmark-done' },
    { pantalla: 'Conducta', titulo: 'Conducta', icono: 'shield-checkmark' },
    MENSAJES,
    { pantalla: 'ReporteAsistencia', titulo: 'Reporte de asistencia', icono: 'stats-chart' },
    { pantalla: 'CatalogoFaltas', titulo: 'Catálogo de faltas', icono: 'list' },
    NOTIFICACIONES,
    PERFIL,
  ],

  PSICOLOGO: [
    INICIO,
    { pantalla: 'Agenda', titulo: 'Agenda', icono: 'calendar' },
    MENSAJES,
    { pantalla: 'CatalogoFaltas', titulo: 'Faltas', icono: 'list' },
    NOTIFICACIONES,
    PERFIL,
  ],

  // El administrador solo consulta en el móvil (la gestión sigue en la web).
  ADMIN: [
    INICIO,
    { pantalla: 'ReporteAsistencia', titulo: 'Asistencia', icono: 'stats-chart' },
    MENSAJES,
    { pantalla: 'CatalogoFaltas', titulo: 'Faltas', icono: 'list' },
    NOTIFICACIONES,
    PERFIL,
  ],
};
