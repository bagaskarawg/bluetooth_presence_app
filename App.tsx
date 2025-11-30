import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { View, Text, ActivityIndicator } from 'react-native';

import TeacherDashboard from './src/screens/TeacherDashboard';
import CreateClassScreen from './src/screens/CreateClassScreen';
import StudentDashboard from './src/screens/StudentDashboard';
import ScanClassScreen from './src/screens/ScanClassScreen';
import ClassDetailsScreen from './src/screens/ClassDetailsScreen';
import SelfieScreen from './src/screens/SelfieScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : user.role.toUpperCase() === 'STUDENT' ? (
        <>
          <Stack.Screen name="StudentDashboard" component={StudentDashboard} options={{ headerShown: false }} />
          <Stack.Screen name="ScanClass" component={ScanClassScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SelfieScreen" component={SelfieScreen} options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} options={{ headerShown: false }} />
          <Stack.Screen name="CreateClass" component={CreateClassScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ClassDetails" component={ClassDetailsScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}

import { BluetoothService } from './src/services/BluetoothService';

// ...

export default function App() {
  React.useEffect(() => {
    const init = async () => {
      try {
        await BluetoothService.initialize();
      } catch (e) {
        console.error('Failed to initialize Bluetooth:', e);
      }
    };
    init();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
