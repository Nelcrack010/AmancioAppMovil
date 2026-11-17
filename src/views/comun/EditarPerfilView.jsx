import React, { useState } from 'react';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import { Seccion } from '../../components/Basicos';
import { Aviso } from '../../components/Estados';
import { useSesion } from '../../context/SesionContext';
import useAccion from '../../viewmodels/useAccion';
import PerfilRepository from '../../repositories/perfilRepository';
import { avisar } from '../../utils/dialogos';
import { primerError, validarTexto } from '../../utils/validaciones';

/**
 * EditarPerfilView: edición de los datos permitidos.
 *   - Todos: teléfono y correo de contacto (en el estudiante, los de su familiar).
 *   - Estudiante: además, dirección y datos médicos.
 */
export default function EditarPerfilView({ navigation, route }) {
  const { usuario } = useSesion();
  const perfil = route.params?.perfil || {};
  const esAlumno = usuario.rol === 'ALUMNO';
  const accion = useAccion();

  const [telefono, setTelefono] = useState(perfil.telefono || '');
  const [email, setEmail] = useState(perfil.email || '');
  const [direccion, setDireccion] = useState(perfil.direccion || '');
  const [enfermedad, setEnfermedad] = useState(perfil.enfermedad || '');
  const [errorLocal, setErrorLocal] = useState(null);

  const guardar = async () => {
    const error = primerError(
      telefono && !/^\d{9}$/.test(telefono) ? 'El teléfono debe tener 9 dígitos.' : null,
      email && !/^\S+@\S+\.\S+$/.test(email) ? 'El correo no es válido.' : null,
      esAlumno ? validarTexto(direccion, 'la dirección', { minimo: 3, maximo: 300 }) : null,
      validarTexto(enfermedad, 'los datos médicos', { minimo: 0, maximo: 150 }),
    );
    setErrorLocal(error);
    if (error) return;

    const r = await accion.ejecutar(async () => {
      await PerfilRepository.actualizarContacto(usuario.username, { telefono: telefono.trim(), email: email.trim() });
      if (esAlumno) {
        await PerfilRepository.actualizarDireccion(usuario.username, direccion.trim());
        await PerfilRepository.actualizarMedicos(usuario.username, enfermedad.trim());
      }
    });
    if (r.ok) {
      avisar('Datos actualizados', 'Tus datos se guardaron correctamente.');
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Menu');
      }
    }
  };

  return (
    <Pantalla>
      {(errorLocal || accion.error) && <Aviso tono="error">{errorLocal || accion.error}</Aviso>}

      <Seccion titulo="Contacto" />
      <Tarjeta>
        {esAlumno && <Texto variante="pequeno">Son los datos de contacto de tu familiar o apoderado.</Texto>}
        <Campo etiqueta="Teléfono" valor={telefono} alCambiar={setTelefono} keyboardType="phone-pad" maxLength={9} placeholder="9 dígitos" />
        <Campo etiqueta="Correo" valor={email} alCambiar={setEmail} keyboardType="email-address" autoCapitalize="none" />
      </Tarjeta>

      {esAlumno && (
        <>
          <Seccion titulo="Estudiante" />
          <Tarjeta>
            <Campo etiqueta="Dirección" valor={direccion} alCambiar={setDireccion} />
            <Campo
              etiqueta="Datos médicos"
              valor={enfermedad}
              alCambiar={setEnfermedad}
              multilinea
              placeholder="Alergias, enfermedades u otra información importante"
            />
          </Tarjeta>
        </>
      )}

      <Boton titulo="Guardar cambios" icono="save-outline" onPress={guardar} cargando={accion.enviando} />
    </Pantalla>
  );
}
