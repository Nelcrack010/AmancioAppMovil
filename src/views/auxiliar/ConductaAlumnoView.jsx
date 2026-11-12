import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Boton from '../../components/Boton';
import ResumenConducta from '../../components/ResumenConducta';
import DialogoTexto from '../../components/DialogoTexto';
import Texto from '../../components/Texto';
import { useSesion } from '../../context/SesionContext';
import useConsulta from '../../viewmodels/useConsulta';
import ConductaRepository from '../../repositories/conductaRepository';
import { ESPACIO } from '../../config/tema';

/** Roles que pueden anular reportes (regla del servidor). */
const PUEDEN_ANULAR = ['AUXILIAR', 'ADMIN'];

/**
 * ConductaAlumnoView (personal): estado de conducta de un estudiante.
 *   - Auxiliar: puede registrar un reporte nuevo y anular reportes (con motivo).
 *   - Administrador: puede anular reportes.
 *   - Psicólogo: puede ver su historial de citas.
 * params: { idAlumno }
 */
export default function ConductaAlumnoView({ navigation, route }) {
  const { idAlumno } = route.params;
  const { usuario } = useSesion();
  const conducta = useConsulta(() => ConductaRepository.estadoAlumno(idAlumno), [idAlumno]);
  const [porAnular, setPorAnular] = useState(null);   // reporte elegido para anular

  /** Anula el reporte; si el servidor lo rechaza, devuelve el mensaje para el diálogo. */
  const anular = async (motivo) => {
    try {
      await ConductaRepository.anularReporte(porAnular.id_reporte, motivo);
      conducta.recargar();
      return null;
    } catch (e) {
      return e.message;
    }
  };

  return (
    <>
      <Pantalla consulta={conducta}>
        {(datos) => {
          const nombre = `${datos.alumno.nombres} ${datos.alumno.apellidos}`;
          return (
            <>
              <Texto variante="subtitulo" style={estilos.nombre}>{nombre}</Texto>
              <View style={estilos.botones}>
                {usuario.rol === 'AUXILIAR' && (
                  <Boton titulo="Registrar reporte" icono="add-circle-outline" variante="guinda"
                    onPress={() => navigation.navigate('RegistrarReporte', { idAlumno, nombre })} />
                )}
                {usuario.rol === 'PSICOLOGO' && (
                  <Boton titulo="Historial de citas" icono="time-outline" variante="secundario"
                    onPress={() => navigation.navigate('HistorialAlumno', { idAlumno, titulo: datos.alumno.nombres })} />
                )}
              </View>
              <ResumenConducta
                datos={datos}
                alAnular={PUEDEN_ANULAR.includes(usuario.rol) ? setPorAnular : undefined}
              />
            </>
          );
        }}
      </Pantalla>

      <DialogoTexto
        visible={Boolean(porAnular)}
        titulo="Anular reporte"
        mensaje={porAnular ? `"${porAnular.falta}". Quedará registrado quién lo anuló y cuándo.` : undefined}
        etiqueta="Motivo de la anulación"
        minimo={5}
        textoAceptar="Anular"
        peligroso
        alAceptar={anular}
        alCerrar={() => setPorAnular(null)}
      />
    </>
  );
}

const estilos = StyleSheet.create({
  nombre: { marginBottom: ESPACIO.sm },
  botones: { gap: ESPACIO.sm, marginBottom: ESPACIO.md },
});
