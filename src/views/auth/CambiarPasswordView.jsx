// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: general   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: CambiarPasswordView: cambio de contraseña.
// Pantalla «CambiarPassword» (src/navigation/pantallas.js): pantalla de detalle, título «Cambiar contraseña»
//   Se abre desde: PerfilView.jsx  con navigation.navigate('CambiarPassword', {...})
// Desde aquí se va a: Menu
// Botones / secciones: «Guardar contraseña», «Salir»
// Campos: «Nueva contraseña», «Repite la nueva contraseña»
// Validación local (antes de enviar): tu contraseña actual minimo: 1, maximo: 200; la nueva contraseña minimo:
//     8, maximo: 200
//
// Para modificar:
//   • Texto, etiqueta o botón → búscalo aquí abajo (Ctrl+F) y cámbialo.
//   • Mostrar un campo nuevo → primero que venga en el JSON (SELECT del repository del backend), luego aquí:
//     {x.campo && <Texto variante="pequeno">Campo: {x.campo}</Texto>}
//   • Campo de formulario → const [valor, setValor] = useState(''); <Campo etiqueta="..." valor={valor}
//       alCambiar={setValor} />
//     y agrégalo al objeto que se envía en accion.ejecutar(...).
//   • Regla local → validarTexto/validarEnlace dentro de primerError(...) (src/utils/validaciones.js). Pon la
//       misma regla en el service.
//   • Botón → <Boton titulo="..." variante="primario|guinda|secundario|peligro|texto" pequeno onPress={() =>
//       ...} />
//   • Ir a otra pantalla → navigation.navigate('Nombre', { id }). Pantalla nueva: src/navigation/pantallas.js.
// <<< FIN GUÍA
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
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Etiqueta from '../../components/Etiqueta';
import Selector from '../../components/Selector';
import DialogoTexto from '../../components/DialogoTexto';
import Lista from '../../components/Lista';
import { ItemLista } from '../../components/Lista';
import { Seccion, Fila, FilaDatos, Dato, Separador } from '../../components/Basicos';
import { Vacio, Cargando } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import ConductaRepository from '../../repositories/conductaRepository';
import MensajesRepository from '../../repositories/mensajesRepository';
import PerfilRepository from '../../repositories/perfilRepository';
import { confirmar, avisarResultado } from '../../utils/dialogos';
import { validarEnlace } from '../../utils/validaciones';
import { formatearFecha, formatearFechaHora, hoyISO, esFechaValida, sumarDias } from '../../utils/fechas';
import { infoEstado, ESTADOS_CITA, ESTADOS_TAREA, ESTADOS_REPORTE } from '../../config/estados';
import { ESPACIO, RADIO, SOMBRA } from '../../config/tema';
// <<< FIN KIT DE IMPORTS

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
  // PISTA: acción de guardar/enviar: accion.ejecutar(() => Repo.metodo(...)) devuelve { ok, resultado };
  //     accion.enviando = cargando; accion.error = mensaje de la API.
  const accion = useAccion();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetida, setRepetida] = useState('');
  const [errorLocal, setErrorLocal] = useState(null);

  // PISTA: guardar() se ejecuta al tocar el botón «Guardar contraseña».
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
    if (!obligatorio) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Menu');
      }
    }
  };

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
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
