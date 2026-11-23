// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Qué es: Validaciones locales de formularios.
// Lo usan: DialogoTexto.jsx, useNotasCursoViewModel.js, SolicitarCitaView.jsx, CambiarPasswordView.jsx,
//     LoginView.jsx, RegistrarReporteView.jsx, EditarPerfilView.jsx, CalificarEntregaView.jsx (+2 más)
//
// Para modificar:
//   validarTexto(valor, 'nombre', { minimo, maximo }), validarEnlace, primerError(...):
//   devuelven el mensaje de error o null. Regla nueva reutilizable → agrégala aquí.
// <<< FIN GUÍA
/**
 * Validaciones locales de formularios.
 *
 * Se validan en el celular ANTES de llamar a la API, para avisar rápido al usuario.
 * El servidor vuelve a validar todo (nunca confiamos solo en el celular).
 *
 * Cada función devuelve un mensaje de error (texto) o null si el valor es válido.
 */

/** Campo obligatorio con longitud mínima y máxima. */
export function validarTexto(valor, nombre, { minimo = 1, maximo = 2000 } = {}) {
  const limpio = (valor || '').trim();
  if (!limpio && minimo > 0) return `Ingresa ${nombre}.`;
  if (limpio.length < minimo) return `${capitalizar(nombre)} debe tener al menos ${minimo} caracteres.`;
  if (limpio.length > maximo) return `${capitalizar(nombre)} admite como máximo ${maximo} caracteres.`;
  return null;
}

/** Enlace web: debe empezar con http:// o https:// (la API exige lo mismo). */
export function validarEnlace(valor, nombre, { requerido = false } = {}) {
  const limpio = (valor || '').trim();
  if (!limpio) return requerido ? `Ingresa ${nombre}.` : null;
  if (!/^https?:\/\/\S+$/.test(limpio)) return `${capitalizar(nombre)} debe empezar con http:// o https://`;
  return null;
}

/** Nota vigesimal: número entre 0 y 20 (acepta decimales con punto o coma). */
export function validarNota(valor) {
  const numero = aNumero(valor);
  if (numero === null) return 'Ingresa una nota.';
  if (numero < 0 || numero > 20) return 'La nota debe estar entre 0 y 20.';
  return null;
}

/** "15,5" o "15.5" → 15.5 ; texto vacío o inválido → null */
export function aNumero(valor) {
  const texto = String(valor ?? '').trim().replace(',', '.');
  if (texto === '') return null;
  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : null;
}

/** Devuelve el primer error de una lista de validaciones, o null si todas pasaron. */
export function primerError(...errores) {
  return errores.find(Boolean) || null;
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
