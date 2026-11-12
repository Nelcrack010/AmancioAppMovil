import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import ApiService from './src/services/api/apiService';

export default function App() {
  const [apiOnline, setApiOnline] = useState(false);
  const [apiStatus, setApiStatus] = useState('Verificando API...');

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
    <SafeAreaProvider style={styles.container}>
      <StatusBar style="auto" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
