import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

const ThemeContext = createContext();

const lightTheme = {
  dark: false,
  colors: {
    primary: '#2d3e83',
    background: '#ffffff',
    card: '#f5f5f5',
    text: '#000000',
    border: '#cccccc',
    notification: '#ff453a',
  },
};

const darkTheme = {
  dark: true,
  colors: {
    primary: '#8fa8ff',
    background: '#121212',
    card: '#1f1f1f',
    text: '#ffffff',
    border: '#444444',
    notification: '#ff453a',
  },
};


export const ThemeProvider = ({ children }) => {
  const systemColorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState(systemColorScheme === 'dark' ? darkTheme : lightTheme);
  const [isSystem, setIsSystem] = useState(true); // tracks if we're using system theme

  useEffect(() => {
  const handleAppearanceChange = ({ colorScheme }) => {
    if (isSystem) {
      setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    }
  };

  const subscription = Appearance.addChangeListener(handleAppearanceChange);

  return () => {
    subscription.remove();
  };
}, [isSystem]);

  const toggleTheme = () => {
    setIsSystem(false);
    setTheme((prevTheme) => (prevTheme.dark ? lightTheme : darkTheme));
  };

  const useSystemTheme = () => {
    setIsSystem(true);
    const systemTheme = Appearance.getColorScheme();
    setTheme(systemTheme === 'dark' ? darkTheme : lightTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isSystem, useSystemTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
