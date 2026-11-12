import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PhoneHeader from '../components/common/PhoneHeader';
import SegmentedTabs from '../components/common/SegmentedTabs';
import GradeBannerCard from '../components/grades/GradeBannerCard';
import { colors } from '../theme/colors';

const VIEW_MODE_TABS = [
  { id: 'bimestre', label: 'Notas del bimestre' },
  { id: 'anual', label: 'Libreta anual' },
];

const EVALUATIONS_MATEMATICA = [
  { id: 1, name: 'Práctica calificada 1', score: 18 },
  { id: 2, name: 'Examen parcial', score: 16 },
  { id: 3, name: 'Tareas y participación', score: 19 },
  { id: 4, name: 'Proyecto colaborativo', score: 18 },
];

export default function GradesView() {
  const [activeMode, setActiveMode] = useState('bimestre');
  const [selectedCourse, setSelectedCourse] = useState('Matemática');
  const [selectedPeriod, setSelectedPeriod] = useState('3° Bimestre');

  const evaluations = EVALUATIONS_MATEMATICA;
  const calculatedAverage = (
    evaluations.reduce((acc, curr) => acc + curr.score, 0) / evaluations.length
  ).toFixed(1);

  const handleSelectCourse = () => {
    Alert.alert(
      'Seleccionar Curso',
      'Elige una materia para consultar sus evaluaciones:',
      [
        { text: 'Matemática', onPress: () => setSelectedCourse('Matemática') },
        { text: 'Comunicación', onPress: () => setSelectedCourse('Comunicación') },
        { text: 'Ciencia y Tecnología', onPress: () => setSelectedCourse('Ciencia y Tecnología') },
        { text: 'Ciencias Sociales', onPress: () => setSelectedCourse('Ciencias Sociales') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <PhoneHeader
        subtitle="Rendimiento académico"
        title="Mis notas"
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
        {/* Selector de Modo (Notas del bimestre vs Libreta anual) */}
        <SegmentedTabs
          tabs={VIEW_MODE_TABS}
          activeTab={activeMode}
          onTabChange={setActiveMode}
          activeColor={colors.textPrimary}
        />

        {/* Tarjeta de Promedio Bimestral con Gradiente Rojo */}
        <GradeBannerCard
          periodLabel={`Promedio del ${selectedPeriod.toLowerCase()}`}
          average={calculatedAverage}
          achievement="LOGRO DESTACADO"
        />

        {/* Selector Desplegable de Curso */}
        <TouchableOpacity
          style={styles.courseSelector}
          onPress={handleSelectCourse}
          activeOpacity={0.7}
        >
          <Text style={styles.courseSelectorName}>{selectedCourse}</Text>
          <View style={styles.periodRow}>
            <Text style={styles.periodText}>{selectedPeriod}</Text>
            <Ionicons
              name="chevron-down"
              size={15}
              color={colors.textSecondary}
              style={{ marginLeft: 3 }}
            />
          </View>
        </TouchableOpacity>

        {/* Título de la sección */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Detalle de evaluaciones</Text>
        </View>

        {/* Tabla de Evaluaciones */}
        <View style={styles.tableCard}>
          {evaluations.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.itemLeft}>
                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>{item.id}</Text>
                </View>
                <Text style={styles.evaluationName}>{item.name}</Text>
              </View>
              <Text style={styles.evaluationScore}>{item.score}</Text>
            </View>
          ))}

          {/* Fila Resumen Footer */}
          <View style={styles.tableFooter}>
            <Text style={styles.footerLabel}>Promedio calculado</Text>
            <Text style={styles.footerScore}>{calculatedAverage}</Text>
          </View>
        </View>
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
    paddingTop: 12,
    paddingBottom: 28,
  },
  courseSelector: {
    height: 39,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  courseSelectorName: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodText: {
    fontSize: 7.5,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sectionHeader: {
    marginTop: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tableCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    overflow: 'hidden',
  },
  tableRow: {
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  numberText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  evaluationName: {
    fontSize: 8.5,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  evaluationScore: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tableFooter: {
    height: 44,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  footerLabel: {
    fontSize: 8.5,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  footerScore: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.success,
  },
});
