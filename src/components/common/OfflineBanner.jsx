import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function OfflineBanner({ pendingActions = 2, isOffline = false }) {
  // Si no está offline y no hay acciones pendientes, no se muestra
  if (!isOffline && pendingActions === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>Modo sin conexión</Text>
        <Text style={styles.subtitle}>
          {pendingActions > 0
            ? `${pendingActions} ${pendingActions === 1 ? 'acción pendiente' : 'acciones pendientes'} de sincronizar`
            : 'Conectividad limitada'}
        </Text>
      </View>
      <Ionicons name="cloud-offline-outline" size={17} color={colors.offlineText} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.offlineBg,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warningLight,
    marginRight: 10,
    shadowColor: colors.warningLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: colors.textInverse,
    fontSize: 8.5,
    fontWeight: '700',
    lineHeight: 12,
  },
  subtitle: {
    color: colors.offlineText,
    fontSize: 7.5,
    fontWeight: '400',
    lineHeight: 10,
    marginTop: 1,
  },
});
