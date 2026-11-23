// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: REPOSITORY · de dónde salen los datos: caché del celular, la API o la cola sin conexión
// Cadena: vistas/viewmodels → [este archivo] → services/api/*Api.js → backend
//
// Métodos (→ endpoint · lo usan):
//   miPerfil()  → GET /perfil/mi-perfil/${encodeURIComponent(username)}  · lo usan: PerfilView.jsx
//   miMatricula()  → GET /perfil/mi-matricula  · lo usan: PerfilView.jsx
//   actualizarContacto()  → PATCH /perfil/contacto/${encodeURIComponent(username)}  · lo usan:
//       EditarPerfilView.jsx
//   actualizarDireccion()  → PATCH /perfil/alumno/${encodeURIComponent(username)}/direccion  · lo usan:
//       EditarPerfilView.jsx
//   actualizarMedicos()  → PATCH /perfil/alumno/${encodeURIComponent(username)}/medicos  · lo usan:
//       EditarPerfilView.jsx
//
// Para modificar:
//   • CONSULTA (mostrar datos): metodo: (a) => fuente(`clave:${a}`, () => XApi.metodo(a)),
//     la clave de caché debe cambiar si cambia el parámetro (si no, se ven datos de otro filtro).
//   • ACCIÓN (guardar/borrar): metodo: XApi.metodo,   (se pasa tal cual).
//   • Que funcione sin conexión: ColaRepository.enviar('TIPO', payload, descripcion) + agregar TIPO en ENVIOS
//       (colaRepository.js).
// <<< FIN GUÍA
import PerfilApi from '../services/api/perfilApi';
import { fuente } from './cacheRepository';

/** PerfilRepository: datos del usuario y estado de la matrícula. */
export const PerfilRepository = {
  // PISTA: miPerfil() → GET /perfil/mi-perfil/<username> (backend: perfil_routes.py → mi_perfil()) · caché
  //     «perfil» · lo usan: PerfilView.jsx
  miPerfil: (username) => fuente('perfil', () => PerfilApi.miPerfil(username)),
  // PISTA: miMatricula() → GET /perfil/mi-matricula (backend: perfil_routes.py → mi_matricula()) · caché
  //     «matricula» · lo usan: PerfilView.jsx
  miMatricula: () => fuente('matricula', PerfilApi.miMatricula),
  // PISTA: actualizarContacto() → PATCH /perfil/contacto/<username> (backend: perfil_routes.py →
  //     actualizar_contacto()) · lo usan: EditarPerfilView.jsx
  actualizarContacto: PerfilApi.actualizarContacto,
  // PISTA: actualizarDireccion() → PATCH /perfil/alumno/<username>/direccion (backend: perfil_routes.py →
  //     actualizar_direccion()) · lo usan: EditarPerfilView.jsx
  actualizarDireccion: PerfilApi.actualizarDireccion,
  // PISTA: actualizarMedicos() → PATCH /perfil/alumno/<username>/medicos (backend: perfil_routes.py →
  //     actualizar_medicos()) · lo usan: EditarPerfilView.jsx
  actualizarMedicos: PerfilApi.actualizarMedicos,
};

export default PerfilRepository;
