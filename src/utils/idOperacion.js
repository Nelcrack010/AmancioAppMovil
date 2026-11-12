/**
 * Genera el identificador único de una operación hecha (o que se podría hacer) sin conexión.
 *
 * Viaja en la cabecera X-Id-Operacion. Si la app reenvía la misma operación dos veces
 * (por ejemplo, porque se cortó la red justo después de enviarla), la API reconoce el id
 * y NO la registra de nuevo: devuelve la respuesta que ya había guardado.
 *
 * Formato que acepta la API: de 8 a 64 caracteres, solo letras, números, "_" y "-".
 */
export function nuevoIdOperacion() {
  const tiempo = Date.now().toString(36);
  const azar = Math.random().toString(36).slice(2, 10);
  return `op-${tiempo}-${azar}`;
}
