import React, { useEffect, useState } from 'react';
import Pantalla from '../../components/Pantalla';
import Lista, { BotonIcono, ItemLista } from '../../components/Lista';
import Campo from '../../components/Campo';
import Selector from '../../components/Selector';
import { Avatar } from '../../components/Basicos';
import { Cargando, ErrorVista, Vacio } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import AcademicoRepository from '../../repositories/academicoRepository';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import { hoyISO } from '../../utils/fechas';
import { COLORES } from '../../config/tema';

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
        return (
          <Lista>
            {lista.map((a) => {
              const nombre = `${a.nombres} ${a.apellidos}`;
              return (
                <ItemLista
                  key={a.id_alumno}
                  izquierda={<Avatar nombre={nombre} tamano={36} />}
                  titulo={`${a.apellidos}, ${a.nombres}`}
                  subtitulo="Ver conducta y reportes"
                  derecha={(
                    <BotonIcono
                      icono="add-circle"
                      color={COLORES.guinda}
                      etiqueta={`Registrar reporte para ${a.nombres}`}
                      onPress={() => navigation.navigate('RegistrarReporte', { idAlumno: a.id_alumno, nombre })}
                    />
                  )}
                  onPress={() => navigation.navigate('ConductaAlumno', { idAlumno: a.id_alumno, titulo: a.nombres })}
                />
              );
            })}
          </Lista>
        );
      })()}
    </Pantalla>
  );
}
