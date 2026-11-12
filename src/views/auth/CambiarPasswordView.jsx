import React, { useState } from 'react';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import { Aviso } from '../../components/Estados';
import { useSesion } from '../../context/SesionContext';
import useAccion from '../../viewmodels/useAccion';
import { avisar } from '../../utils/dialogos';
import { primerError, validarTexto } from '../../utils/validaciones';
import { COLORES } from '../../config/tema';

/**
 * CambiarPasswordView: cambio de contraseña.
 *
 * Se usa en dos casos:
 *   - Primer ingreso (route.params.obligatorio = true): la contraseña aún es el DNI y la
 *     app no deja entrar al campus hasta cambiarla.
 *   - Desde "Mi perfil", cuando el usuario quiere cambiarla.
 */
export default function CambiarPasswordView({ navigation, route }) {
  const obligatorio = Boolean(route.params?.obligatorio);
  const { usuario, cambiarPassword, cerrarSesion } = useSesion();
  const accion = useAccion();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetida, setRepetida] = useState('');
  const [errorLocal, setErrorLocal] = useState(null);

  const guardar = async () => {
    const dni = usuario.username.split('-')[1];
    const error = primerError(
      validarTexto(actual, 'tu contraseña actual', { minimo: 1, maximo: 200 }),
      validarTexto(nueva, 'la nueva contraseña', { minimo: 8, maximo: 200 }),
      nueva === dni ? 'La nueva contraseña no puede ser tu DNI.' : null,
      nueva !== repetida ? 'Las contraseñas nuevas no coinciden.' : null,
    );
    setErrorLocal(error);
    if (error) return;

    const r = await accion.ejecutar(() => cambiarPassword(actual, nueva));
    if (!r.ok) return;
    avisar('Contraseña actualizada', 'Tu contraseña se cambió correctamente.');
    // En el primer ingreso, AppNavigator abre el campus solo; desde el perfil, se vuelve atrás.
    if (!obligatorio) navigation.goBack();
  };

  return (
    <Pantalla>
      <Tarjeta>
        {obligatorio ? (
          <>
            <Texto variante="subtitulo" color={COLORES.guinda}>¡Bienvenido(a)!</Texto>
            <Aviso tono="alerta">
              Por seguridad debes cambiar tu contraseña inicial (tu DNI) antes de usar el campus.
            </Aviso>
          </>
        ) : (
          <Texto variante="pequeno">Escribe tu contraseña actual y la nueva.</Texto>
        )}

        {(errorLocal || accion.error) && <Aviso tono="error">{errorLocal || accion.error}</Aviso>}

        <Campo
          etiqueta={obligatorio ? 'Contraseña actual (tu DNI)' : 'Contraseña actual'}
          valor={actual}
          alCambiar={setActual}
          secureTextEntry
          autoCapitalize="none"
        />
        <Campo
          etiqueta="Nueva contraseña"
          valor={nueva}
          alCambiar={setNueva}
          secureTextEntry
          autoCapitalize="none"
          ayuda="Mínimo 8 caracteres y distinta de tu DNI."
        />
        <Campo
          etiqueta="Repite la nueva contraseña"
          valor={repetida}
          alCambiar={setRepetida}
          secureTextEntry
          autoCapitalize="none"
        />

        <Boton titulo="Guardar contraseña" icono="key-outline" onPress={guardar} cargando={accion.enviando} />
        {obligatorio && (
          <Boton titulo="Salir" variante="texto" onPress={cerrarSesion} style={{ marginTop: 8 }} />
        )}
      </Tarjeta>
    </Pantalla>
  );
}
