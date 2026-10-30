import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import useViajesViewModel from '../viewmodels/useViajesViewModel';

/**
 * ViajesView: Componente de interfaz de usuario (View / Fragment).
 * Muestra el estado que provee el ViewModel y captura los eventos de usuario.
 */
export default function ViajesView() {
  const { viajes, cargando, error, modoOffline, cargarViajes, agregarViaje } =
    useViajesViewModel();

  const [nuevoDestino, setNuevoDestino] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');

  const handleAgregar = async () => {
    if (!nuevoDestino.trim() || !nuevoPrecio.trim()) {
      Alert.alert('Atención', 'Por favor ingresa destino y precio.');
      return;
    }
    const precioNum = parseFloat(nuevoPrecio);
    if (isNaN(precioNum)) {
      Alert.alert('Error', 'El precio debe ser un número válido.');
      return;
    }

    const fechaHoy = new Date().toISOString().split('T')[0];
    await agregarViaje(nuevoDestino.trim(), fechaHoy, precioNum);
    setNuevoDestino('');
    setNuevoPrecio('');
  };

  return (
    <View style={styles.container}>
      {/* Cabecera y Estado */}
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Viajes / Módulo</Text>
        <Text
          style={[
            styles.badge,
            modoOffline ? styles.badgeOffline : styles.badgeOnline,
          ]}
        >
          {modoOffline ? 'Modo Offline (SQLite/Room)' : 'En línea (API REST)'}
        </Text>
      </View>

      {error && <Text style={styles.errorText}>⚠️ {error}</Text>}

      {/* Formulario de captura de eventos */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Registrar nuevo elemento:</Text>
        <TextInput
          style={styles.input}
          placeholder="Destino o Título..."
          value={nuevoDestino}
          onChangeText={setNuevoDestino}
        />
        <TextInput
          style={styles.input}
          placeholder="Precio o Valor..."
          keyboardType="numeric"
          value={nuevoPrecio}
          onChangeText={setNuevoPrecio}
        />
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleAgregar}
          disabled={cargando}
        >
          <Text style={styles.btnText}>+ Agregar (Local / Sincronizar)</Text>
        </TouchableOpacity>
      </View>

      {/* Acciones */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => cargarViajes(true)}
        >
          <Text style={styles.btnSecondaryText}>🔄 Sincronizar con API</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => cargarViajes(false)}
        >
          <Text style={styles.btnSecondaryText}>📂 Ver solo Local</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Datos */}
      {cargando ? (
        <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={viajes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.destino}</Text>
                <Text style={styles.cardSub}>Fecha: {item.fecha}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.cardPrice}>S/ {item.precio}</Text>
                <Text style={item.sincronizado ? styles.synced : styles.notSynced}>
                  {item.sincronizado ? '✓ Sincronizado' : '⏳ Pendiente local'}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No hay registros aún. Agrega uno arriba para probar la base de datos local y remota.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  header: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  badgeOnline: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  badgeOffline: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 8,
    fontSize: 13,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  btnPrimary: {
    backgroundColor: '#0284c7',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  cardSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  synced: {
    fontSize: 11,
    color: '#16a34a',
    marginTop: 2,
  },
  notSynced: {
    fontSize: 11,
    color: '#d97706',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 24,
    fontStyle: 'italic',
  },
});
