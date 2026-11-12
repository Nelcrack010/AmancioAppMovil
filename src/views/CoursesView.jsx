import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PhoneHeader from '../components/common/PhoneHeader';
import SegmentedTabs from '../components/common/SegmentedTabs';
import CourseCard from '../components/courses/CourseCard';
import ApiService from '../services/api/apiService';
import { colors } from '../theme/colors';

const BIMESTRE_TABS = [
  { id: '1', label: '1° Bim.' },
  { id: '2', label: '2° Bim.' },
  { id: '3', label: '3° Bim.' },
  { id: '4', label: '4° Bim.' },
];

const DEFAULT_COURSES = [
  {
    id: 'mat',
    symbol: '∑',
    symbolBg: '#fef2f2',
    symbolColor: '#c8201d',
    name: 'Matemática',
    teacher: 'Prof. Carlos Quispe',
    grade: '3ro A',
    pendingTasks: 2,
    average: '17.7',
  },
  {
    id: 'com',
    symbol: 'Aa',
    symbolBg: '#dbeafe',
    symbolColor: '#2563eb',
    name: 'Comunicación',
    teacher: 'Prof. María Valdivia',
    grade: '3ro A',
    pendingTasks: 1,
    average: '18.2',
  },
  {
    id: 'cyt',
    symbol: '⚗',
    symbolBg: '#dcfce7',
    symbolColor: '#16a34a',
    name: 'Ciencia y Tecnología',
    teacher: 'Prof. Rosa Medina',
    grade: '3ro A',
    pendingTasks: 0,
    average: '16.8',
  },
  {
    id: 'ccss',
    symbol: '◎',
    symbolBg: '#fef3c7',
    symbolColor: '#d97706',
    name: 'Ciencias Sociales',
    teacher: 'Prof. Luis Herrera',
    grade: '3ro A',
    pendingTasks: 3,
    average: '17.1',
  },
];

export default function CoursesView({ navigation }) {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [activeBimestre, setActiveBimestre] = useState('3');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadCourses = async () => {
    try {
      const data = await ApiService.obtenerCursos();
      if (Array.isArray(data) && data.length > 0) {
        setCourses(data);
      }
    } catch (e) {
      // Fallback a los cursos predeterminados de Figma
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <PhoneHeader
        subtitle="3ro A · Secundaria"
        title="Mis cursos"
        badgeCount={3}
        onPressNotifications={() => {
          Alert.alert('Notificaciones', 'Tienes 3 avisos académicos sin leer.');
        }}
      />

      <View style={styles.container}>
        {/* Barra de Búsqueda */}
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar un curso..."
            placeholderTextColor="rgba(15, 23, 42, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Ionicons
              name="close-circle"
              size={16}
              color={colors.textSecondary}
              onPress={() => setSearchQuery('')}
            />
          )}
        </View>

        {/* Selector de Bimestres */}
        <SegmentedTabs
          tabs={BIMESTRE_TABS}
          activeTab={activeBimestre}
          onTabChange={setActiveBimestre}
          activeColor={colors.primary}
        />

        {/* Listado de Cursos */}
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CourseCard
              symbol={item.symbol}
              symbolBg={item.symbolBg}
              symbolColor={item.symbolColor}
              name={item.name}
              teacher={item.teacher}
              grade={item.grade}
              pendingTasks={item.pendingTasks}
              average={item.average}
              onPress={() => {
                Alert.alert(
                  item.name,
                  `Docente: ${item.teacher}\nPromedio: ${item.average}\nTareas pendientes: ${item.pendingTasks}`
                );
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={36} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                No se encontraron cursos coincidentes
              </Text>
            </View>
          }
        />
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
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBox: {
    height: 40,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 9.5,
    color: colors.textPrimary,
  },
  listContent: {
    paddingTop: 6,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 9.5,
    color: colors.textSecondary,
  },
});
