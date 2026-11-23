// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Conducta   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: Roles que pueden anular reportes (regla del servidor).
// Pantalla «ConductaAlumno» (src/navigation/pantallas.js): pantalla de detalle, título «Conducta del estudiante»
//   Se abre desde: ConductaView.jsx, ReporteAsistenciaView.jsx, PestanaAlumnos.jsx, CitaDetalleView.jsx  con
//       navigation.navigate('ConductaAlumno', {...})
// Desde aquí se va a: HistorialAlumno, RegistrarReporte
//
// Datos (repositorio → endpoint → backend):
//   ConductaRepository.anularReporte() → PATCH /conducta/reportes/<int:id_reporte>/anular (backend:
//       conducta_routes.py → anular_reporte())
//   ConductaRepository.estadoAlumno() → GET /conducta/alumno/<int:id_alumno> (backend: conducta_routes.py →
//       estado_conducta())
// Botones / secciones: «Anular reporte», «Historial de citas», «Registrar reporte»
// Campos: «Motivo de la anulación»
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
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Boton from '../../components/Boton';
import ResumenConducta from '../../components/ResumenConducta';
import DialogoTexto from '../../components/DialogoTexto';
import Texto from '../../components/Texto';
import { useSesion } from '../../context/SesionContext';
import useConsulta from '../../viewmodels/useConsulta';
import ConductaRepository from '../../repositories/conductaRepository';
import { ESPACIO } from '../../config/tema';

/** Roles que pueden anular reportes (regla del servidor). */
const PUEDEN_ANULAR = ['AUXILIAR', 'ADMIN'];

/**
 * ConductaAlumnoView (personal): estado de conducta de un estudiante.
 *   - Auxiliar: puede registrar un reporte nuevo y anular reportes (con motivo).
 *   - Administrador: puede anular reportes.
 *   - Psicólogo: puede ver su historial de citas.
 * params: { idAlumno }
 */
export default function ConductaAlumnoView({ navigation, route }) {
  const { idAlumno } = route.params;
  const { usuario } = useSesion();
  // PISTA: «conducta» = datos que se cargan al abrir la pantalla: ConductaRepository.estadoAlumno() → GET
  //     /conducta/alumno/<int:id_alumno> (backend: conducta_routes.py → estado_conducta()). Úsalos con
  //     conducta.datos; conducta.recargar() vuelve a pedirlos.
  const conducta = useConsulta(() => ConductaRepository.estadoAlumno(idAlumno), [idAlumno]);
  const [porAnular, setPorAnular] = useState(null);   // reporte elegido para anular

  /** Anula el reporte; si el servidor lo rechaza, devuelve el mensaje para el diálogo. */
  const anular = async (motivo) => {
    try {
      await ConductaRepository.anularReporte(porAnular.id_reporte, motivo);
      conducta.recargar();
      return null;
    } catch (e) {
      return e.message;
    }
  };

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <>
      <Pantalla consulta={conducta}>
        {(datos) => {
          const nombre = `${datos.alumno.nombres} ${datos.alumno.apellidos}`;
          return (
            <>
              <Texto variante="subtitulo" style={estilos.nombre}>{nombre}</Texto>
              <View style={estilos.botones}>
                {usuario.rol === 'AUXILIAR' && (
                  <Boton titulo="Registrar reporte" icono="add-circle-outline" variante="guinda"
                    onPress={() => navigation.navigate('RegistrarReporte', { idAlumno, nombre })} />
                )}
                {usuario.rol === 'PSICOLOGO' && (
                  <Boton titulo="Historial de citas" icono="time-outline" variante="secundario"
                    onPress={() => navigation.navigate('HistorialAlumno', { idAlumno, titulo: datos.alumno.nombres })} />
                )}
              </View>
              <ResumenConducta
                datos={datos}
                alAnular={PUEDEN_ANULAR.includes(usuario.rol) ? setPorAnular : undefined}
              />
            </>
          );
        }}
      </Pantalla>

      <DialogoTexto
        visible={Boolean(porAnular)}
        titulo="Anular reporte"
        mensaje={porAnular ? `"${porAnular.falta}". Quedará registrado quién lo anuló y cuándo.` : undefined}
        etiqueta="Motivo de la anulación"
        minimo={5}
        textoAceptar="Anular"
        peligroso
        alAceptar={anular}
        alCerrar={() => setPorAnular(null)}
      />
    </>
  );
}

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  nombre: { marginBottom: ESPACIO.sm },
  botones: { gap: ESPACIO.sm, marginBottom: ESPACIO.md },
});
