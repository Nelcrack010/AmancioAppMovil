import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
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
import { COLORES, ESPACIO, RADIO } from '../../config/tema';

/**
 * RegistrarReporteView (auxiliar): registra un reporte (parte) de conducta: tipo de falta,
 * descripción, fecha y, si hace falta, el enlace a una foto de evidencia.
 * Funciona sin conexión: el reporte queda pendiente y se envía al volver la red.
 * params: { idAlumno, nombre }
 */
export default function RegistrarReporteView({ navigation, route }) {
  const { idAlumno, nombre } = route.params;
  const faltas = useConsulta(() => ConductaRepository.faltas(), []);
  const accion = useAccion();
  const [idFalta, setIdFalta] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [evidencia, setEvidencia] = useState('');
  const [fecha, setFecha] = useState(hoyISO());
  const [errorLocal, setErrorLocal] = useState(null);

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
      navigation.goBack();
    }
  };

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
          {lista.map((f) => {
            const elegida = f.id_falta === idFalta;
            return (
              <Pressable
                key={f.id_falta}
                onPress={() => setIdFalta(f.id_falta)}
                style={[estilos.falta, elegida && estilos.faltaElegida]}
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

const estilos = StyleSheet.create({
  falta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.sm,
    padding: ESPACIO.md,
    marginBottom: ESPACIO.sm,
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.md,
    borderWidth: 1.5,
    borderColor: COLORES.bordeSuave,
  },
  faltaElegida: { borderColor: COLORES.guinda, backgroundColor: COLORES.crema },
  flex: { flex: 1 },
});
