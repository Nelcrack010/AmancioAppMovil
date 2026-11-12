import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  leftIcon,
  isPassword = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  editable = true,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputBox, error && styles.inputBoxError]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={colors.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          editable={editable}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
            style={styles.eyeButton}
            accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 14,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 7,
    letterSpacing: 0.2,
  },
  inputBox: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },
  inputBoxError: {
    borderColor: colors.primary,
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 6,
  },
  errorText: {
    fontSize: 9,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '600',
  },
});
