import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import Selector from '../../components/Selector';
import { Avatar } from '../../components/Basicos';
import { Cargando, ErrorVista, Vacio } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import { hoyISO } from '../../utils/fechas';
import { ESPACIO } from '../../config/tema';

/**
 * ConductaView (auxiliar): elegir sección y estudiante para registrar un reporte de
 * conducta o revisar su estado (nota de conducta, reportes, anulaciones).
 */
export default function ConductaView({ navigation }) {
  const secciones = useConsulta(() => AcademicoRepository.secciones(), []);
  const [idSeccion, setIdSeccion] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const alumnos = useConsulta(
    () => (idSeccion ? AsistenciaRepository.alumnosDeSeccion(idSeccion, hoyISO()) : null),
    [idSeccion],
  );

  useEffect(() => {
    if (!idSeccion && secciones.datos?.length) setIdSeccion(secciones.datos[0].id_seccion);
  }, [secciones.datos, idSeccion]);

  if (secciones.cargando) return <Cargando />;
  if (secciones.error) return <ErrorVista error={secciones.error} onReintentar={secciones.recargar} />;

  const texto = busqueda.trim().toLowerCase();

  return (
    <Pantalla>
      <Selector
        opciones={secciones.datos.map((s) => ({ valor: s.id_seccion, texto: `${s.grado} ${s.nombre} · ${s.nivel}` }))}
        valor={idSeccion}
        alCambiar={setIdSeccion}
      />
      <Campo valor={busqueda} alCambiar={setBusqueda} placeholder="Buscar estudiante" />

      {alumnos.cargando ? <Cargando /> : alumnos.error ? (
        <ErrorVista error={alumnos.error} onReintentar={alumnos.recargar} />
      ) : (() => {
        const lista = alumnos.datos.filter((a) => `${a.nombres} ${a.apellidos}`.toLowerCase().includes(texto));
        if (lista.length === 0) return <Vacio icono="people-outline" titulo="Sin estudiantes" />;
        return lista.map((a) => {
          const nombre = `${a.nombres} ${a.apellidos}`;
          return (
            <Tarjeta key={a.id_alumno} onPress={() => navigation.navigate('ConductaAlumno', { idAlumno: a.id_alumno, titulo: a.nombres })}>
              <View style={estilos.fila}>
                <Avatar nombre={nombre} tamano={38} />
                <Texto negrita style={estilos.flex}>{a.apellidos}, {a.nombres}</Texto>
                <Boton
                  titulo="Reporte"
                  icono="add"
                  variante="guinda"
                  pequeno
                  onPress={() => navigation.navigate('RegistrarReporte', { idAlumno: a.id_alumno, nombre })}
                />
              </View>
            </Tarjeta>
          );
        });
      })()}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.md },
  flex: { flex: 1 },
});
