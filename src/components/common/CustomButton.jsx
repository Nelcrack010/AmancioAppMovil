import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function CustomButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'right',
  style,
  size = 'normal',
}) {
  const isCompact = size === 'compact';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isCompact && styles.buttonCompact,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.textInverse} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={18}
              color={colors.textInverse}
              style={styles.leftIcon}
            />
          )}
          <Text style={[styles.text, isCompact && styles.textCompact]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={18}
              color={colors.textInverse}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 49,
    backgroundColor: colors.primary,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
    width: '100%',
  },
  buttonCompact: {
    height: 41,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  text: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  textCompact: {
    fontSize: 9.5,
  },
});
