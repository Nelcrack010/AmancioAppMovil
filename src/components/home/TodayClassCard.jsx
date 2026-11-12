import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function TodayClassCard({
  startTime = '08:00',
  endTime = '09:30',
  statusTag = 'AHORA',
  courseName = 'Matemática',
  classroom = 'Aula 102',
  teacher = 'Prof. Carlos Quispe',
  onPress,
}) {
  return (
    <View style={styles.card}>
      {/* Columna Horas */}
      <View style={styles.timeColumn}>
        <Text style={styles.startTime}>{startTime}</Text>
        <Text style={styles.endTime}>{endTime}</Text>
      </View>

      {/* Línea divisoria de acento */}
      <View style={styles.accentLine} />

      {/* Detalle de la clase */}
      <View style={styles.infoColumn}>
        <Text style={styles.statusTag}>{statusTag}</Text>
        <Text style={styles.courseName}>{courseName}</Text>
        <Text style={styles.subDetail}>
          {classroom} · {teacher}
        </Text>
      </View>

      {/* Botón de acceso directo */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginVertical: 4,
  },
  timeColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 42,
  },
  startTime: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  endTime: {
    fontSize: 8,
    color: colors.textSecondary,
    marginTop: 2,
  },
  accentLine: {
    width: 2.5,
    height: 38,
    backgroundColor: colors.primaryLight,
    borderRadius: 2,
    marginHorizontal: 10,
  },
  infoColumn: {
    flex: 1,
  },
  statusTag: {
    fontSize: 7,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  courseName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  subDetail: {
    fontSize: 7.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryPill,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
