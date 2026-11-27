// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: general   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: RegistrarAsistenciaView (auxiliar): registro diario de asistencia de una sección. Todos empiezan como
//     presentes; el registro solo se guarda al CONFIRMAR, y la app avisa si se intenta salir sin guardar.
//     Funciona sin conexión. params opcionales: { idSeccion } (desde el inicio)
// Pantalla «RegistrarAsistencia» (src/navigation/pantallas.js): en el menú de AUXILIAR («Asistencia»)
//     (src/config/menus.js)
//   Se abre desde: InicioAuxiliar.jsx  con navigation.navigate('RegistrarAsistencia', {...})
// Su lógica está en: useRegistroAsistenciaViewModel (src/viewmodels)
// Botones / secciones: «Sección sin estudiantes matriculados», «Todos presentes»
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
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Pantalla from '../../components/Pantalla';
import Texto from '../../components/Texto';
import Boton from '../../components/Boton';
import Selector from '../../components/Selector';
import { Seccion } from '../../components/Basicos';
import { Aviso, Cargando, ErrorVista, Vacio } from '../../components/Estados';
import useRegistroAsistenciaViewModel from '../../viewmodels/useRegistroAsistenciaViewModel';
import { useGuardiaSalida } from '../../navigation/guardiaSalida';
import { avisarResultado, confirmar } from '../../utils/dialogos';
import { formatearFecha, hoyISO, nombreDia, sumarDias } from '../../utils/fechas';
import { ESTADOS_ASISTENCIA, botonAsistenciaActivo } from '../../config/estados';
import { COLORES, ESPACIO, RADIO, SOMBRA } from '../../config/tema';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useState, useEffect, useCallback, useMemo } from 'react';
import Tarjeta from '../../components/Tarjeta';
import Campo from '../../components/Campo';
import Etiqueta from '../../components/Etiqueta';
import DialogoTexto from '../../components/DialogoTexto';
import Lista from '../../components/Lista';
import { ItemLista } from '../../components/Lista';
import { Fila, FilaDatos, Dato, Separador } from '../../components/Basicos';
import useConsulta from '../../viewmodels/useConsulta';
import useAccion from '../../viewmodels/useAccion';
import AcademicoRepository from '../../repositories/academicoRepository';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import ConductaRepository from '../../repositories/conductaRepository';
import MensajesRepository from '../../repositories/mensajesRepository';
import PerfilRepository from '../../repositories/perfilRepository';
import { useSesion } from '../../context/SesionContext';
import { avisar } from '../../utils/dialogos';
import { validarTexto, validarEnlace, primerError } from '../../utils/validaciones';
import { formatearFechaHora, esFechaValida } from '../../utils/fechas';
import { infoEstado, ESTADOS_CITA, ESTADOS_TAREA, ESTADOS_REPORTE } from '../../config/estados';
// <<< FIN KIT DE IMPORTS

const ESTADOS = ['P', 'T', 'F', 'J'];
const COLOR_ESTADO = { P: COLORES.exito, T: COLORES.alerta, F: COLORES.error, J: COLORES.azul };

/**
 * RegistrarAsistenciaView (auxiliar): registro diario de asistencia de una sección.
 * Todos empiezan como presentes; el registro solo se guarda al CONFIRMAR, y la app
 * avisa si se intenta salir sin guardar. Funciona sin conexión.
 * params opcionales: { idSeccion } (desde el inicio)
 */
export default function RegistrarAsistenciaView({ route }) {
  const vm = useRegistroAsistenciaViewModel(route.params?.idSeccion);
  useGuardiaSalida(vm.hayCambios, 'La asistencia que marcaste aún no se ha guardado.');

  /** Antes de cambiar de sección o fecha, avisar si hay marcas sin guardar. */
  const conPermiso = (accion) => async (valor) => {
    if (vm.hayCambios && !await confirmar('Cambios sin guardar', 'Se perderán las marcas que hiciste.', { textoAceptar: 'Continuar', peligroso: true })) return;
    accion(valor);
  };

  // PISTA: confirmarRegistro() se ejecuta al tocar el botón «Confirmar asistencia».
  const confirmarRegistro = async () => {
    const r = vm.resumen;
    const ok = await confirmar(
      'Confirmar asistencia',
      `${nombreDia(vm.fecha)} ${formatearFecha(vm.fecha)}\nPresentes: ${r.P} · Tardanzas: ${r.T} · Faltas: ${r.F} · Justificadas: ${r.J}`,
      { textoAceptar: 'Guardar' },
    );
    if (!ok) return;
    const resultado = await vm.confirmar();
    if (resultado) avisarResultado(resultado, 'La asistencia quedó registrada.');
  };

  if (vm.secciones.cargando) return <Cargando />;
  if (vm.secciones.error) return <ErrorVista error={vm.secciones.error} onReintentar={vm.secciones.recargar} />;

  const esHoy = vm.fecha === hoyISO();

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla
      pie={vm.alumnos.datos?.length > 0 && (
        <Boton
          titulo={vm.registrado.datos?.registrada ? 'Confirmar corrección' : 'Confirmar asistencia'}
          icono="checkmark-done-outline"
          onPress={confirmarRegistro}
          cargando={vm.enviando}
        />
      )}
    >
      {/* 1. Sección */}
      <Selector
        opciones={(vm.secciones.datos || []).map((s) => ({ valor: s.id_seccion, texto: `${s.grado} ${s.nombre} · ${s.nivel}` }))}
        valor={vm.idSeccion}
        alCambiar={conPermiso(vm.elegirSeccion)}
      />

      {/* 2. Fecha: día anterior / siguiente (no se permite una fecha futura) */}
      <View style={estilos.fecha}>
        <Pressable onPress={() => conPermiso(vm.elegirFecha)(sumarDias(vm.fecha, -1))} style={estilos.flecha} accessibilityLabel="Día anterior">
          <Ionicons name="chevron-back" size={22} color={COLORES.azul} />
        </Pressable>
        <View style={estilos.centro}>
          <Texto negrita>{nombreDia(vm.fecha)}, {formatearFecha(vm.fecha)}</Texto>
          {esHoy && <Texto variante="diminuto">Hoy</Texto>}
        </View>
        <Pressable
          onPress={() => conPermiso(vm.elegirFecha)(sumarDias(vm.fecha, 1))}
          disabled={esHoy}
          style={[estilos.flecha, esHoy && estilos.inactivo]}
          accessibilityLabel="Día siguiente"
        >
          <Ionicons name="chevron-forward" size={22} color={COLORES.azul} />
        </Pressable>
      </View>

      {vm.registrado.datos?.registrada && !vm.hayCambios && (
        <Aviso tono="exito">La asistencia de este día ya está registrada. Puedes corregirla y volver a confirmar.</Aviso>
      )}
      {vm.registrado.aviso && <Aviso tono="alerta" icono="cloud-offline">{vm.registrado.aviso}</Aviso>}
      {vm.registrado.error && (
        <Aviso tono="alerta" icono="cloud-offline">
          No se pudo revisar si este día ya tenía asistencia ({vm.registrado.error.message}). Si confirmas,
          lo que marques reemplazará lo que hubiera registrado.
        </Aviso>
      )}
      {vm.hayCambios && <Aviso tono="alerta">Tienes cambios sin guardar.</Aviso>}
      {vm.error && <Aviso tono="error">{vm.error}</Aviso>}

      {/* 3. Estudiantes */}
      {vm.alumnos.cargando ? <Cargando mensaje="Cargando estudiantes..." /> : vm.alumnos.error ? (
        <ErrorVista error={vm.alumnos.error} onReintentar={vm.alumnos.recargar} />
      ) : vm.alumnos.datos.length === 0 ? (
        <Vacio icono="people-outline" titulo="Sección sin estudiantes matriculados" />
      ) : (
        <>
          <Seccion
            titulo={`Estudiantes (${vm.alumnos.datos.length})`}
            accion={<Boton titulo="Todos presentes" variante="texto" pequeno onPress={() => vm.marcarTodos('P')} />}
          />
          <View style={estilos.listaAlumnos}>
          {vm.alumnos.datos.map((a, i) => (
            <View key={a.id_alumno} style={[estilos.alumno, i > 0 && estilos.conLinea]}>
              <Texto style={estilos.nombre} numberOfLines={2}>{i + 1}. {a.apellidos}, {a.nombres}</Texto>
              <View style={estilos.estados}>
                {ESTADOS.map((e) => {
                  // En una justificada se ven marcados J y la T o F que se justificó.
                  const activo = botonAsistenciaActivo(vm.marcas[a.id_alumno], e);
                  return (
                    <Pressable
                      key={e}
                      onPress={() => vm.marcar(a.id_alumno, e)}
                      style={[estilos.estado, activo && { backgroundColor: COLOR_ESTADO[e], borderColor: COLOR_ESTADO[e] }]}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: activo }}
                      accessibilityLabel={`${a.nombres}: ${ESTADOS_ASISTENCIA[e].texto}`}
                    >
                      <Texto negrita color={activo ? COLORES.blanco : COLORES.textoSecundario}>{e}</Texto>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
          </View>
          <Texto variante="diminuto" centrado>P: presente · T: tardanza · F: falta · J: justificada</Texto>
          <Texto variante="diminuto" centrado style={estilos.ayuda}>
            Para justificar, toca J sobre una T o F: quedan marcadas las dos. Toca J otra vez para quitarla.
          </Texto>
        </>
      )}
    </Pantalla>
  );
}

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  fecha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.lg,
    marginBottom: ESPACIO.md,
    ...SOMBRA,
  },
  flecha: { padding: ESPACIO.md },
  inactivo: { opacity: 0.3 },
  centro: { flex: 1, alignItems: 'center' },
  // Todos los estudiantes en una sola tarjeta, separados por líneas finas.
  listaAlumnos: { backgroundColor: COLORES.superficie, borderRadius: RADIO.lg, marginBottom: ESPACIO.md, ...SOMBRA },
  alumno: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.sm,
    paddingVertical: ESPACIO.sm + 2,
    paddingHorizontal: ESPACIO.md,
  },
  conLinea: { borderTopWidth: 1, borderTopColor: COLORES.linea },
  nombre: { flex: 1 },
  ayuda: { marginTop: 2, marginBottom: ESPACIO.sm },
  estados: { flexDirection: 'row', gap: 6 },
  estado: {
    width: 38,
    height: 38,
    borderRadius: RADIO.sm,
    borderWidth: 1.5,
    borderColor: COLORES.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
