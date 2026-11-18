import { useEffect, useMemo, useState } from 'react';
import useConsulta from './useConsulta';
import useAccion from './useAccion';
import AsistenciaRepository from '../repositories/asistenciaRepository';
import AcademicoRepository from '../repositories/academicoRepository';
import { esFechaValida, hoyISO } from '../utils/fechas';
import { JUSTIFICADA, tocarAsistencia } from '../config/estados';

/**
 * useRegistroAsistenciaViewModel: registro de la asistencia diaria de una sección.
 *
 * Flujo (Flujo 2 de la propuesta):
 *   1. Elegir sección y fecha.
 *   2. Se cargan los estudiantes; por omisión todos aparecen como PRESENTES (o con lo que
 *      ya estaba registrado ese día, para corregirlo).
 *   3. Marcar el estado de cada uno (P, T, F, J).
 *      J justifica la tardanza o falta marcada: quedan los DOS marcados (por ejemplo,
 *      T + J) para saber qué pasó. La regla está en tocarAsistencia (src/config/estados.js).
 *   4. Confirmar: se envía TODO en una sola operación. Sin red, queda pendiente.
 *
 * Cada marca es { estado, original }: original es la T o F que se justificó (solo con J).
 */
export function useRegistroAsistenciaViewModel(idSeccionInicial) {
  const secciones = useConsulta(() => AcademicoRepository.secciones(), []);
  const [idSeccion, setIdSeccion] = useState(idSeccionInicial || null);
  const [fecha, setFecha] = useState(hoyISO());
  const [marcas, setMarcas] = useState({});          // { id_alumno: { estado, original } }
  const [hayCambios, setHayCambios] = useState(false);
  const accion = useAccion();

  // Si se llega desde el inicio con una sección, usarla; si no, la primera de la lista.
  useEffect(() => {
    if (idSeccionInicial) setIdSeccion(idSeccionInicial);
  }, [idSeccionInicial]);
  useEffect(() => {
    if (!idSeccion && secciones.datos?.length) setIdSeccion(secciones.datos[0].id_seccion);
  }, [secciones.datos, idSeccion]);

  const fechaValida = esFechaValida(fecha) && fecha <= hoyISO();
  const listo = Boolean(idSeccion) && fechaValida;

  // Estudiantes de la sección y lo ya registrado ese día.
  const alumnos = useConsulta(
    () => (idSeccion ? AsistenciaRepository.alumnosDeSeccion(idSeccion, hoyISO()) : null),
    [idSeccion],
  );
  const registrado = useConsulta(
    () => (listo ? AsistenciaRepository.deSeccion(idSeccion, fecha) : null),
    [idSeccion, fecha, listo],
  );

  // Marcas iniciales: lo ya registrado, o todos presentes.
  // Si el usuario ya empezó a marcar, NO se pisan sus cambios (por ejemplo, cuando la
  // pantalla se vuelve a enfocar y los datos se refrescan).
  useEffect(() => {
    if (!alumnos.datos || hayCambios) return;
    const previas = {};
    (registrado.datos?.registros || []).forEach((r) => {
      previas[r.id_alumno] = { estado: r.estado, original: r.estado_original || null };
    });
    const iniciales = {};
    alumnos.datos.forEach((a) => { iniciales[a.id_alumno] = previas[a.id_alumno] || { estado: 'P', original: null }; });
    setMarcas(iniciales);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alumnos.datos, registrado.datos]);

  /** Cambiar de sección o de fecha descarta las marcas hechas (la vista pregunta antes). */
  const elegirSeccion = (id) => { setHayCambios(false); setIdSeccion(id); };
  const elegirFecha = (f) => { setHayCambios(false); setFecha(f); };

  /** Toca un botón (P, T, F o J) de un estudiante. */
  const marcar = (idAlumno, boton) => {
    setMarcas((m) => ({ ...m, [idAlumno]: tocarAsistencia(m[idAlumno], boton) }));
    setHayCambios(true);
  };

  /** Marca a todos con el mismo estado (por ejemplo, "todos presentes"). */
  const marcarTodos = (estado) => {
    setMarcas((m) => Object.fromEntries(Object.keys(m).map((id) => [id, { estado, original: null }])));
    setHayCambios(true);
  };

  /** Totales para el resumen antes de confirmar. */
  const resumen = useMemo(() => {
    const r = { P: 0, T: 0, F: 0, J: 0 };
    Object.values(marcas).forEach((m) => { r[m.estado] += 1; });
    return r;
  }, [marcas]);

  const nombreSeccion = () => {
    const s = secciones.datos?.find((x) => x.id_seccion === idSeccion);
    return s ? `${s.grado} ${s.nombre} ${s.nivel}` : 'la sección';
  };

  /** Envía el registro completo. Devuelve el resultado de la cola o null si falló. */
  const confirmar = async () => {
    const datos = {
      id_seccion: idSeccion,
      fecha,
      registros: Object.entries(marcas).map(([id, m]) => ({
        id_alumno: Number(id),
        estado: m.estado,
        // Solo las justificadas llevan qué se justificó (T o F).
        ...(m.estado === JUSTIFICADA ? { estado_original: m.original } : {}),
      })),
    };
    const r = await accion.ejecutar(() => AsistenciaRepository.registrarLote(
      datos, `Asistencia de ${nombreSeccion()} del ${fecha}`,
    ));
    if (!r.ok) return null;
    setHayCambios(false);
    registrado.recargar();
    return r.resultado;
  };

  return {
    secciones, idSeccion, elegirSeccion,
    fecha, elegirFecha, fechaValida,
    alumnos, registrado,
    marcas, marcar, marcarTodos, resumen,
    hayCambios, confirmar,
    enviando: accion.enviando,
    error: accion.error,
  };
}

export default useRegistroAsistenciaViewModel;
