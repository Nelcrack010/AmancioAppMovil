import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';

/**
 * Tarjetas de métricas del panel principal
 */
export function AttendanceCard({ percentage = 95, present = 18, tardy = 1, absent = 0, onPress }) {
  const radius = 16;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <TouchableOpacity
      style={[styles.smallCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.chartContainer}>
        <Svg width={38} height={38} viewBox="0 0 38 38">
          <Circle
            cx="19"
            cy="19"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx="19"
            cy="19"
            r={radius}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            transform="rotate(-90 19 19)"
          />
        </Svg>
        <Text style={styles.percentageText}>{percentage}%</Text>
      </View>

      <View style={styles.metricTextColumn}>
        <Text style={styles.metricLabel}>Asistencia</Text>
        <Text style={styles.metricValue}>
          <Text style={{ color: colors.success }}>{present}P</Text>
          <Text style={{ color: colors.textSecondary }}> · </Text>
          <Text style={{ color: colors.warning }}>{tardy}T</Text>
          <Text style={{ color: colors.textSecondary }}> · {absent}F</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function ConductCard({ score = '20 / 20', description = 'Excelente · 0 deméritos', onPress }) {
  return (
    <TouchableOpacity
      style={[styles.smallCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.successSurface }]}>
        <Ionicons name="shield-checkmark" size={18} color={colors.success} />
      </View>
      <View style={styles.metricTextColumn}>
        <Text style={styles.metricLabel}>Conducta</Text>
        <Text style={styles.largeValue}>{score}</Text>
        <Text style={styles.metricSub}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function TaskCard({ title = 'Práctica de Álgebra', dueText = 'Vence hoy · 18:00', onPress }) {
  return (
    <TouchableOpacity
      style={styles.wideCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.warningSurface }]}>
        <Ionicons name="document-text-outline" size={18} color={colors.warning} />
      </View>

      <View style={styles.wideCardContent}>
        <Text style={styles.metricLabel}>Próxima tarea</Text>
        <Text style={styles.wideTitle}>{title}</Text>
        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>{dueText}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

export function PsychologyHomeCard({ title = 'Cita programada', dateText = '12 Nov · 10:30 a. m.', onPress }) {
  return (
    <TouchableOpacity
      style={styles.wideCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.purpleSurface }]}>
        <Ionicons name="heart-outline" size={18} color={colors.purple} />
      </View>

      <View style={styles.wideCardContent}>
        <Text style={styles.metricLabel}>Psicología</Text>
        <Text style={styles.wideTitle}>{title}</Text>
        <Text style={styles.metricSub}>{dateText}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  smallCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    padding: 12,
    minHeight: 96,
    justifyContent: 'space-between',
  },
  chartContainer: {
    width: 38,
    height: 38,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTextColumn: {
    marginTop: 6,
  },
  metricLabel: {
    fontSize: 7.5,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 8,
    fontWeight: '700',
  },
  largeValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 16,
  },
  metricSub: {
    fontSize: 7,
    color: colors.textSecondary,
    marginTop: 1,
  },
  wideCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  wideCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  wideTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
    marginBottom: 3,
  },
  badgePill: {
    backgroundColor: colors.warningSurface,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgePillText: {
    fontSize: 7,
    fontWeight: '700',
    color: colors.warningText,
  },
});
