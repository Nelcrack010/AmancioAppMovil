// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Conducta   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: CatalogoFaltasView: tipos de falta definidos por el colegio, agrupados por gravedad, con los puntos
//     que descuentan de la nota de conducta (sobre 20).
// Pantalla «CatalogoFaltas» (src/navigation/pantallas.js): en el menú de AUXILIAR («Catálogo de faltas»),
//     PSICOLOGO («Faltas»), ADMIN («Faltas») (src/config/menus.js)
//   Se abre desde: InicioAdmin.jsx  con navigation.navigate('CatalogoFaltas', {...})
//
// Datos (repositorio → endpoint → backend):
//   ConductaRepository.faltas() → GET /conducta/faltas (backend: conducta_routes.py → faltas())
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
import { View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Lista, { ItemLista } from '../../components/Lista';
import Etiqueta from '../../components/Etiqueta';
import { Seccion } from '../../components/Basicos';
import { Aviso } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import ConductaRepository from '../../repositories/conductaRepository';
import { TIPOS_FALTA } from '../../config/estados';
// >>> KIT DE IMPORTS (para el examen): lo que una pantalla suele necesitar. Si no se usa, no pasa nada.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Boton from '../../components/Boton';
import Campo from '../../components/Campo';
import Selector from '../../components/Selector';
import DialogoTexto from '../../components/DialogoTexto';
import { Fila, FilaDatos, Dato, Separador } from '../../components/Basicos';
import { Vacio, Cargando } from '../../components/Estados';
import useAccion from '../../viewmodels/useAccion';
import AcademicoRepository from '../../repositories/academicoRepository';
import AsistenciaRepository from '../../repositories/asistenciaRepository';
import MensajesRepository from '../../repositories/mensajesRepository';
import PerfilRepository from '../../repositories/perfilRepository';
import { useSesion } from '../../context/SesionContext';
import { confirmar, avisar, avisarResultado } from '../../utils/dialogos';
import { validarTexto, validarEnlace, primerError } from '../../utils/validaciones';
import { formatearFecha, formatearFechaHora, hoyISO, esFechaValida, sumarDias } from '../../utils/fechas';
import { infoEstado, ESTADOS_CITA, ESTADOS_TAREA, ESTADOS_REPORTE } from '../../config/estados';
import { COLORES, ESPACIO, RADIO, SOMBRA } from '../../config/tema';
// <<< FIN KIT DE IMPORTS

/**
 * CatalogoFaltasView: tipos de falta definidos por el colegio, agrupados por gravedad,
 * con los puntos que descuentan de la nota de conducta (sobre 20).
 */
export default function CatalogoFaltasView() {
  // PISTA: «faltas» = datos que se cargan al abrir la pantalla: ConductaRepository.faltas() → GET
  //     /conducta/faltas (backend: conducta_routes.py → faltas()). Úsalos con faltas.datos; faltas.recargar()
  //     vuelve a pedirlos.
  const faltas = useConsulta(() => ConductaRepository.faltas(), []);

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
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
                <Lista>
                  {faltasDelTipo.map((f) => (
                    <ItemLista
                      key={f.id_falta}
                      titulo={f.nombre}
                      subtitulo={f.descripcion}
                      derecha={<Etiqueta texto={`−${f.puntos} pts`} tono={TIPOS_FALTA[tipo]?.tono || 'neutro'} />}
                    />
                  ))}
                </Lista>
              </View>
            ))}
          </>
        );
      }}
    </Pantalla>
  );
}
