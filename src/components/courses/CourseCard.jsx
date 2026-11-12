import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import StatusBadge from '../common/StatusBadge';
import { colors } from '../../theme/colors';

export default function CourseCard({
  symbol = '∑',
  symbolBg = '#fef2f2',
  symbolColor = colors.primary,
  area = 'ÁREA ACADÉMICA',
  name = 'Matemática',
  teacher = 'Prof. Carlos Quispe',
  grade = '3ro A',
  pendingTasks = 2,
  average = '17.7',
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Símbolo Temático */}
      <View style={[styles.symbolBox, { backgroundColor: symbolBg }]}>
        <Text style={[styles.symbolText, { color: symbolColor }]}>{symbol}</Text>
      </View>

      {/* Información del Curso */}
      <View style={styles.infoCol}>
        <Text style={styles.areaTag}>{area}</Text>
        <Text style={styles.courseName}>{name}</Text>
        <Text style={styles.teacherName}>{teacher}</Text>

        <View style={styles.badgesRow}>
          {grade ? (
            <StatusBadge text={grade} variant="gray" style={styles.badgeItem} />
          ) : null}
          {pendingTasks > 0 ? (
            <StatusBadge
              text={`${pendingTasks} ${pendingTasks === 1 ? 'pendiente' : 'pendientes'}`}
              variant="yellow"
              style={styles.badgeItem}
            />
          ) : null}
        </View>
      </View>

      {/* Promedio */}
      <View style={styles.gradeCol}>
        <Text style={styles.gradeLabel}>Prom.</Text>
        <Text style={styles.gradeValue}>{average}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  symbolBox: {
    width: 45,
    height: 58,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolText: {
    fontSize: 17,
    fontWeight: '800',
  },
  infoCol: {
    flex: 1,
    marginLeft: 11,
    justifyContent: 'center',
  },
  areaTag: {
    fontSize: 6.5,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  courseName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
  teacherName: {
    fontSize: 7.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  badgeItem: {
    marginRight: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  gradeCol: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 42,
  },
  gradeLabel: {
    fontSize: 6.5,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  gradeValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.success,
  },
});
