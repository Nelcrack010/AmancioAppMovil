import React from 'react';
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PhoneHeader from '../components/common/PhoneHeader';
import StatusBadge from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function ProfileView() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir del campus virtual?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <PhoneHeader
        subtitle="Colegio Amancio Varona"
        title="Perfil institucional"
        badgeCount={3}
      />

      <View style={styles.container}>
        {/* Tarjeta de Usuario */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.iniciales || 'LR'}</Text>
          </View>
          <Text style={styles.name}>{user?.nombre || 'Lucía Rodríguez'}</Text>
          <Text style={styles.code}>
            Código: <Text style={styles.bold}>{user?.codigo || 'ALU-12345678'}</Text>
          </Text>
          <StatusBadge
            text={user?.grado || '3ro A · Secundaria'}
            variant="red"
            style={styles.badge}
          />
        </View>

        {/* Opciones de Perfil */}
        <View style={styles.optionsCard}>
          <View style={styles.optionRow}>
            <Ionicons name="school-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.optionLabel}>Sede</Text>
            <Text style={styles.optionValue}>Campus Tumán</Text>
          </View>

          <View style={styles.optionRow}>
            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.optionLabel}>Correo</Text>
            <Text style={styles.optionValue}>lrodriguez@amanciovarona.edu.pe</Text>
          </View>

          <View style={styles.optionRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.optionLabel}>Estado de matrícula</Text>
            <Text style={[styles.optionValue, { color: colors.success, fontWeight: '700' }]}>
              Regular
            </Text>
          </View>
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.primary} />
          <Text style={styles.logoutText}>Cerrar sesión institucional</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#fcd5d3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  code: {
    fontSize: 9.5,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  badge: {
    marginTop: 4,
  },
  optionsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  optionLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    marginLeft: 10,
    flex: 1,
  },
  optionValue: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  logoutButton: {
    height: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primarySurface,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: colors.primary,
    fontSize: 10.5,
    fontWeight: '700',
    marginLeft: 8,
  },
});
