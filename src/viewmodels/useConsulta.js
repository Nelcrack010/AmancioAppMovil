import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import CacheRepository from '../repositories/cacheRepository';

/**
 * useConsulta: ViewModel genérico para las pantallas que MUESTRAN datos.
 *
 * Recibe una función que devuelve una "fuente" de un repositorio, por ejemplo:
 *
 *     const notas = useConsulta(() => AcademicoRepository.misNotas(bimestre), [bimestre]);
 *
 * Si la función devuelve null (falta un dato, como la sección elegida), no se consulta nada.
 *
 * y expone el estado de la pantalla:
 *   - cargando:     true la primera vez, mientras aún no hay nada que mostrar
 *   - refrescando:  true mientras se actualiza con datos ya visibles (deslizar hacia abajo)
 *   - datos:        la respuesta de la API (o la guardada en el celular)
 *   - error:        ErrorApi si no hay NADA que mostrar (ni del servidor ni guardado)
 *   - aviso:        texto si se muestran datos guardados porque el servidor no respondió
 *   - actualizadoEn: fecha de los datos guardados que se están mostrando
 *   - recargar():   vuelve a pedir los datos
 *
 * Los datos se vuelven a pedir cada vez que la pantalla se enfoca (por ejemplo, al
 * regresar de entregar una tarea) y cuando cambian las dependencias (deps).
 */
export function useConsulta(crearFuente, deps = []) {
  const [estado, setEstado] = useState({
    cargando: true, refrescando: false, datos: null, error: null, aviso: null, actualizadoEn: null,
  });
  // Cada carga recibe un número; si llega la respuesta de una carga vieja (por ejemplo,
  // el usuario cambió de bimestre rápido), se ignora.
  const ultimaCarga = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cargar = useCallback(async () => {
    const numero = ++ultimaCarga.current;
    const vigente = () => numero === ultimaCarga.current;
    const fuente = crearFuente();

    // Sin fuente (por ejemplo, aún no se eligió la sección): se queda "cargando".
    if (!fuente) {
      setEstado({ cargando: true, refrescando: false, datos: null, error: null, aviso: null, actualizadoEn: null });
      return;
    }

    // Si cambió la consulta (por ejemplo, otro bimestre), se limpian los datos anteriores
    // para no mostrar los de la consulta vieja; si es la misma, se refresca encima.
    setEstado((e) => (e.clave === fuente.clave
      ? { ...e, refrescando: Boolean(e.datos), error: null }
      : { cargando: true, refrescando: false, datos: null, error: null, aviso: null, actualizadoEn: null, clave: fuente.clave }));

    // 1. Lo guardado en el celular: se muestra al instante.
    const local = await CacheRepository.leerLocal(fuente);
    if (local && vigente()) {
      setEstado((e) => ({
        ...e, cargando: false, refrescando: true, datos: local.valor, actualizadoEn: local.actualizado_en,
      }));
    }

    // 2. Lo del servidor: reemplaza lo guardado.
    try {
      const datos = await CacheRepository.actualizar(fuente);
      if (vigente()) {
        setEstado({ cargando: false, refrescando: false, datos, error: null, aviso: null, actualizadoEn: null, clave: fuente.clave });
      }
    } catch (error) {
      if (!vigente()) return;
      setEstado((e) => (e.datos
        // Hay algo que mostrar: se mantiene y se avisa que puede no estar al día.
        ? { ...e, cargando: false, refrescando: false, aviso: error.esDeRed ? 'Sin conexión: mostrando los últimos datos guardados.' : error.message }
        // No hay nada: la pantalla muestra el error con el botón "Reintentar".
        : { ...e, cargando: false, refrescando: false, error }));
    }
  }, deps);

  // Cargar al enfocar la pantalla (incluye la primera vez) y al cambiar las deps.
  useFocusEffect(useCallback(() => {
    cargar();
  }, [cargar]));

  return { ...estado, recargar: cargar };
}

export default useConsulta;
