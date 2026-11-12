import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import StatusBadge from '../common/StatusBadge';
import { colors } from '../../theme/colors';

export default function AppointmentCard({
  status = 'PROGRAMADA',
  title = 'Tu próxima cita',
  dateTime = 'Martes, 12 de noviembre · 10:30 a. m.',
  location = 'Consultorio de Psicología · 2° piso',
}) {
  return (
    <View style={styles.card}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="6%" stopColor={colors.purpleGradientStart} />
            <Stop offset="94%" stopColor={colors.purpleGradientEnd} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" rx={16} ry={16} fill="url(#purpleGrad)" />
      </Svg>

      {/* Icono Púrpura */}
      <View style={styles.iconBox}>
        <Ionicons name="heart-outline" size={20} color={colors.purple} />
      </View>

      {/* Contenido */}
      <View style={styles.contentCol}>
        <StatusBadge text={status} variant="blue" style={styles.badge} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.dateTime}>{dateTime}</Text>
        <Text style={styles.location}>{location}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
    overflow: 'hidden',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.purpleSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentCol: {
    flex: 1,
  },
  badge: {
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 8.5,
    fontWeight: '700',
    color: colors.purpleDark,
    marginBottom: 4,
  },
  location: {
    fontSize: 7.5,
    color: colors.textSecondary,
  },
});
