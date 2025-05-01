// src/navigation/AppNavigator.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';                   // up one level to src/screens
import MainDrawer from './DrawerNavigator';             // same folder
import { AuthProvider, AuthContext } from '../context/AuthContext'; // up one to src/context


const Stack = createNativeStackNavigator();

const InnerNavigator = () => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token
          ? <Stack.Screen name="MainDrawer" component={MainDrawer} />
          : <Stack.Screen name="Login"       component={Login} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default () => (
  <AuthProvider>
    <InnerNavigator />
  </AuthProvider>
);
