import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme/colors';

/**
 * Escudo institucional del Colegio Amancio Varona - Tumán.
 * Soporta variante clara (para fondos oscuros/rojos) y oscura (para fondos blancos).
 */
export default function CrestLogo({ variant = 'dark', size = 'normal' }) {
  const isLight = variant === 'light';
  const iconColor = isLight ? '#ffffff' : colors.primary;
  const avTextColor = isLight ? '#ffffff' : colors.primary;
  const tumanColor = isLight ? '#fecaca' : colors.textSecondary;

  const isSmall = size === 'small';

  return (
    <View style={styles.container}>
      <Svg
        width={isSmall ? 24 : 30}
        height={isSmall ? 28 : 36}
        viewBox="0 0 32 38"
        fill="none"
      >
        {/* Silueta de Escudo */}
        <Path
          d="M16 2L3 6.5V17.5C3 26.5 8.5 33.5 16 36C23.5 33.5 29 26.5 29 17.5V6.5L16 2Z"
          stroke={iconColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={isLight ? 'rgba(255,255,255,0.12)' : 'rgba(200,32,29,0.06)'}
        />
        {/* Antorcha / Libro interior */}
        <Path
          d="M16 9V27M11 18L16 22L21 18"
          stroke={iconColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>

      <View style={styles.textColumn}>
        <Text style={[styles.avText, { color: avTextColor }, isSmall && styles.avTextSmall]}>
          AV
        </Text>
        <Text style={[styles.tumanText, { color: tumanColor }, isSmall && styles.tumanTextSmall]}>
          TUMÁN
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textColumn: {
    marginLeft: 7,
    justifyContent: 'center',
  },
  avText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 18,
  },
  avTextSmall: {
    fontSize: 15,
    lineHeight: 15,
  },
  tumanText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 2,
    lineHeight: 9,
  },
  tumanTextSmall: {
    fontSize: 7,
    letterSpacing: 1,
    marginTop: 1,
  },
});
