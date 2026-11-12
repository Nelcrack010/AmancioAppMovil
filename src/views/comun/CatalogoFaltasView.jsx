import React from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Etiqueta from '../../components/Etiqueta';
import { Seccion } from '../../components/Basicos';
import { Aviso } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import ConductaRepository from '../../repositories/conductaRepository';
import { TIPOS_FALTA } from '../../config/estados';
import { COLORES, ESPACIO } from '../../config/tema';

/**
 * CatalogoFaltasView: tipos de falta definidos por el colegio, agrupados por gravedad,
 * con los puntos que descuentan de la nota de conducta (sobre 20).
 */
export default function CatalogoFaltasView() {
  const faltas = useConsulta(() => ConductaRepository.faltas(), []);

  return (
    <Pantalla consulta={faltas}>
      {(lista) => {
        // Agrupar por tipo (Leve, Grave, Muy grave...) manteniendo el orden de la API.
        const grupos = lista.reduce((acc, f) => {
          (acc[f.tipo] = acc[f.tipo] || []).push(f);
          return acc;
        }, {});
        return (
          <>
            <Aviso tono="info">La nota de conducta empieza en 20 cada bimestre y baja con los puntos de cada falta.</Aviso>
            {Object.entries(grupos).map(([tipo, faltasDelTipo]) => (
              <View key={tipo}>
                <Seccion titulo={tipo} />
                {faltasDelTipo.map((f) => (
                  <Tarjeta key={f.id_falta}>
                    <View style={estilos.fila}>
                      <Texto style={estilos.flex}>{f.nombre}</Texto>
                      <Etiqueta texto={`−${f.puntos} pts`} tono={TIPOS_FALTA[tipo]?.tono || 'neutro'} />
                    </View>
                    {f.descripcion && <Texto variante="pequeno" color={COLORES.textoSecundario}>{f.descripcion}</Texto>}
                  </Tarjeta>
                ))}
              </View>
            ))}
          </>
        );
      }}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.sm },
  flex: { flex: 1 },
});
