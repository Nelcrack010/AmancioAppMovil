// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: general   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: PendientesView: operaciones hechas sin conexión que esperan ser enviadas.
// Pantalla «Pendientes» (src/navigation/pantallas.js): pantalla de detalle, título «Operaciones pendientes»
//   Se abre desde: BannerConexion.jsx, PerfilView.jsx  con navigation.navigate('Pendientes', {...})
//
// Datos (repositorio → endpoint → backend):
//   ColaRepository.descartar() → solo en el celular
//   ColaRepository.listar() → solo en el celular
// Botones / secciones: «Descartar», «Enviar ahora», «Todo está al día»
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
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Boton from '../../components/Boton';
import Etiqueta from '../../components/Etiqueta';
import { Aviso, Vacio } from '../../components/Estados';
import { useConexion } from '../../context/ConexionContext';
import ColaRepository, { suscribirCambiosCola } from '../../repositories/colaRepository';
import { confirmar } from '../../utils/dialogos';
import { formatearMomentoLocal } from '../../utils/fechas';
import { COLORES, ESPACIO } from '../../config/tema';

/**
 * PendientesView: operaciones hechas sin conexión que esperan ser enviadas.
 *
 *   - PENDIENTE: se enviará sola al volver la red (o con "Enviar ahora").
 *   - ERROR:     el servidor la rechazó (por ejemplo, datos ya no válidos). Se muestra el
 *                motivo y el usuario puede descartarla.
 */
export default function PendientesView() {
  const { enLinea, sincronizando, sincronizar } = useConexion();
  const [operaciones, setOperaciones] = useState([]);
  const [resultado, setResultado] = useState(null);

  const cargar = useCallback(async () => setOperaciones(await ColaRepository.listar()), []);

  // Cargar al abrir y cada vez que la cola cambie.
  useEffect(() => {
    cargar();
    return suscribirCambiosCola(cargar);
  }, [cargar]);

  // PISTA: enviarAhora() se ejecuta al tocar el botón «Enviar ahora».
  const enviarAhora = async () => {
    const r = await sincronizar();
    setResultado(r);
  };

  // PISTA: descartar() se ejecuta al tocar el botón «Descartar».
  const descartar = async (op) => {
    if (await confirmar('Descartar operación', `"${op.descripcion}" no se enviará. ¿Continuar?`, { textoAceptar: 'Descartar', peligroso: true })) {
      await ColaRepository.descartar(op.id_operacion);
    }
  };

  const hayPendientes = operaciones.some((o) => o.estado === 'PENDIENTE');

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
  return (
    <Pantalla>
      {!enLinea && <Aviso tono="alerta" icono="cloud-offline">Sin conexión. Las operaciones se enviarán al volver la red.</Aviso>}
      {resultado && (
        <Aviso tono={resultado.conError ? 'alerta' : 'exito'}>
          Enviadas: {resultado.enviadas}. Rechazadas: {resultado.conError}.
        </Aviso>
      )}

      {operaciones.length === 0 ? (
        <Vacio icono="cloud-done-outline" titulo="Todo está al día" mensaje="No hay operaciones pendientes de envío." />
      ) : (
        <>
          {hayPendientes && (
            <Boton
              titulo="Enviar ahora"
              icono="cloud-upload-outline"
              onPress={enviarAhora}
              cargando={sincronizando}
              deshabilitado={!enLinea}
              style={estilos.boton}
            />
          )}
          {operaciones.map((op) => (
            <Tarjeta key={op.id_operacion} colorBorde={op.estado === 'ERROR' ? COLORES.error : COLORES.alerta}>
              <View style={estilos.fila}>
                <Texto negrita style={estilos.flex}>{op.descripcion}</Texto>
                <Etiqueta texto={op.estado === 'ERROR' ? 'Rechazada' : 'Pendiente'} tono={op.estado === 'ERROR' ? 'error' : 'alerta'} />
              </View>
              <Texto variante="diminuto">
                Hecha el {formatearMomentoLocal(op.creado_en)} · intentos: {op.intentos}
              </Texto>
              {op.ultimo_error && <Texto variante="pequeno" color={COLORES.error}>{op.ultimo_error}</Texto>}
              {op.estado === 'ERROR' && (
                <Boton titulo="Descartar" variante="peligro" pequeno icono="trash-outline" onPress={() => descartar(op)} />
              )}
            </Tarjeta>
          ))}
        </>
      )}
    </Pantalla>
  );
}

// PISTA: estilos de esta pantalla. Colores/espacios: src/config/tema.js (COLORES, ESPACIO, RADIO).
const estilos = StyleSheet.create({
  boton: { marginBottom: ESPACIO.md },
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.sm },
  flex: { flex: 1 },
});
