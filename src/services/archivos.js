import * as DocumentPicker from 'expo-document-picker';
import { API_CONFIG } from '../config/constants';
import { MAX_MB_ARCHIVO, TIPOS_DE_ARCHIVO } from '../config/archivos';

/**
 * Elegir, revisar y abrir archivos (PDF, Word, Excel, PowerPoint, imágenes...).
 *
 * Un archivo ELEGIDO en el celular (para subirlo) es:
 *     { uri, nombre, tipo, tamano, file? }     (file solo existe en el navegador)
 * Un archivo que devuelve la API (ya subido) es:
 *     { id_archivo, nombre, tipo, tamano, url }   (url = "/archivos/5?token=...")
 */

/** Extensión en minúsculas: "Mi Tarea.PDF" → "pdf". */
export function extension(nombre = '') {
  const punto = nombre.lastIndexOf('.');
  return punto >= 0 ? nombre.slice(punto + 1).toLowerCase() : '';
}

/** Ícono de Ionicons según el tipo de archivo. */
export function iconoDeArchivo(nombre) {
  return TIPOS_DE_ARCHIVO[extension(nombre)] || 'document-attach';
}

/** 1536000 → "1.5 MB" */
export function formatearTamano(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Revisa tipo y tamaño. Devuelve el texto del error o null si está bien. */
export function validarArchivo(archivo) {
  if (!TIPOS_DE_ARCHIVO[extension(archivo.nombre)]) {
    return 'Ese tipo de archivo no se puede subir. Usa PDF, Word, Excel, PowerPoint, una imagen o ZIP.';
  }
  if (archivo.tamano > MAX_MB_ARCHIVO * 1024 * 1024) {
    return `El archivo pesa ${formatearTamano(archivo.tamano)}: el máximo es ${MAX_MB_ARCHIVO} MB.`;
  }
  if (archivo.tamano === 0) return 'El archivo está vacío.';
  return null;
}

/**
 * Abre el selector de archivos del celular.
 * Devuelve { archivo } si eligió uno válido, { error } si no sirve, o null si canceló.
 */
export async function elegirArchivo() {
  const resultado = await DocumentPicker.getDocumentAsync({
    type: '*/*',                 // se acepta cualquiera y luego se revisa la extensión
    copyToCacheDirectory: true,  // copia local: así se puede enviar luego, aunque no haya red
    multiple: false,
  });
  if (resultado.canceled || !resultado.assets?.length) return null;

  const elegido = resultado.assets[0];
  const archivo = {
    uri: elegido.uri,
    nombre: elegido.name,
    tipo: elegido.mimeType || 'application/octet-stream',
    tamano: elegido.size ?? elegido.file?.size ?? null,
    file: elegido.file,          // solo en el navegador (Expo web)
  };
  const error = validarArchivo(archivo);
  return error ? { error } : { archivo };
}

/** Dirección completa para abrir un archivo de la API: servidor + "/archivos/5?token=...". */
export function urlDeArchivo(archivo) {
  if (!archivo?.url) return null;
  return archivo.url.startsWith('http') ? archivo.url : `${API_CONFIG.BASE_URL}${archivo.url}`;
}
