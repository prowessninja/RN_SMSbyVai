import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/screens/Login';
import MainDrawer from './src/navigation/DrawerNavigator';
import { AuthProvider } from './src/context/AuthContext'; 
import AppNavigator from './src/navigation/AppNavigator'; // Correct path




const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider> 
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="MainDrawer" component={MainDrawer} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default AppNavigator;
// Fresh commit checkpoint: 6:30PM 1st May 2025

