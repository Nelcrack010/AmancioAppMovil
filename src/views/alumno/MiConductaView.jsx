// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Conducta, Perfil   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: MiConductaView (estudiante): su nota de conducta, la de cada bimestre y sus reportes.
// Pantalla «MiConducta» (src/navigation/pantallas.js): en el menú de ALUMNO («Conducta») (src/config/menus.js)
//
// Datos (repositorio → endpoint → backend):
//   ConductaRepository.miConducta() → GET /perfil/mi-perfil/<username> (backend: perfil_routes.py →
//       mi_perfil()); GET /conducta/alumno/<int:id_alumno> (backend: conducta_routes.py → estado_conducta())
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
import Pantalla from '../../components/Pantalla';
import ResumenConducta from '../../components/ResumenConducta';
import { useSesion } from '../../context/SesionContext';
import useConsulta from '../../viewmodels/useConsulta';
import ConductaRepository from '../../repositories/conductaRepository';

/**
 * MiConductaView (estudiante): su nota de conducta, la de cada bimestre y sus reportes.
 */
export default function MiConductaView() {
  const { usuario } = useSesion();
  // PISTA: «conducta» = datos que se cargan al abrir la pantalla: ConductaRepository.miConducta() → GET
  //     /perfil/mi-perfil/<username> (backend: perfil_routes.py → mi_perfil()); GET
  //     /conducta/alumno/<int:id_alumno> (backend: conducta_routes.py → estado_conducta()). Úsalos con
  //     conducta.datos; conducta.recargar() vuelve a pedirlos.
  const conducta = useConsulta(() => ConductaRepository.miConducta(usuario.username), [usuario.username]);

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla consulta={conducta}>
      {(datos) => <ResumenConducta datos={datos} />}
    </Pantalla>
  );
}
