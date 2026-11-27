// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Aula virtual · Clases virtuales   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: Pestaña "Clases virtuales": enlaces de las clases (Meet, Zoom...). Al tocar una se abre. El docente
//     además puede programar, editar y eliminar clases.
// Se muestra dentro de: CursoDetalleView.jsx
// Desde aquí se va a: Publicar
//
// Datos (repositorio → endpoint → backend):
//   AcademicoRepository.clases() → GET /clases/<int:id_carga> (backend: clase_routes.py → listar())
//   AcademicoRepository.eliminarClase() → DELETE /clases/item/<int:id_clase> (backend: clase_routes.py →
//       eliminar())
// Botones / secciones: «Programar clase», «Sin clases virtuales»
// Campos: «Editar clase», «Eliminar clase»
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
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../../components/Pantalla';
import Boton from '../../../components/Boton';
import Lista, { BotonIcono } from '../../../components/Lista';
import { Vacio } from '../../../components/Estados';
import { FilaClaseVirtual } from '../../../components/Items';
import useConsulta from '../../../viewmodels/useConsulta';
import AcademicoRepository from '../../../repositories/academicoRepository';
import { avisar, confirmar } from '../../../utils/dialogos';
import { COLORES } from '../../../config/tema';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Tarjeta from '../../../components/Tarjeta';
import Texto from '../../../components/Texto';
import Campo from '../../../components/Campo';
import Etiqueta from '../../../components/Etiqueta';
import Selector from '../../../components/Selector';
import DialogoTexto from '../../../components/DialogoTexto';
import { ItemLista } from '../../../components/Lista';
import { Seccion, Fila, FilaDatos, Dato, Separador } from '../../../components/Basicos';
import { Aviso, Cargando } from '../../../components/Estados';
import useAccion from '../../../viewmodels/useAccion';
import AsistenciaRepository from '../../../repositories/asistenciaRepository';
import ConductaRepository from '../../../repositories/conductaRepository';
import MensajesRepository from '../../../repositories/mensajesRepository';
import PerfilRepository from '../../../repositories/perfilRepository';
import { useSesion } from '../../../context/SesionContext';
import { avisarResultado } from '../../../utils/dialogos';
import { validarTexto, validarEnlace, primerError } from '../../../utils/validaciones';
import { formatearFecha, formatearFechaHora, hoyISO, esFechaValida, sumarDias } from '../../../utils/fechas';
import { infoEstado, ESTADOS_CITA, ESTADOS_TAREA, ESTADOS_REPORTE } from '../../../config/estados';
import { ESPACIO, RADIO, SOMBRA } from '../../../config/tema';
// <<< FIN KIT DE IMPORTS

/**
 * Pestaña "Clases virtuales": enlaces de las clases (Meet, Zoom...). Al tocar una se abre.
 * El docente además puede programar, editar y eliminar clases.
 */
export default function PestanaClases({ idCarga, esDocente, navigation }) {
  // PISTA: «clases» = datos que se cargan al abrir la pantalla: AcademicoRepository.clases() → GET
  //     /clases/<int:id_carga> (backend: clase_routes.py → listar()). Úsalos con clases.datos; clases.recargar()
  //     vuelve a pedirlos.
  const clases = useConsulta(() => AcademicoRepository.clases(idCarga), [idCarga]);

  const eliminar = async (c) => {
    if (!await confirmar('Eliminar clase', `Se eliminará la clase "${c.tema || 'sin tema'}".`, { textoAceptar: 'Eliminar', peligroso: true })) return;
    try {
      await AcademicoRepository.eliminarClase(c.id_clase_virtual);
      clases.recargar();
    } catch (e) {
      avisar('No se pudo eliminar', e.message);
    }
  };

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla
      consulta={clases}
      pie={esDocente && (
        <Boton titulo="Programar clase" icono="add-circle-outline"
          onPress={() => navigation.navigate('Publicar', { tipo: 'clase', idCarga, titulo: 'Nueva clase virtual' })} />
      )}
    >
      {(datos) => (datos.clases.length === 0 ? (
        <Vacio icono="videocam-outline" titulo="Sin clases virtuales" mensaje="No hay clases virtuales programadas." />
      ) : (
        <Lista>
          {datos.clases.map((c) => (
            <FilaClaseVirtual
              key={c.id_clase_virtual}
              clase={c}
              acciones={esDocente && (
                <View style={estilos.acciones}>
                  <BotonIcono icono="create-outline" etiqueta="Editar clase"
                    onPress={() => navigation.navigate('Publicar', { tipo: 'clase', idCarga, item: c, titulo: 'Editar clase' })} />
                  <BotonIcono icono="trash-outline" color={COLORES.error} etiqueta="Eliminar clase" onPress={() => eliminar(c)} />
                </View>
              )}
            />
          ))}
        </Lista>
      ))}
    </Pantalla>
  );
}

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  acciones: { flexDirection: 'row' },
});
