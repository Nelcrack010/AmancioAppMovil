import { useState, useEffect, useCallback } from 'react';
import ViajeRepository from '../repositories/viajeRepository';

/**
 * useViajesViewModel: Hook que actúa como ViewModel (MVVM).
 * Mantiene el estado de la UI (cargando, errores, lista de datos)
 * y expone métodos y eventos para la View (Fragment/Screen).
 */
export const useViajesViewModel = () => {
  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [modoOffline, setModoOffline] = useState(false);

  // Carga inicial o recarga de datos
  const cargarViajes = useCallback(async (forzarRemoto = true) => {
    setCargando(true);
    setError(null);
    try {
      const datos = await ViajeRepository.obtenerViajes(forzarRemoto);
      setViajes(datos);
      setModoOffline(!forzarRemoto);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
      // Intentar cargar local en caso de error
      const datosLocales = await ViajeRepository.obtenerViajes(false);
      setViajes(datosLocales);
      setModoOffline(true);
    } finally {
      setCargando(false);
    }
  }, []);

  // Agregar nuevo viaje
  const agregarViaje = useCallback(
    async (destino, fecha, precio) => {
      setCargando(true);
      try {
        await ViajeRepository.crearViaje(destino, fecha, precio);
        await cargarViajes(false);
      } catch (err) {
        setError(err.message || 'Error al guardar');
      } finally {
        setCargando(false);
      }
    },
    [cargarViajes]
  );

  useEffect(() => {
    cargarViajes(true);
  }, [cargarViajes]);

  return {
    viajes,
    cargando,
    error,
    modoOffline,
    cargarViajes,
    agregarViaje,
  };
};

export default useViajesViewModel;
