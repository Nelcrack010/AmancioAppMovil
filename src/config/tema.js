/**
 * Tema visual de la app: colores, tipografía, espacios y bordes.
 *
 * Los colores son los mismos del campus web del colegio (proyecto ProyectoAmancio):
 *   - guinda  #701C32 → barra lateral del campus web (aquí, la barra de menú inferior)
 *   - azul    #093E7A → botones principales, enlaces y elementos activos
 *   - crema   #FFF1E3 → texto o resaltado sobre fondos guinda
 *
 * Para cambiar el aspecto de TODA la app basta con editar este archivo:
 * ninguna pantalla escribe colores "a mano", todas usan COLORES.xxx.
 */

export const COLORES = {
  // Identidad del colegio
  guinda: '#701C32',
  guindaOscuro: '#5A1628',
  azul: '#093E7A',
  azulOscuro: '#072D5A',
  crema: '#FFF1E3',
  cremaOscuro: '#F8EBDD',

  // Fondos y superficies
  fondo: '#F8FAFC',
  superficie: '#FFFFFF',
  borde: '#E5E7EB',
  bordeSuave: '#F1F5F9',

  // Texto
  texto: '#111418',
  textoSecundario: '#617489',
  textoSuave: '#94A3B8',
  blanco: '#FFFFFF',

  // Estados (avisos, etiquetas de estado)
  exito: '#15803D',
  exitoFondo: '#DCFCE7',
  alerta: '#B45309',
  alertaFondo: '#FEF3C7',
  error: '#B91C1C',
  errorFondo: '#FEE2E2',
  info: '#093E7A',
  infoFondo: '#E0EAF5',
};

/**
 * Fuente Lato (la misma del campus web). Se carga en App.jsx con useFonts.
 * Si se quisiera otra fuente, se cambia aquí y en App.jsx.
 */
export const FUENTES = {
  normal: 'Lato_400Regular',
  negrita: 'Lato_700Bold',
  gruesa: 'Lato_900Black',
};

/** Tamaños de letra usados por el componente <Texto variante="..."> */
export const TAMANOS = {
  titulo: 22,
  subtitulo: 17,
  normal: 15,
  pequeno: 13,
  diminuto: 11,
};

/** Espaciado estándar (márgenes y rellenos). Usar siempre estos valores. */
export const ESPACIO = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

/** Radios de borde (las tarjetas del campus web usan rounded-2xl ≈ 16). */
export const RADIO = {
  sm: 8,
  md: 12,
  lg: 16,
  total: 999,
};

/** Sombra suave para tarjetas (Android usa elevation; iOS/web, shadow*). */
export const SOMBRA = {
  elevation: 2,
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
};
