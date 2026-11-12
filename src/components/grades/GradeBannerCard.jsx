import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import StatusBadge from '../common/StatusBadge';
import { colors } from '../../theme/colors';

export default function GradeBannerCard({
  periodLabel = 'Promedio del 3° bimestre',
  average = '17.7',
  achievement = 'LOGRO DESTACADO',
  barHeights = [26, 36, 33, 46],
}) {
  return (
    <View style={styles.card}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="gradesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8a1515" />
            <Stop offset="100%" stopColor="#c8201d" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" rx={17} ry={17} fill="url(#gradesGrad)" />
        <Circle
          cx="335"
          cy="20"
          r={65}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={20}
          fill="none"
        />
      </Svg>

      {/* Contenido Izquierdo */}
      <View style={styles.contentLeft}>
        <Text style={styles.periodLabel}>{periodLabel}</Text>
        <Text style={styles.averageValue}>{average}</Text>
        <StatusBadge
          text={achievement}
          variant="green"
          style={styles.achievementBadge}
        />
      </View>

      {/* Gráfico de Barras a la Derecha */}
      <View style={styles.barsContainer}>
        {barHeights.map((h, index) => {
          const isCurrent = index === barHeights.length - 1;
          return (
            <View
              key={index}
              style={[
                styles.bar,
                { height: h },
                isCurrent ? styles.currentBar : styles.regularBar,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 122,
    borderRadius: 17,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    overflow: 'hidden',
  },
  contentLeft: {
    justifyContent: 'center',
  },
  periodLabel: {
    fontSize: 7.5,
    color: '#fecaca',
    fontWeight: '600',
  },
  averageValue: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.textInverse,
    letterSpacing: -1.5,
    marginVertical: 1,
  },
  achievementBadge: {
    marginTop: 2,
    backgroundColor: colors.successSurface,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 52,
    marginRight: 6,
  },
  bar: {
    width: 8,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    marginHorizontal: 2.5,
  },
  regularBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  currentBar: {
    backgroundColor: colors.textInverse,
  },
});
