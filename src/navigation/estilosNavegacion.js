import { COLORES, FUENTES } from '../config/tema';

/**
 * Estilo común de las cabeceras (barra superior) de todas las pantallas:
 * fondo blanco con el título en guinda, como el HeaderCampus del campus web.
 */
export const OPCIONES_CABECERA = {
  headerStyle: { backgroundColor: COLORES.superficie },
  headerTintColor: COLORES.guinda,              // color de la flecha "volver"
  headerTitleStyle: { fontFamily: FUENTES.negrita, color: COLORES.guinda, fontSize: 18 },
  headerShadowVisible: true,
  contentStyle: { backgroundColor: COLORES.fondo },
};
