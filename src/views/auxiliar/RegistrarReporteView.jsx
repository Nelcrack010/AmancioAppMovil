// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Conducta   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: RegistrarReporteView (auxiliar): registra un reporte (parte) de conducta: tipo de falta, descripción,
//     fecha y, si hace falta, el enlace a una foto de evidencia. Funciona sin conexión: el reporte queda
//     pendiente y se envía al volver la red.
// Pantalla «RegistrarReporte» (src/navigation/pantallas.js): pantalla de detalle, título «Registrar reporte»
//   Se abre desde: ConductaAlumnoView.jsx, ConductaView.jsx  con navigation.navigate('RegistrarReporte', {...})
// Desde aquí se va a: Menu
//
// Datos (repositorio → endpoint → backend):
//   ConductaRepository.faltas() → GET /conducta/faltas (backend: conducta_routes.py → faltas())
//   ConductaRepository.registrarReporte() → POST /conducta/reportes (backend: conducta_routes.py →
//       registrar_reporte()) · sin conexión: queda en cola
// Botones / secciones: «Detalle», «Registrar reporte», «Tipo de falta»
// Campos: «Descripción del suceso», «Enlace de la foto de evidencia (opcional)», «Fecha»
// Validación local (antes de enviar): la descripción minimo: 5, maximo: 1000; el enlace de la evidencia
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
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import Etiqueta from '../../components/Etiqueta';
import { Seccion } from '../../components/Basicos';
import { Aviso } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import useAccion from '../../viewmodels/useAccion';
import ConductaRepository from '../../repositories/conductaRepository';
import { avisarResultado } from '../../utils/dialogos';
import { esFechaValida, hoyISO } from '../../utils/fechas';
import { primerError, validarEnlace, validarTexto } from '../../utils/validaciones';
import { TIPOS_FALTA } from '../../config/estados';
import { COLORES, ESPACIO, RADIO, SOMBRA } from '../../config/tema';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useEffect, useCallback, useMemo } from 'react';
import Selector from '../../components/Selector';
import DialogoTexto from '../../components/DialogoTexto';
import Lista from '../../components/Lista';
import { ItemLista } from '../../components/Lista';
import { Fila, FilaDatos, Dato, Separador } from '../../components/Basicos';
import { Vacio, Cargando } from '../../components/Estados';
import AcademicoRepository from '../../repositories/academicoRepository';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import MensajesRepository from '../../repositories/mensajesRepository';
import PerfilRepository from '../../repositories/perfilRepository';
import { useSesion } from '../../context/SesionContext';
import { confirmar, avisar } from '../../utils/dialogos';
import { formatearFecha, formatearFechaHora, sumarDias } from '../../utils/fechas';
import { infoEstado, ESTADOS_CITA, ESTADOS_TAREA, ESTADOS_REPORTE } from '../../config/estados';
// <<< FIN KIT DE IMPORTS

/**
 * RegistrarReporteView (auxiliar): registra un reporte (parte) de conducta: tipo de falta,
 * descripción, fecha y, si hace falta, el enlace a una foto de evidencia.
 * Funciona sin conexión: el reporte queda pendiente y se envía al volver la red.
 * params: { idAlumno, nombre }
 */
export default function RegistrarReporteView({ navigation, route }) {
  const { idAlumno, nombre } = route.params;
  // PISTA: «faltas» = datos que se cargan al abrir la pantalla: ConductaRepository.faltas() → GET
  //     /conducta/faltas (backend: conducta_routes.py → faltas()). Úsalos con faltas.datos; faltas.recargar()
  //     vuelve a pedirlos.
  const faltas = useConsulta(() => ConductaRepository.faltas(), []);
  // PISTA: acción de guardar/enviar: accion.ejecutar(() => Repo.metodo(...)) devuelve { ok, resultado };
  //     accion.enviando = cargando; accion.error = mensaje de la API.
  const accion = useAccion();
  const [idFalta, setIdFalta] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [evidencia, setEvidencia] = useState('');
  const [fecha, setFecha] = useState(hoyISO());
  const [errorLocal, setErrorLocal] = useState(null);

  // PISTA: registrar() se ejecuta al tocar el botón «Registrar reporte».
  const registrar = async () => {
    const error = primerError(
      !idFalta ? 'Elige el tipo de falta.' : null,
      validarTexto(descripcion, 'la descripción', { minimo: 5, maximo: 1000 }),
      validarEnlace(evidencia, 'el enlace de la evidencia'),
      !esFechaValida(fecha) ? 'La fecha debe tener el formato AAAA-MM-DD.' : null,
      fecha > hoyISO() ? 'La fecha no puede ser futura.' : null,
    );
    setErrorLocal(error);
    if (error) return;

    const falta = faltas.datos.find((f) => f.id_falta === idFalta);
    const r = await accion.ejecutar(() => ConductaRepository.registrarReporte({
      id_alumno: idAlumno,
      id_falta: idFalta,
      descripcion: descripcion.trim(),
      evidencia_url: evidencia.trim() || null,
      fecha,
    }, `Reporte de conducta: ${nombre} (${falta.nombre})`));
    if (r.ok) {
      avisarResultado(r.resultado, 'El reporte fue registrado. El estudiante recibirá un aviso.');
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Menu');
      }
    }
  };

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla
      consulta={faltas}
      pie={<Boton titulo="Registrar reporte" icono="save-outline" variante="guinda" onPress={registrar} cargando={accion.enviando} />}
    >
      {(lista) => (
        <>
          <Texto variante="subtitulo">{nombre}</Texto>
          {(errorLocal || accion.error) && <Aviso tono="error">{errorLocal || accion.error}</Aviso>}

          <Seccion titulo="Tipo de falta" />
          <View style={estilos.listaFaltas}>
          {lista.map((f, i) => {
            const elegida = f.id_falta === idFalta;
            return (
              <Pressable
                key={f.id_falta}
                onPress={() => setIdFalta(f.id_falta)}
                style={[estilos.falta, i > 0 && estilos.conLinea, elegida && estilos.faltaElegida]}
                accessibilityRole="radio"
                accessibilityState={{ checked: elegida }}
              >
                <Ionicons name={elegida ? 'radio-button-on' : 'radio-button-off'} size={20}
                  color={elegida ? COLORES.guinda : COLORES.textoSuave} />
                <Texto style={estilos.flex}>{f.nombre}</Texto>
                <Etiqueta texto={`${f.tipo} · −${f.puntos}`} tono={TIPOS_FALTA[f.tipo]?.tono || 'neutro'} />
              </Pressable>
            );
          })}
          </View>

          <Seccion titulo="Detalle" />
          <Tarjeta>
            <Campo etiqueta="Descripción del suceso" valor={descripcion} alCambiar={setDescripcion} multilinea maxLength={1000} />
            <Campo etiqueta="Fecha" valor={fecha} alCambiar={setFecha} placeholder="AAAA-MM-DD" maxLength={10} />
            <Campo
              etiqueta="Enlace de la foto de evidencia (opcional)"
              valor={evidencia}
              alCambiar={setEvidencia}
              placeholder="https://..."
              autoCapitalize="none"
              keyboardType="url"
            />
          </Tarjeta>
        </>
      )}
    </Pantalla>
  );
}

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  // Todas las faltas en una sola tarjeta; la elegida se pinta de crema.
  listaFaltas: { backgroundColor: COLORES.superficie, borderRadius: RADIO.lg, overflow: 'hidden', ...SOMBRA },
  falta: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.sm, padding: ESPACIO.md },
  conLinea: { borderTopWidth: 1, borderTopColor: COLORES.linea },
  faltaElegida: { backgroundColor: COLORES.crema },
  flex: { flex: 1 },
});
