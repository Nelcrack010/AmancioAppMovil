// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Inicio (panel por rol)   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: Panel de cada rol. Para cambiar lo que ve un rol, se edita su archivo Inicio<Rol>.jsx
// Pantalla «Inicio» (src/navigation/pantallas.js): en el menú de ALUMNO («Inicio»), DOCENTE («Inicio»), AUXILIAR
//     («Inicio»), PSICOLOGO («Inicio»), ADMIN («Inicio») (src/config/menus.js)
//
// Datos (repositorio → endpoint → backend):
//   AcademicoRepository.inicio() → GET /inicio (backend: inicio_routes.py → panel())
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
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import { useSesion } from '../../context/SesionContext';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import { formatearFecha, nombreDia } from '../../utils/fechas';
import { NOMBRES_ROL } from '../../config/estados';
import { COLORES } from '../../config/tema';
import InicioAlumno from './InicioAlumno';
import InicioDocente from './InicioDocente';
import InicioAuxiliar from './InicioAuxiliar';
import InicioPsicologo from './InicioPsicologo';
import InicioAdmin from './InicioAdmin';

/** Panel de cada rol. Para cambiar lo que ve un rol, se edita su archivo Inicio<Rol>.jsx */
const PANELES = {
  ALUMNO: InicioAlumno,
  DOCENTE: InicioDocente,
  AUXILIAR: InicioAuxiliar,
  PSICOLOGO: InicioPsicologo,
  ADMIN: InicioAdmin,
};

/**
 * InicioView: panel de inicio. Usa GET /inicio, que devuelve un resumen distinto
 * según el rol, y muestra el panel que corresponde.
 */
export default function InicioView({ navigation }) {
  const { usuario, fijarContadores } = useSesion();
  // PISTA: «inicio» = datos que se cargan al abrir la pantalla: AcademicoRepository.inicio() → GET /inicio
  //     (backend: inicio_routes.py → panel()). Úsalos con inicio.datos; inicio.recargar() vuelve a pedirlos.
  const inicio = useConsulta(() => AcademicoRepository.inicio(), []);

  // /inicio también trae los no leídos: se aprovechan para los globos del menú.
  useEffect(() => {
    if (inicio.datos) fijarContadores(inicio.datos);
  }, [inicio.datos, fijarContadores]);

  const Panel = PANELES[usuario.rol];

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla consulta={inicio}>
      {(datos) => (
        <>
          {/* Saludo (como el encabezado del campus web) */}
          <Tarjeta destacada>
            <Texto variante="etiqueta" color={COLORES.crema}>{NOMBRES_ROL[datos.rol]}</Texto>
            <Texto variante="titulo" color={COLORES.blanco}>¡Hola, {primerNombre(datos.nombre)}!</Texto>
            <Texto color={COLORES.crema} style={estilos.fecha}>
              {nombreDia(datos.fecha)}, {formatearFecha(datos.fecha)}
            </Texto>
          </Tarjeta>

          {Panel && <Panel datos={datos} navigation={navigation} />}
        </>
      )}
    </Pantalla>
  );
}

const primerNombre = (nombre = '') => nombre.split(' ')[0];

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  fecha: { marginTop: 2 },
});
