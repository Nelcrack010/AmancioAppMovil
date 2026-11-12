import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import CrestLogo from '../components/common/CrestLogo';
import CustomInput from '../components/common/CustomInput';
import CustomButton from '../components/common/CustomButton';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function LoginView() {
  const { login } = useAuth();
  const [username, setUsername] = useState('ALU-12345678');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!username.trim()) {
      setErrorMessage('Por favor ingresa tu código de usuario');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Por favor ingresa tu contraseña institucional');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    const result = await login(username.trim(), password.trim());
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  const handleSupport = () => {
    Alert.alert(
      'Soporte Técnico AV',
      'Si olvidaste tus credenciales, comunícate con la secretaría académica o escribe a soporte@amanciovarona.edu.pe'
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <StatusBar barStyle="light-content" backgroundColor="#8a1515" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabecera Superior con Gradiente Institucional de Figma */}
        <View style={styles.headerContainer}>
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="loginGrad" x1="0%" y1="0%" x2="50%" y2="100%">
                <Stop offset="7.7%" stopColor="#8a1515" />
                <Stop offset="92.3%" stopColor="#c8201d" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#loginGrad)" />
            {/* Círculos decorativos concéntricos translúcidos */}
            <Circle
              cx={width * 0.8}
              cy={60}
              r={150}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1.5"
              fill="none"
            />
            <Circle
              cx={width * 0.8}
              cy={60}
              r={200}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1.5"
              fill="none"
            />
          </Svg>

          <View style={styles.headerContent}>
            {/* Crest Institucional */}
            <View style={styles.crestRow}>
              <CrestLogo variant="light" />
            </View>

            {/* Subtítulo institucional en mayúsculas */}
            <Text style={styles.schoolTag}>
              COLEGIO AMANCIO VARONA · TUMÁN
            </Text>

            {/* Título de bienvenida */}
            <Text style={styles.heroTitle}>
              Tu campus,{'\n'}siempre contigo.
            </Text>

            {/* Subtexto inspirador */}
            <Text style={styles.heroSubtitle}>
              Aprende, conecta y avanza desde cualquier lugar.
            </Text>
          </View>
        </View>

        {/* Tarjeta de Formulario estilo Bottom Sheet */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTag}>Campus Virtual Móvil</Text>
            <Text style={styles.formTitle}>Bienvenido al Campus AV</Text>
            <Text style={styles.formSubtitle}>
              Ingresa con tus credenciales institucionales.
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.inputsContainer}>
            <CustomInput
              label="Código de usuario"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Ej. ALU-12345678"
              leftIcon="person-outline"
              autoCapitalize="characters"
            />

            <CustomInput
              label="Contraseña"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="••••••••••••"
              leftIcon="lock-closed-outline"
              isPassword
            />

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <CustomButton
              title="Iniciar sesión"
              icon="log-in-outline"
              iconPosition="right"
              loading={loading}
              onPress={handleLogin}
              style={styles.loginButton}
            />
          </View>

          {/* Pie de Página */}
          <View style={styles.footerContainer}>
            <TouchableOpacity onPress={handleSupport} activeOpacity={0.7}>
              <Text style={styles.supportText}>
                ¿Necesitas ayuda?{' '}
                <Text style={styles.supportHighlight}>Contactar a soporte</Text>
              </Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>Campus AV Móvil · v1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 44 : 28,
  },
  crestRow: {
    marginBottom: 20,
  },
  schoolTag: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#fecaca',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '400',
    color: colors.textInverse,
    lineHeight: 35,
    letterSpacing: -1.2,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 10,
    fontWeight: '400',
    color: '#fee2e2',
    lineHeight: 15,
  },
  formCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -22,
    paddingHorizontal: 23,
    paddingTop: 26,
    paddingBottom: 32,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 6,
  },
  formHeader: {
    marginBottom: 20,
  },
  formTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  formTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 15,
  },
  inputsContainer: {
    width: '100%',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  errorText: {
    color: colors.primary,
    fontSize: 9.5,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 6,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 28,
  },
  supportText: {
    fontSize: 9.5,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  supportHighlight: {
    fontWeight: '700',
    color: colors.primary,
  },
  versionText: {
    fontSize: 7.5,
    color: colors.textMuted,
  },
});
