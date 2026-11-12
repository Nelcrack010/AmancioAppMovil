import apiClient from './apiClient';

/** Endpoints de perfil, matrícula y panel de inicio. */
export const PerfilApi = {
  /** GET /inicio → resumen del día según el rol del usuario */
  inicio: async () => (await apiClient.get('/inicio')).data,

  /** GET /perfil/mi-perfil/<username> → { rol, datos, familiar? } */
  miPerfil: async (username) =>
    (await apiClient.get(`/perfil/mi-perfil/${encodeURIComponent(username)}`)).data,

  /** GET /perfil/mi-matricula (solo alumno) → nivel, grado, sección, condición... */
  miMatricula: async () => (await apiClient.get('/perfil/mi-matricula')).data,

  /** PATCH /perfil/contacto/<username> → { telefono, email } */
  actualizarContacto: async (username, datos) =>
    (await apiClient.patch(`/perfil/contacto/${encodeURIComponent(username)}`, datos)).data,

  /** PATCH /perfil/alumno/<username>/direccion → { direccion } */
  actualizarDireccion: async (username, direccion) =>
    (await apiClient.patch(`/perfil/alumno/${encodeURIComponent(username)}/direccion`, { direccion })).data,

  /** PATCH /perfil/alumno/<username>/medicos → { enfermedad } */
  actualizarMedicos: async (username, enfermedad) =>
    (await apiClient.patch(`/perfil/alumno/${encodeURIComponent(username)}/medicos`, { enfermedad })).data,
};

export default PerfilApi;
