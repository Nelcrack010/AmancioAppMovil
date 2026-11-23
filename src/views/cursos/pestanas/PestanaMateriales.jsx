// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Aula virtual · Materiales   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: Pestaña "Materiales": archivos y enlaces publicados por el docente. Al tocar un material se abre su
//     enlace. El docente además puede subir, editar y eliminar.
// Se muestra dentro de: CursoDetalleView.jsx
// Desde aquí se va a: Publicar
//
// Datos (repositorio → endpoint → backend):
//   AcademicoRepository.eliminarMaterial() → DELETE /material/item/<int:id_material> (backend:
//       material_routes.py → eliminar())
//   AcademicoRepository.materiales() → GET /material/<int:id_carga> (backend: material_routes.py → listar())
// Botones / secciones: «Publicar material», «Sin materiales»
// Campos: «Editar material», «Eliminar material»
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
import Lista, { BotonIcono, ItemLista } from '../../../components/Lista';
import { Vacio } from '../../../components/Estados';
import { abrirEnlace } from '../../../components/Items';
import useConsulta from '../../../viewmodels/useConsulta';
import AcademicoRepository from '../../../repositories/academicoRepository';
import { avisar, confirmar } from '../../../utils/dialogos';
import { formatearFecha } from '../../../utils/fechas';
import { COLORES } from '../../../config/tema';

/**
 * Pestaña "Materiales": archivos y enlaces publicados por el docente.
 * Al tocar un material se abre su enlace. El docente además puede subir, editar y eliminar.
 */
export default function PestanaMateriales({ idCarga, esDocente, navigation }) {
  // PISTA: «materiales» = datos que se cargan al abrir la pantalla: AcademicoRepository.materiales() → GET
  //     /material/<int:id_carga> (backend: material_routes.py → listar()). Úsalos con materiales.datos;
  //     materiales.recargar() vuelve a pedirlos.
  const materiales = useConsulta(() => AcademicoRepository.materiales(idCarga), [idCarga]);

  const eliminar = async (m) => {
    if (!await confirmar('Eliminar material', `Se eliminará "${m.titulo}".`, { textoAceptar: 'Eliminar', peligroso: true })) return;
    try {
      await AcademicoRepository.eliminarMaterial(m.id_material);
      materiales.recargar();
    } catch (e) {
      avisar('No se pudo eliminar', e.message);
    }
  };

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla
      consulta={materiales}
      pie={esDocente && (
        <Boton titulo="Publicar material" icono="add-circle-outline"
          onPress={() => navigation.navigate('Publicar', { tipo: 'material', idCarga, titulo: 'Nuevo material' })} />
      )}
    >
      {(datos) => (datos.materiales.length === 0 ? (
        <Vacio icono="folder-open-outline" titulo="Sin materiales" mensaje="El docente aún no publicó materiales." />
      ) : (
        <Lista>
          {datos.materiales.map((m) => (
            <ItemLista
              key={m.id_material}
              icono="folder-open"
              colorIcono={COLORES.azul}
              fondoIcono={COLORES.infoFondo}
              titulo={m.titulo}
              subtitulo={m.descripcion}
              detalle={`${m.bimestre}° bimestre · ${formatearFecha(m.fecha_publicacion)}`}
              derecha={esDocente && (
                <View style={estilos.acciones}>
                  <BotonIcono icono="create-outline" etiqueta="Editar material"
                    onPress={() => navigation.navigate('Publicar', { tipo: 'material', idCarga, item: m, titulo: 'Editar material' })} />
                  <BotonIcono icono="trash-outline" color={COLORES.error} etiqueta="Eliminar material" onPress={() => eliminar(m)} />
                </View>
              )}
              onPress={m.archivo_url ? () => abrirEnlace(m.archivo_url) : undefined}
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
