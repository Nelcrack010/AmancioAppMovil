// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: general   ·   Capa: VIEWMODEL · lógica de una pantalla (estado, cargar, guardar) separada del dibujo
// Qué es: useAccion: ViewModel genérico para las acciones (guardar, enviar, calificar...).
// Lo usan: useNotasCursoViewModel.js, useRegistroAsistenciaViewModel.js, SolicitarCitaView.jsx,
//     CambiarPasswordView.jsx, LoginView.jsx, RegistrarReporteView.jsx, AjustesNotificacionesView.jsx,
//     EditarPerfilView.jsx (+4 más)
//
// Para modificar: casi nunca se toca. En la pantalla: const r = await accion.ejecutar(() => Repo.metodo(...));
//   if (r.ok) { ... }   accion.enviando → botón cargando · accion.error → Aviso rojo.
// <<< FIN GUÍA
import { useCallback, useState } from 'react';

/**
 * useAccion: ViewModel genérico para las acciones (guardar, enviar, calificar...).
 *
 *     const accion = useAccion();
 *     const r = await accion.ejecutar(() => AcademicoRepository.calificarEntrega(id, datos));
 *     if (r.ok) { ... }
 *
 * Expone:
 *   - enviando: true mientras la acción está en curso (para desactivar el botón)
 *   - error:    mensaje del último error (o null)
 *   - ejecutar(fn): corre la acción y devuelve { ok: true, resultado } o { ok: false, error }
 *   - limpiarError()
 */
export function useAccion() {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const ejecutar = useCallback(async (accion) => {
    setEnviando(true);
    setError(null);
    try {
      const resultado = await accion();
      return { ok: true, resultado };
    } catch (e) {
      setError(e.message || 'Ocurrió un error inesperado.');
      return { ok: false, error: e };
    } finally {
      setEnviando(false);
    }
  }, []);

  const limpiarError = useCallback(() => setError(null), []);

  return { enviando, error, ejecutar, limpiarError };
}

export default useAccion;
