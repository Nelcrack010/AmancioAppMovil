// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Capa: API · una función por endpoint del backend (método HTTP + URL)
// Cadena: repositories/*Repository.js → [este archivo] → apiClient.js (axios + token) → backend Flask
//
// Métodos (endpoint → archivo del backend):
//   inicio()  GET /inicio  → inicio_routes.py · panel()  roles: cualquiera con sesión
//   miPerfil()  GET /perfil/mi-perfil/${encodeURIComponent(username)}  → perfil_routes.py · mi_perfil()  roles:
//       cualquiera con sesión
//   miMatricula()  GET /perfil/mi-matricula  → perfil_routes.py · mi_matricula()  roles: ALUMNO
//   actualizarContacto()  PATCH /perfil/contacto/${encodeURIComponent(username)}  → perfil_routes.py ·
//       actualizar_contacto()  roles: cualquiera con sesión
//   actualizarDireccion()  PATCH /perfil/alumno/${encodeURIComponent(username)}/direccion  → perfil_routes.py ·
//       actualizar_direccion()  roles: ALUMNO
//   actualizarMedicos()  PATCH /perfil/alumno/${encodeURIComponent(username)}/medicos  → perfil_routes.py ·
//       actualizar_medicos()  roles: ALUMNO
//
// Para modificar:
//   • Endpoint nuevo: nombre: async (id, datos) => (await apiClient.patch(`/x/${id}/accion`, datos)).data,
//   • Con filtro ?campo=: apiClient.get('/x', { params: { campo } })  (si campo es undefined no se envía).
//   • La URL y el método deben ser IGUALES a los del @bp.metodo("...") del backend (si no: 404/405).
//   • Después expórtalo en el repository: metodo: XApi.metodo (acciones) o fuente('clave', ...) (consultas).
// <<< FIN GUÍA
import apiClient from './apiClient';

/** Endpoints de perfil, matrícula y panel de inicio. */
export const PerfilApi = {
  // PISTA: GET /inicio → backend: inicio_routes.py · panel() · roles: cualquiera con sesión
  // PISTA: lo usa: AcademicoRepository.inicio
  /** GET /inicio → resumen del día según el rol del usuario */
  inicio: async () => (await apiClient.get('/inicio')).data,

  // PISTA: GET /perfil/mi-perfil/${encodeURIComponent(username)} → backend: perfil_routes.py · mi_perfil() ·
  //     roles: cualquiera con sesión
  // PISTA: lo usa: ConductaRepository.miConducta, PerfilRepository.miPerfil
  /** GET /perfil/mi-perfil/<username> → { rol, datos, familiar? } */
  miPerfil: async (username) =>
    (await apiClient.get(`/perfil/mi-perfil/${encodeURIComponent(username)}`)).data,

  // PISTA: GET /perfil/mi-matricula → backend: perfil_routes.py · mi_matricula() · roles: ALUMNO
  // PISTA: lo usa: PerfilRepository.miMatricula
  /** GET /perfil/mi-matricula (solo alumno) → nivel, grado, sección, condición... */
  miMatricula: async () => (await apiClient.get('/perfil/mi-matricula')).data,

  // PISTA: PATCH /perfil/contacto/${encodeURIComponent(username)} → backend: perfil_routes.py ·
  //     actualizar_contacto() · roles: cualquiera con sesión
  // PISTA: lo usa: PerfilRepository.actualizarContacto
  /** PATCH /perfil/contacto/<username> → { telefono, email } */
  actualizarContacto: async (username, datos) =>
    (await apiClient.patch(`/perfil/contacto/${encodeURIComponent(username)}`, datos)).data,

  // PISTA: PATCH /perfil/alumno/${encodeURIComponent(username)}/direccion → backend: perfil_routes.py ·
  //     actualizar_direccion() · roles: ALUMNO
  // PISTA: lo usa: PerfilRepository.actualizarDireccion
  /** PATCH /perfil/alumno/<username>/direccion → { direccion } */
  actualizarDireccion: async (username, direccion) =>
    (await apiClient.patch(`/perfil/alumno/${encodeURIComponent(username)}/direccion`, { direccion })).data,

  // PISTA: PATCH /perfil/alumno/${encodeURIComponent(username)}/medicos → backend: perfil_routes.py ·
  //     actualizar_medicos() · roles: ALUMNO
  // PISTA: lo usa: PerfilRepository.actualizarMedicos
  /** PATCH /perfil/alumno/<username>/medicos → { enfermedad } */
  actualizarMedicos: async (username, enfermedad) =>
    (await apiClient.patch(`/perfil/alumno/${encodeURIComponent(username)}/medicos`, { enfermedad })).data,
};

export default PerfilApi;
