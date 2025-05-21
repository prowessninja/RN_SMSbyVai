// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import NoInternetOverlay from './src/components/NoInternetOverlay'; // 👈 Import it here

const Stack = createStackNavigator();

const AppWithNavigation = () => {
  const { theme } = useTheme();

  return (
    <>
      <NavigationContainer theme={theme}>
        <AppNavigator />
      </NavigationContainer>
      <NoInternetOverlay /> 
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppWithNavigation />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
