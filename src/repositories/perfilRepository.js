import PerfilApi from '../services/api/perfilApi';
import { fuente } from './cacheRepository';

/** PerfilRepository: datos del usuario y estado de la matrícula. */
export const PerfilRepository = {
  miPerfil: (username) => fuente('perfil', () => PerfilApi.miPerfil(username)),
  miMatricula: () => fuente('matricula', PerfilApi.miMatricula),
  actualizarContacto: PerfilApi.actualizarContacto,
  actualizarDireccion: PerfilApi.actualizarDireccion,
  actualizarMedicos: PerfilApi.actualizarMedicos,
};

export default PerfilRepository;
