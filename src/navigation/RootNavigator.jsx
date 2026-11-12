import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginView from '../views/LoginView';
import BottomTabNavigator from './BottomTabNavigator';
import CrestLogo from '../components/common/CrestLogo';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <CrestLogo variant="dark" />
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginView}
            options={{ animation: 'fade' }}
          />
        ) : (
          <Stack.Screen
            name="Main"
            component={BottomTabNavigator}
            options={{ animation: 'fade' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
