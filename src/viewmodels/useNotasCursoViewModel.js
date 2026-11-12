import { useCallback, useEffect, useState } from 'react';
import useConsulta from './useConsulta';
import useAccion from './useAccion';
import AcademicoRepository from '../repositories/academicoRepository';
import { aNumero, validarNota, validarTexto } from '../utils/validaciones';
import { bimestreActual } from '../utils/fechas';

/**
 * useNotasCursoViewModel: registro de notas del docente para un curso.
 *
 * Flujo: elegir bimestre → escribir el nombre de la evaluación (o tocar una existente
 * para corregirla) → poner la nota de cada estudiante → Guardar. El docente cierra el
 * bimestre cuando termina; después ya no se puede modificar.
 */
export function useNotasCursoViewModel(idCarga) {
  const anio = useConsulta(() => AcademicoRepository.anioActivo(), []);
  const [bimestre, setBimestre] = useState(null);
  const notas = useConsulta(
    () => (bimestre ? AcademicoRepository.notasDelCurso(idCarga, bimestre) : null),
    [idCarga, bimestre],
  );
  const accion = useAccion();

  const [evaluacion, setEvaluacion] = useState('');
  const [valores, setValores] = useState({});      // { id_alumno: "15" }
  const [errorLocal, setErrorLocal] = useState(null);

  // Empezar en el bimestre en curso.
  useEffect(() => {
    if (!bimestre && anio.datos) setBimestre(bimestreActual(anio.datos.bimestres));
  }, [anio.datos, bimestre]);

  // Al cambiar de bimestre, limpiar el formulario.
  useEffect(() => {
    setEvaluacion('');
    setValores({});
    setErrorLocal(null);
  }, [bimestre]);

  /** Nombres de las evaluaciones que ya existen en el bimestre ("Práctica 1", "Examen"...). */
  const evaluacionesExistentes = [...new Set(
    (notas.datos?.alumnos || []).flatMap((a) => a.evaluaciones.map((e) => e.evaluacion)),
  )];

  /** Elegir una evaluación existente: carga sus notas para corregirlas. */
  const elegirEvaluacion = useCallback((nombre) => {
    setEvaluacion(nombre);
    const nuevos = {};
    (notas.datos?.alumnos || []).forEach((a) => {
      const encontrada = a.evaluaciones.find((e) => e.evaluacion === nombre);
      if (encontrada) nuevos[a.id_alumno] = String(encontrada.valor);
    });
    setValores(nuevos);
  }, [notas.datos]);

  /**
   * Escribir el nombre de la evaluación a mano.
   *   - Si coincide con una que ya existe, se cargan sus notas (es una corrección).
   *   - Si antes estaba elegida una existente y se cambia el nombre, se vacían las
   *     cajitas: así no se copian por error las notas de otra evaluación.
   */
  const escribirEvaluacion = (texto) => {
    if (evaluacionesExistentes.includes(texto.trim())) {
      elegirEvaluacion(texto.trim());
      setEvaluacion(texto);
      return;
    }
    if (evaluacionesExistentes.includes(evaluacion.trim())) setValores({});
    setEvaluacion(texto);
  };

  /** ¿Ya hay una evaluación elegida? Hasta entonces las cajitas de nota están bloqueadas. */
  const nombreEvaluacion = evaluacion.trim();
  const evaluacionLista = nombreEvaluacion.length >= 2;
  const esCorreccion = evaluacionesExistentes.includes(nombreEvaluacion);

  const cambiarValor = (idAlumno, texto) => setValores((v) => ({ ...v, [idAlumno]: texto }));

  /** Valida y envía las notas escritas (solo de los estudiantes con nota). */
  const guardar = async () => {
    const conNota = Object.entries(valores).filter(([, v]) => String(v).trim() !== '');
    const errorNombre = validarTexto(evaluacion, 'el nombre de la evaluación', { minimo: 2, maximo: 20 });
    const errorNota = conNota.map(([, v]) => validarNota(v)).find(Boolean);
    const error = errorNombre || (conNota.length === 0 ? 'Escribe al menos una nota.' : errorNota);
    setErrorLocal(error);
    if (error) return null;

    const datos = {
      bimestre,
      evaluacion: evaluacion.trim(),
      notas: conNota.map(([id, v]) => ({ id_alumno: Number(id), valor: aNumero(v) })),
    };
    const r = await accion.ejecutar(() => AcademicoRepository.registrarNotas(
      idCarga, datos, `Notas de "${datos.evaluacion}" (${bimestre}° bimestre)`,
    ));
    if (r.ok) {
      setEvaluacion('');
      setValores({});
      notas.recargar();
      return r.resultado;
    }
    return null;
  };

  /** Cierra el bimestre (pasa los promedios a la libreta). */
  const cerrarBimestre = async () => {
    const r = await accion.ejecutar(() => AcademicoRepository.cerrarBimestre(idCarga, bimestre));
    if (r.ok) notas.recargar();
    return r.ok;
  };

  return {
    notas, bimestre, setBimestre,
    evaluacion, escribirEvaluacion, evaluacionesExistentes, elegirEvaluacion,
    nombreEvaluacion, evaluacionLista, esCorreccion,
    valores, cambiarValor,
    guardar, cerrarBimestre,
    enviando: accion.enviando,
    error: errorLocal || accion.error,
  };
}

export default useNotasCursoViewModel;
