import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeView from '../views/HomeView';
import CoursesView from '../views/CoursesView';
import GradesView from '../views/GradesView';
import WellbeingView from '../views/WellbeingView';
import ProfileView from '../views/ProfileView';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeView}
        options={{
          tabBarLabel: 'Panel',
          tabBarIcon: ({ focused }) => (
            <TabIconItem
              focused={focused}
              iconName={focused ? 'grid' : 'grid-outline'}
            />
          ),
        }}
      />

      <Tab.Screen
        name="MisCursos"
        component={CoursesView}
        options={{
          tabBarLabel: 'Mis',
          tabBarIcon: ({ focused }) => (
            <TabIconItem
              focused={focused}
              iconName={focused ? 'book' : 'book-outline'}
            />
          ),
        }}
      />

      <Tab.Screen
        name="MisNotas"
        component={GradesView}
        options={{
          tabBarLabel: 'Notas',
          tabBarIcon: ({ focused }) => (
            <TabIconItem
              focused={focused}
              iconName={focused ? 'ribbon' : 'ribbon-outline'}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Bienestar"
        component={WellbeingView}
        options={{
          tabBarLabel: 'Psicología',
          tabBarIcon: ({ focused }) => (
            <TabIconItem
              focused={focused}
              iconName={focused ? 'heart' : 'heart-outline'}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Perfil"
        component={ProfileView}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIconItem
              focused={focused}
              iconName={focused ? 'person' : 'person-outline'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function TabIconItem({ focused, iconName }) {
  return (
    <View style={[styles.iconContainer, focused && styles.activeIconPill]}>
      <Ionicons
        name={iconName}
        size={19}
        color={focused ? colors.primary : colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 67,
    paddingTop: 6,
    paddingBottom: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabBarLabel: {
    fontSize: 7.5,
    fontWeight: '700',
    marginTop: 2,
  },
  iconContainer: {
    height: 27,
    minWidth: 42,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  activeIconPill: {
    backgroundColor: colors.primaryPill,
  },
});
