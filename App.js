// App.js
import React, { useState, useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';

import AnimatedSplash from './src/components/AnimatedSplash';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import NoInternetOverlay from './src/components/NoInternetOverlay';

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
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    SplashScreen.hide(); // hide native splash when RN is ready
  }, []);

  if (showSplash) {
    return <AnimatedSplash onAnimationEnd={() => setShowSplash(false)} />;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppWithNavigation />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
