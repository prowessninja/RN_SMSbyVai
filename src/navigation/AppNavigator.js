// src/navigation/AppNavigator.js
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Correct import
import Login from '../screens/Login';
import MainDrawer from './DrawerNavigator';  // Adjust path if necessary
import { AuthContext } from '../context/AuthContext'; // Correct import

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { token, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token
        ? <Stack.Screen name="MainDrawer" component={MainDrawer} />
        : <Stack.Screen name="Login" component={Login} />}
    </Stack.Navigator>
  );
};

export default AppNavigator;
