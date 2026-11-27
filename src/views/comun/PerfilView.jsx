// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Perfil   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: PerfilView: datos del usuario, familiar (estudiante), estado de matrícula (estudiante) y acciones de
//     la cuenta: editar datos, cambiar contraseña y cerrar sesión.
// Pantalla «Perfil» (src/navigation/pantallas.js): en el menú de ALUMNO («Mi perfil»), DOCENTE («Mi perfil»),
//     AUXILIAR («Mi perfil»), PSICOLOGO («Mi perfil»), ADMIN («Mi perfil») (src/config/menus.js)
// Desde aquí se va a: AjustesNotificaciones, CambiarPassword, EditarPerfil, Pendientes
//
// Datos (repositorio → endpoint → backend):
//   PerfilRepository.miMatricula() → GET /perfil/mi-matricula (backend: perfil_routes.py → mi_matricula())
//   PerfilRepository.miPerfil() → GET /perfil/mi-perfil/<username> (backend: perfil_routes.py → mi_perfil())
// Botones / secciones: «Cambiar contraseña», «Cerrar sesión», «Cuenta», «Editar mis datos», «Familiar /
//     apoderado», «Mis datos», «Notificaciones», «Operaciones pendientes», «Silenciar o elegir qué avisos
//     recibir»
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
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Lista, { ItemLista } from '../../components/Lista';
import Etiqueta from '../../components/Etiqueta';
import { Avatar, Fila, Seccion } from '../../components/Basicos';
import { useSesion } from '../../context/SesionContext';
import { useConexion } from '../../context/ConexionContext';
import useConsulta from '../../viewmodels/useConsulta';
import PerfilRepository from '../../repositories/perfilRepository';
import { confirmar } from '../../utils/dialogos';
import { formatearFecha } from '../../utils/fechas';
import { NOMBRES_ROL } from '../../config/estados';
import { COLORES, ESPACIO } from '../../config/tema';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Boton from '../../components/Boton';
import Campo from '../../components/Campo';
import Selector from '../../components/Selector';
import DialogoTexto from '../../components/DialogoTexto';
import { FilaDatos, Dato, Separador } from '../../components/Basicos';
import { Aviso, Vacio, Cargando } from '../../components/Estados';
import useAccion from '../../viewmodels/useAccion';
import AcademicoRepository from '../../repositories/academicoRepository';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import ConductaRepository from '../../repositories/conductaRepository';
import MensajesRepository from '../../repositories/mensajesRepository';
import { avisar, avisarResultado } from '../../utils/dialogos';
import { validarTexto, validarEnlace, primerError } from '../../utils/validaciones';
import { formatearFechaHora, hoyISO, esFechaValida, sumarDias } from '../../utils/fechas';
import { infoEstado, ESTADOS_CITA, ESTADOS_TAREA, ESTADOS_REPORTE } from '../../config/estados';
import { RADIO, SOMBRA } from '../../config/tema';
// <<< FIN KIT DE IMPORTS

/**
 * PerfilView: datos del usuario, familiar (estudiante), estado de matrícula (estudiante)
 * y acciones de la cuenta: editar datos, cambiar contraseña y cerrar sesión.
 */
export default function PerfilView({ navigation }) {
  const { usuario, cerrarSesion } = useSesion();
  const { pendientes } = useConexion();
  // PISTA: «perfil» = datos que se cargan al abrir la pantalla: PerfilRepository.miPerfil() → GET
  //     /perfil/mi-perfil/<username> (backend: perfil_routes.py → mi_perfil()). Úsalos con perfil.datos;
  //     perfil.recargar() vuelve a pedirlos.
  const perfil = useConsulta(() => PerfilRepository.miPerfil(usuario.username), [usuario.username]);

  // PISTA: salir() se ejecuta al tocar el botón «Cerrar sesión».
  const salir = async () => {
    const mensaje = pendientes > 0
      ? `Tienes ${pendientes} operación(es) sin enviar. Si cierras sesión se perderán.`
      : '¿Seguro que quieres cerrar sesión?';
    if (await confirmar('Cerrar sesión', mensaje, { textoAceptar: 'Cerrar sesión', peligroso: true })) {
      await cerrarSesion();
    }
  };

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla consulta={perfil}>
      {({ datos, familiar }) => {
        const nombre = `${datos.nombres} ${datos.apellidos}`;
        return (
          <>
            <Tarjeta destacada>
              <View style={estilos.cabecera}>
                <Avatar nombre={nombre} tamano={56} />
                <View style={estilos.flex}>
                  <Texto variante="subtitulo" color={COLORES.blanco}>{nombre}</Texto>
                  <Texto variante="pequeno" color={COLORES.crema}>
                    {usuario.username} · {NOMBRES_ROL[usuario.rol]}
                  </Texto>
                </View>
              </View>
            </Tarjeta>

            <Seccion titulo="Mis datos" />
            <Tarjeta>
              <Fila rotulo="DNI" valor={datos.dni} />
              <Fila rotulo="Correo" valor={datos.email} />
              <Fila rotulo="Teléfono" valor={datos.telefono} />
              {datos.especialidad !== undefined && <Fila rotulo="Especialidad" valor={datos.especialidad} />}
              {usuario.rol === 'ALUMNO' && (
                <>
                  <Fila rotulo="Fecha de nacimiento" valor={datos.fecha_nacimiento ? formatearFecha(datos.fecha_nacimiento) : null} />
                  <Fila rotulo="Dirección" valor={datos.direccion} />
                  <Fila rotulo="Datos médicos" valor={datos.enfermedad || 'Ninguno registrado'} />
                </>
              )}
            </Tarjeta>

            {usuario.rol === 'ALUMNO' && familiar && (
              <>
                <Seccion titulo="Familiar / apoderado" />
                <Tarjeta>
                  <Fila rotulo="Nombre" valor={`${familiar.nombres} ${familiar.apellidos}`} />
                  <Fila rotulo="DNI" valor={familiar.dni} />
                  <Fila rotulo="Teléfono" valor={familiar.telefono} />
                  <Fila rotulo="Correo" valor={familiar.email} />
                </Tarjeta>
              </>
            )}

            {usuario.rol === 'ALUMNO' && <Matricula />}

            <Seccion titulo="Cuenta" />
            <Lista>
              <ItemLista icono="create-outline" titulo="Editar mis datos"
                onPress={() => navigation.navigate('EditarPerfil', { perfil: datos })} />
              <ItemLista icono="key-outline" titulo="Cambiar contraseña"
                onPress={() => navigation.navigate('CambiarPassword')} />
              <ItemLista icono="notifications-outline" titulo="Notificaciones"
                subtitulo="Silenciar o elegir qué avisos recibir"
                onPress={() => navigation.navigate('AjustesNotificaciones')} />
              <ItemLista
                icono="cloud-upload-outline"
                titulo="Operaciones pendientes"
                derecha={pendientes > 0 && <Etiqueta texto={String(pendientes)} tono="alerta" />}
                onPress={() => navigation.navigate('Pendientes')}
              />
              <ItemLista icono="log-out-outline" colorIcono={COLORES.error} fondoIcono={COLORES.errorFondo}
                titulo="Cerrar sesión" onPress={salir} />
            </Lista>
          </>
        );
      }}
    </Pantalla>
  );
}

/** Estado de la matrícula del año (solo estudiante, sin información económica). */
function Matricula() {
  // PISTA: «matricula» = datos que se cargan al abrir la pantalla: PerfilRepository.miMatricula() → GET
  //     /perfil/mi-matricula (backend: perfil_routes.py → mi_matricula()). Úsalos con matricula.datos;
  //     matricula.recargar() vuelve a pedirlos.
  const matricula = useConsulta(() => PerfilRepository.miMatricula(), []);
  if (matricula.cargando || matricula.error || !matricula.datos) return null;
  const m = matricula.datos;
  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <>
      <Seccion titulo={`Matrícula ${m.anio}`} />
      <Tarjeta>
        <Etiqueta texto={m.estado} tono={m.estado === 'MATRICULADO' ? 'exito' : 'alerta'} />
        <Fila rotulo="Nivel" valor={m.nivel} />
        <Fila rotulo="Grado y sección" valor={`${m.grado} ${m.seccion}`} />
        <Fila rotulo="Condición" valor={m.condicion} />
        <Fila rotulo="Tipo" valor={m.tipo_matricula} />
        <Fila rotulo="Fecha" valor={formatearFecha(m.fecha_matricula)} />
      </Tarjeta>
    </>
  );
}

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.md },
  flex: { flex: 1 },
});
