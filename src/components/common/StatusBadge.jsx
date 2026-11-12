import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

const VARIANT_STYLES = {
  red: {
    bg: colors.primarySurface,
    text: colors.primary,
  },
  yellow: {
    bg: colors.warningSurface,
    text: colors.warningText,
  },
  green: {
    bg: colors.successSurface,
    text: colors.success,
  },
  blue: {
    bg: colors.infoSurface,
    text: colors.info,
  },
  gray: {
    bg: colors.surfaceMuted,
    text: colors.textSecondary,
  },
  purple: {
    bg: colors.purpleSurface,
    text: colors.purple,
  },
};

export default function StatusBadge({ text, variant = 'red', style }) {
  const currentVariant = VARIANT_STYLES[variant] || VARIANT_STYLES.red;

  return (
    <View style={[styles.badge, { backgroundColor: currentVariant.bg }, style]}>
      <Text style={[styles.text, { color: currentVariant.text }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 30,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
