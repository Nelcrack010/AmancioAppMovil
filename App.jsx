import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';
import ViajesView from './src/views/ViajesView.jsx';
import ApiService from './src/services/api/apiService';
import { API_CONFIG } from './src/config/constants';

export default function App() {
  const [apiStatus, setApiStatus] = useState('Verificando API...');
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    // Probar conexión directa con el backend en Oracle Cloud
    ApiService.verificarSalud()
      .then((res) => {
        setApiStatus(`${res.servicio || 'API'} (status: ${res.status || 'ok'})`);
        setApiOnline(true);
      })
      .catch((err) => {
        setApiStatus(`Sin conexión al servidor: ${err.message}`);
        setApiOnline(false);
      });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {/* Barra superior de estado de la API */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.appName}>Amancio Varona — App Móvil</Text>
          <Text style={styles.apiUrl}>{API_CONFIG.BASE_URL}</Text>
        </View>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: apiOnline ? '#22c55e' : '#ef4444' },
          ]}
        />
      </View>
      <View style={styles.statusSubtitleContainer}>
        <Text style={styles.statusSubtitle}>
          Estado del Servidor: <Text style={{ fontWeight: '600' }}>{apiStatus}</Text>
        </Text>
      </View>

      {/* Vista principal (patrón MVVM) */}
      <ViajesView />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  apiUrl: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusSubtitleContainer: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  statusSubtitle: {
    fontSize: 11,
    color: '#475569',
  },
});
