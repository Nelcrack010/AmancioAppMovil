// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Qué es: Estilo común de las cabeceras (barra superior) de todas las pantallas: fondo blanco con el título en
//     guinda, como el HeaderCampus del campus web.
// Lo usan: AppNavigator.jsx, MenuNavigator.jsx
// <<< FIN GUÍA
import { COLORES, FUENTES } from '../config/tema';

/**
 * Estilo común de las cabeceras (barra superior) de todas las pantallas:
 * fondo blanco con el título en guinda, como el HeaderCampus del campus web.
 */
export const OPCIONES_CABECERA = {
  headerStyle: { backgroundColor: COLORES.superficie },
  headerTintColor: COLORES.guinda,              // color de la flecha "volver"
  headerTitleStyle: { fontFamily: FUENTES.negrita, color: COLORES.guinda, fontSize: 18 },
  headerShadowVisible: false,        // cabecera plana: el fondo gris ya la separa del contenido
  contentStyle: { backgroundColor: COLORES.fondo },
};
