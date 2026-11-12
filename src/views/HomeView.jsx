import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PhoneHeader from '../components/common/PhoneHeader';
import StatusBadge from '../components/common/StatusBadge';
import OfflineBanner from '../components/common/OfflineBanner';
import TodayClassCard from '../components/home/TodayClassCard';
import {
  AttendanceCard,
  ConductCard,
  PsychologyHomeCard,
  TaskCard,
} from '../components/home/QuickMetricCard';
import VirtualClassCard from '../components/home/VirtualClassCard';
import ApiService from '../services/api/apiService';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function HomeView({ navigation }) {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    fecha: 'Miércoles, 6 de noviembre',
    nombre: user?.nombre || 'Lucía',
    iniciales: user?.iniciales || 'LR',
    grado: user?.grado || '3ro A · Secundaria',
    enLinea: true,
    accionesPendientes: 0,
    claseActual: {
      inicio: '08:00',
      fin: '09:30',
      tag: 'AHORA',
      curso: 'Matemática',
      aula: 'Aula 102',
      profesor: 'Prof. Carlos Quispe',
    },
    metricas: {
      asistencia: 95,
      presentes: 18,
      tardanzas: 1,
      faltas: 0,
      conducta: '20 / 20',
      conductaDetalle: 'Excelente · 0 deméritos',
      tarea: 'Práctica de Álgebra',
      tareaVence: 'Vence hoy · 18:00',
      cita: 'Cita programada',
      citaFecha: '12 Nov · 10:30 a. m.',
    },
    claseVirtual: {
      horario: '10:00 · EN 25 MIN',
      curso: 'Ciencia y Tecnología',
      tema: 'Laboratorio: células y tejidos',
    },
  });

  const loadData = async () => {
    try {
      const data = await ApiService.obtenerInicio();
      if (data) {
        setDashboardData((prev) => ({
          ...prev,
          ...data,
        }));
      }
      setIsOffline(false);
    } catch (error) {
      // Si la API falla, mantener datos seguros y señalar el modo offline
      setIsOffline(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleJoinVirtual = () => {
    Alert.alert(
      'Aula Virtual AV',
      `Conectando a la sesión en vivo de "${dashboardData.claseVirtual.curso}"...`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <PhoneHeader
        subtitle={dashboardData.fecha}
        title={`¡Hola, ${dashboardData.nombre}!`}
        badgeCount={3}
        onPressNotifications={() => {
          Alert.alert('Notificaciones', 'Tienes 3 avisos académicos sin leer.');
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Fila de Perfil / Estado del Estudiante */}
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{dashboardData.iniciales}</Text>
          </View>
          <StatusBadge text={dashboardData.grado} variant="red" style={styles.gradeBadge} />

          <View style={styles.onlineContainer}>
            <View
              style={[
                styles.onlineDot,
                { backgroundColor: isOffline ? colors.warningLight : colors.success },
              ]}
            />
            <Text
              style={[
                styles.onlineText,
                { color: isOffline ? colors.warning : colors.success },
              ]}
            >
              {isOffline ? 'Sin conexión' : 'En línea'}
            </Text>
          </View>
        </View>

        {/* Banner de Modo Sin Conexión */}
        <OfflineBanner
          isOffline={isOffline}
          pendingActions={isOffline ? 2 : dashboardData.accionesPendientes}
        />

        {/* Sección: Horario de hoy */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Horario de hoy</Text>
          <TouchableOpacity
            onPress={() => navigation?.navigate('MisCursos')}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionAction}>Ver horario</Text>
          </TouchableOpacity>
        </View>

        <TodayClassCard
          startTime={dashboardData.claseActual.inicio}
          endTime={dashboardData.claseActual.fin}
          statusTag={dashboardData.claseActual.tag}
          courseName={dashboardData.claseActual.curso}
          classroom={dashboardData.claseActual.aula}
          teacher={dashboardData.claseActual.profesor}
          onPress={() => navigation?.navigate('MisCursos')}
        />

        {/* Paginador carrusel de clases */}
        <View style={styles.carouselDots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Sección: Mis métricas rápidas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mis métricas rápidas</Text>
        </View>

        <View style={styles.metricsGrid}>
          <AttendanceCard
            percentage={dashboardData.metricas.asistencia}
            present={dashboardData.metricas.presentes}
            tardy={dashboardData.metricas.tardanzas}
            absent={dashboardData.metricas.faltas}
            onPress={() => navigation?.navigate('MisNotas')}
          />
          <View style={{ width: 10 }} />
          <ConductCard
            score={dashboardData.metricas.conducta}
            description={dashboardData.metricas.conductaDetalle}
            onPress={() => navigation?.navigate('MisNotas')}
          />
        </View>

        <TaskCard
          title={dashboardData.metricas.tarea}
          dueText={dashboardData.metricas.tareaVence}
          onPress={() => navigation?.navigate('MisCursos')}
        />

        <PsychologyHomeCard
          title={dashboardData.metricas.cita}
          dateText={dashboardData.metricas.citaFecha}
          onPress={() => navigation?.navigate('Bienestar')}
        />

        {/* Sección: Próxima clase virtual */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próxima clase virtual</Text>
        </View>

        <VirtualClassCard
          timeLabel={dashboardData.claseVirtual.horario}
          courseName={dashboardData.claseVirtual.curso}
          topic={dashboardData.claseVirtual.tema}
          onJoin={handleJoinVirtual}
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: '#fcd5d3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    shadowColor: '#fecaca',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    elevation: 2,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  gradeBadge: {
    marginLeft: 8,
  },
  onlineContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  onlineText: {
    fontSize: 8.5,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionAction: {
    fontSize: 8.5,
    fontWeight: '700',
    color: colors.primary,
  },
  carouselDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 2,
  },
  activeDot: {
    width: 12,
    backgroundColor: colors.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    width: '100%',
  },
});
