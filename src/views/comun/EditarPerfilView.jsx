// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Perfil   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: EditarPerfilView: edición de los datos permitidos. - Todos: teléfono y correo de contacto (en el
//     estudiante, los de su familiar). - Estudiante: además, dirección y datos médicos.
// Pantalla «EditarPerfil» (src/navigation/pantallas.js): pantalla de detalle, título «Editar mis datos»
//   Se abre desde: PerfilView.jsx  con navigation.navigate('EditarPerfil', {...})
// Desde aquí se va a: Menu
//
// Datos (repositorio → endpoint → backend):
//   PerfilRepository.actualizarContacto() → PATCH /perfil/contacto/<username> (backend: perfil_routes.py →
//       actualizar_contacto())
//   PerfilRepository.actualizarDireccion() → PATCH /perfil/alumno/<username>/direccion (backend:
//       perfil_routes.py → actualizar_direccion())
//   PerfilRepository.actualizarMedicos() → PATCH /perfil/alumno/<username>/medicos (backend: perfil_routes.py →
//       actualizar_medicos())
// Botones / secciones: «Contacto», «Estudiante», «Guardar cambios»
// Campos: «Correo», «Datos médicos», «Dirección», «Teléfono»
// Validación local (antes de enviar): la dirección minimo: 3, maximo: 300; los datos médicos minimo: 0, maximo:
//     150
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
import { Seccion } from '../../components/Basicos';
import { Aviso } from '../../components/Estados';
import { useSesion } from '../../context/SesionContext';
import useAccion from '../../viewmodels/useAccion';
import PerfilRepository from '../../repositories/perfilRepository';
import { avisar } from '../../utils/dialogos';
import { primerError, validarTexto } from '../../utils/validaciones';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Etiqueta from '../../components/Etiqueta';
import Selector from '../../components/Selector';
import DialogoTexto from '../../components/DialogoTexto';
import Lista from '../../components/Lista';
import { ItemLista } from '../../components/Lista';
import { Fila, FilaDatos, Dato, Separador } from '../../components/Basicos';
import { Vacio, Cargando } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import ConductaRepository from '../../repositories/conductaRepository';
import MensajesRepository from '../../repositories/mensajesRepository';
import { confirmar, avisarResultado } from '../../utils/dialogos';
import { validarEnlace } from '../../utils/validaciones';
import { formatearFecha, formatearFechaHora, hoyISO, esFechaValida, sumarDias } from '../../utils/fechas';
import { infoEstado, ESTADOS_CITA, ESTADOS_TAREA, ESTADOS_REPORTE } from '../../config/estados';
import { COLORES, ESPACIO, RADIO, SOMBRA } from '../../config/tema';
// <<< FIN KIT DE IMPORTS

/**
 * EditarPerfilView: edición de los datos permitidos.
 *   - Todos: teléfono y correo de contacto (en el estudiante, los de su familiar).
 *   - Estudiante: además, dirección y datos médicos.
 */
export default function EditarPerfilView({ navigation, route }) {
  const { usuario } = useSesion();
  const perfil = route.params?.perfil || {};
  const esAlumno = usuario.rol === 'ALUMNO';
  // PISTA: acción de guardar/enviar: accion.ejecutar(() => Repo.metodo(...)) devuelve { ok, resultado };
  //     accion.enviando = cargando; accion.error = mensaje de la API.
  const accion = useAccion();

  const [telefono, setTelefono] = useState(perfil.telefono || '');
  const [email, setEmail] = useState(perfil.email || '');
  const [direccion, setDireccion] = useState(perfil.direccion || '');
  const [enfermedad, setEnfermedad] = useState(perfil.enfermedad || '');
  const [errorLocal, setErrorLocal] = useState(null);

  // PISTA: guardar() se ejecuta al tocar el botón «Guardar cambios».
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

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
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
