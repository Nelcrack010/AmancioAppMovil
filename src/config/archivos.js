// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Qué es: Archivos que se pueden subir (enunciado de una tarea y entregas de los alumnos).
// Lo usan: Archivos.jsx, archivos.js
// <<< FIN GUÍA
/**
 * Archivos que se pueden subir (enunciado de una tarea y entregas de los alumnos).
 *
 * Deben coincidir con el servidor: TIPOS_PERMITIDOS y MAX_ARCHIVO_MB en
 * app/services/archivo_service.py y app/config.py del backend. La app los revisa
 * antes de subir para avisar enseguida; el servidor los vuelve a revisar.
 */
export const MAX_MB_ARCHIVO = 10;

/** Extensión → ícono (Ionicons) con el que se muestra el archivo. */
export const TIPOS_DE_ARCHIVO = {
  pdf: 'document-text',
  doc: 'document', docx: 'document', odt: 'document', txt: 'document',
  xls: 'grid', xlsx: 'grid', ods: 'grid', csv: 'grid',
  ppt: 'easel', pptx: 'easel', odp: 'easel',
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', heic: 'image',
  zip: 'archive', rar: 'archive',
};

/** Texto de ayuda que se muestra al elegir un archivo. */
export const AYUDA_ARCHIVOS = `PDF, Word, Excel, PowerPoint, imagen o ZIP · máximo ${MAX_MB_ARCHIVO} MB`;
