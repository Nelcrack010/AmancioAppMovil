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

  const enviarAhora = async () => {
    const r = await sincronizar();
    setResultado(r);
  };

  const descartar = async (op) => {
    if (await confirmar('Descartar operación', `"${op.descripcion}" no se enviará. ¿Continuar?`, { textoAceptar: 'Descartar', peligroso: true })) {
      await ColaRepository.descartar(op.id_operacion);
    }
  };

  const hayPendientes = operaciones.some((o) => o.estado === 'PENDIENTE');

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

const estilos = StyleSheet.create({
  boton: { marginBottom: ESPACIO.md },
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.sm },
  flex: { flex: 1 },
});
