import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PhoneHeader from '../components/common/PhoneHeader';
import CustomButton from '../components/common/CustomButton';
import AppointmentCard from '../components/wellbeing/AppointmentCard';
import TrackingTimeline from '../components/wellbeing/TrackingTimeline';
import { colors } from '../theme/colors';

const TIMELINE_STEPS = [
  {
    id: 'step-1',
    title: 'Solicitud recibida',
    subtitle: '04 nov. · 09:42',
    status: 'completed',
  },
  {
    id: 'step-2',
    title: 'Cita programada',
    subtitle: '05 nov. · 14:20',
    status: 'completed',
  },
  {
    id: 'step-3',
    title: 'Atención',
    subtitle: 'Próximo paso',
    status: 'pending',
  },
];

export default function WellbeingView() {
  const [requesting, setRequesting] = useState(false);

  const handleNewAppointment = () => {
    Alert.alert(
      'Solicitar Cita de Psicología',
      '¿Deseas enviar una nueva solicitud de acompañamiento al departamento de Psicología?',
      [
        {
          text: 'Confirmar',
          onPress: () => {
            setRequesting(true);
            setTimeout(() => {
              setRequesting(false);
              Alert.alert(
                'Solicitud Enviada',
                'El equipo de Psicología revisará tu solicitud y se comunicará contigo a la brevedad.'
              );
            }, 800);
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <PhoneHeader
        subtitle="Acompañamiento psicológico"
        title="Mi bienestar"
        badgeCount={3}
        onPressNotifications={() => {
          Alert.alert('Notificaciones', 'Tienes 3 avisos académicos sin leer.');
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta de Próxima Cita con Gradiente Violeta */}
        <AppointmentCard
          status="PROGRAMADA"
          title="Tu próxima cita"
          dateTime="Martes, 12 de noviembre · 10:30 a. m."
          location="Consultorio de Psicología · 2° piso"
        />

        {/* Sección: Seguimiento de solicitud */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Seguimiento de solicitud</Text>
        </View>

        <TrackingTimeline steps={TIMELINE_STEPS} />

        {/* Aviso de Confidencialidad y Privacidad */}
        <View style={styles.privacyCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={colors.purple}
            style={styles.privacyIcon}
          />
          <View style={styles.privacyContent}>
            <Text style={styles.privacyTitle}>Tu privacidad es importante</Text>
            <Text style={styles.privacyText}>
              La información de tus citas se maneja de forma confidencial por el
              equipo de Psicología.
            </Text>
          </View>
        </View>

        {/* Botón de Solicitar Nueva Cita */}
        <CustomButton
          title="Solicitar nueva cita"
          icon="add-circle-outline"
          iconPosition="left"
          loading={requesting}
          onPress={handleNewAppointment}
          style={styles.requestButton}
          size="compact"
        />
      </ScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  privacyCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  privacyIcon: {
    marginRight: 9,
    marginTop: 1,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 8.5,
    fontWeight: '700',
    color: colors.purple,
    marginBottom: 3,
  },
  privacyText: {
    fontSize: 7.5,
    color: colors.textSecondary,
    lineHeight: 11,
  },
  requestButton: {
    marginTop: 16,
  },
});
