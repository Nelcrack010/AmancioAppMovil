// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: general   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: NotasCursoView (docente): registra o corrige las notas de una evaluación para toda la sección y cierra
//     el bimestre. Funciona sin conexión (las notas quedan pendientes).
// Pantalla «NotasCurso» (src/navigation/pantallas.js): pantalla de detalle, título «Registro de notas»
//   Se abre desde: CursoDetalleView.jsx  con navigation.navigate('NotasCurso', {...})
// Su lógica está en: useNotasCursoViewModel (src/viewmodels)
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
import { StyleSheet, TextInput, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import Selector from '../../components/Selector';
import { Seccion } from '../../components/Basicos';
import { Aviso, Cargando } from '../../components/Estados';
import useNotasCursoViewModel from '../../viewmodels/useNotasCursoViewModel';
import { avisarResultado, confirmar } from '../../utils/dialogos';
import { colorNota } from '../../config/estados';
import { COLORES, ESPACIO, FUENTES, RADIO, SOMBRA } from '../../config/tema';

const BIMESTRES = [1, 2, 3, 4].map((n) => ({ valor: n, texto: `${n}° bim.` }));

/**
 * NotasCursoView (docente): registra o corrige las notas de una evaluación para toda la
 * sección y cierra el bimestre. Funciona sin conexión (las notas quedan pendientes).
 * params: { idCarga }
 */
export default function NotasCursoView({ route }) {
  const vm = useNotasCursoViewModel(route.params.idCarga);

  if (!vm.bimestre) return <Cargando />;

  const guardar = async () => {
    const resultado = await vm.guardar();
    if (resultado) avisarResultado(resultado, 'Las notas se guardaron.');
  };

  const cerrar = async () => {
    const ok = await confirmar(
      `Cerrar ${vm.bimestre}° bimestre`,
      'Los promedios pasarán a la libreta del estudiante y ya no se podrán modificar las notas de este bimestre.',
      { textoAceptar: 'Cerrar bimestre', peligroso: true },
    );
    if (ok) await vm.cerrarBimestre();
  };

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla consulta={vm.notas}>
      {(datos) => (
        <>
          <Selector opciones={BIMESTRES} valor={vm.bimestre} alCambiar={vm.setBimestre} />

          {datos.cerrado ? (
            <Aviso tono="info" icono="lock-closed">Este bimestre está cerrado: sus notas ya están en la libreta.</Aviso>
          ) : (
            <Tarjeta>
              {/* Paso 1: elegir QUÉ evaluación se va a registrar */}
              <Texto variante="etiqueta">Paso 1 · Evaluación</Texto>
              <Campo
                valor={vm.evaluacion}
                alCambiar={vm.escribirEvaluacion}
                placeholder="Nueva, ej. Práctica 2"
                maxLength={20}
                style={estilos.campoEvaluacion}
              />
              {vm.evaluacionesExistentes.length > 0 && (
                <>
                  <Texto variante="diminuto">O toca una existente para corregir sus notas:</Texto>
                  <Selector
                    opciones={vm.evaluacionesExistentes.map((e) => ({ valor: e, texto: e }))}
                    valor={vm.nombreEvaluacion}
                    alCambiar={vm.elegirEvaluacion}
                    style={estilos.pastillas}
                  />
                </>
              )}
              {vm.error && <Aviso tono="error">{vm.error}</Aviso>}
            </Tarjeta>
          )}

          {/* Paso 2: poner las notas de esa evaluación */}
          {!datos.cerrado && (
            vm.evaluacionLista ? (
              <View style={estilos.encabezadoNotas}>
                <Texto variante="etiqueta" color={COLORES.crema}>
                  Paso 2 · {vm.esCorreccion ? 'Corrigiendo' : 'Nueva evaluación'}
                </Texto>
                <Texto variante="subtitulo" color={COLORES.blanco}>Notas de: {vm.nombreEvaluacion}</Texto>
                <Texto variante="diminuto" color={COLORES.crema}>
                  Escribe la nota (0 a 20) en la cajita de cada estudiante. Las vacías no se modifican.
                </Texto>
              </View>
            ) : (
              <Aviso tono="info" icono="arrow-up-circle">
                Primero escribe o elige una evaluación (paso 1). Luego se activan las cajitas de nota.
              </Aviso>
            )
          )}

          <Seccion
            titulo={`Estudiantes (${datos.alumnos.length})`}
            accion={!datos.cerrado && vm.evaluacionLista && (
              <Texto variante="etiqueta" color={COLORES.azul}>{vm.nombreEvaluacion}</Texto>
            )}
          />
          <View style={estilos.listaAlumnos}>
          {datos.alumnos.map((a, i) => (
            <View key={a.id_alumno} style={[estilos.alumno, i > 0 && estilos.conLinea]}>
              <View style={estilos.flex}>
                <Texto negrita>{a.apellidos}, {a.nombres}</Texto>
                <Texto variante="diminuto">
                  {a.evaluaciones.length
                    ? a.evaluaciones.map((e) => `${e.evaluacion}: ${e.valor}`).join(' · ')
                    : 'Sin notas en este bimestre'}
                </Texto>
                <Texto variante="pequeno" negrita color={colorNota(a.promedio)}>
                  Promedio: {a.promedio ?? '—'}
                </Texto>
              </View>
              {!datos.cerrado && (
                <TextInput
                  value={vm.valores[a.id_alumno] ?? ''}
                  onChangeText={(t) => vm.cambiarValor(a.id_alumno, t)}
                  keyboardType="decimal-pad"
                  maxLength={5}
                  placeholder="—"
                  placeholderTextColor={COLORES.textoSuave}
                  // Bloqueada hasta elegir la evaluación (paso 1).
                  editable={vm.evaluacionLista}
                  style={[estilos.nota, !vm.evaluacionLista && estilos.notaBloqueada]}
                  accessibilityLabel={`Nota de ${a.nombres} en ${vm.nombreEvaluacion || 'la evaluación'}`}
                />
              )}
            </View>
          ))}
          </View>

          {!datos.cerrado && (
            <View style={estilos.botones}>
              <Boton
                titulo={vm.evaluacionLista ? `Guardar notas de ${vm.nombreEvaluacion}` : 'Guardar notas'}
                icono="save-outline"
                onPress={guardar}
                cargando={vm.enviando}
                deshabilitado={!vm.evaluacionLista}
              />
              <Boton titulo={`Cerrar ${vm.bimestre}° bimestre`} icono="lock-closed-outline" variante="peligro" onPress={cerrar} />
            </View>
          )}
        </>
      )}
    </Pantalla>
  );
}

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  // Todos los estudiantes en una sola tarjeta, separados por líneas finas.
  listaAlumnos: { backgroundColor: COLORES.superficie, borderRadius: RADIO.lg, ...SOMBRA },
  alumno: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.md, padding: ESPACIO.md },
  conLinea: { borderTopWidth: 1, borderTopColor: COLORES.linea },
  flex: { flex: 1, gap: 2 },
  nota: {
    width: 64,
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORES.azul,
    borderRadius: RADIO.md,
    textAlign: 'center',
    fontFamily: FUENTES.negrita,
    fontSize: 18,
    color: COLORES.azul,
    backgroundColor: COLORES.superficie,
  },
  // Cajita gris mientras no se haya elegido la evaluación.
  notaBloqueada: { borderColor: COLORES.borde, backgroundColor: COLORES.bordeSuave },
  campoEvaluacion: { marginTop: ESPACIO.xs },
  pastillas: { marginTop: ESPACIO.xs },
  // Franja guinda que dice a qué evaluación pertenecen las cajitas.
  encabezadoNotas: {
    backgroundColor: COLORES.guinda,
    borderRadius: RADIO.md,
    padding: ESPACIO.md,
    gap: 2,
    marginBottom: ESPACIO.sm,
  },
  botones: { gap: ESPACIO.sm, marginTop: ESPACIO.md },
});
