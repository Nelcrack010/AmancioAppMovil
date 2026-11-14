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

/**
 * PerfilView: datos del usuario, familiar (estudiante), estado de matrícula (estudiante)
 * y acciones de la cuenta: editar datos, cambiar contraseña y cerrar sesión.
 */
export default function PerfilView({ navigation }) {
  const { usuario, cerrarSesion } = useSesion();
  const { pendientes } = useConexion();
  const perfil = useConsulta(() => PerfilRepository.miPerfil(usuario.username), [usuario.username]);

  const salir = async () => {
    const mensaje = pendientes > 0
      ? `Tienes ${pendientes} operación(es) sin enviar. Si cierras sesión se perderán.`
      : '¿Seguro que quieres cerrar sesión?';
    if (await confirmar('Cerrar sesión', mensaje, { textoAceptar: 'Cerrar sesión', peligroso: true })) {
      await cerrarSesion();
    }
  };

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
  const matricula = useConsulta(() => PerfilRepository.miMatricula(), []);
  if (matricula.cargando || matricula.error || !matricula.datos) return null;
  const m = matricula.datos;
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

const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.md },
  flex: { flex: 1 },
});
