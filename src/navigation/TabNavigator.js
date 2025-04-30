// navigation/TabNavigator.js
import React, { useContext, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome';

const Tab = createBottomTabNavigator();

const DummyScreen = ({ title }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{title}</Text>
  </View>
);

const LogoutScreen = () => {
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Logging you out…</Text>
    </View>
  );
};

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,

      // Icon for each tab
      tabBarIcon: ({ color, size }) => {
        let iconName;
        switch (route.name) {
          case 'Menu':
            iconName = 'bars';
            break;
          case 'Settings':
            iconName = 'cog';
            break;
          case 'Dashboard':
            iconName = 'home';
            break;
          case 'Alerts':
            iconName = 'bell';
            break;
          case 'Logout':
            iconName = 'sign-out';
            break;
          default:
            iconName = 'circle';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },

      // Moved from deprecated tabBarOptions
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { display: 'flex' },
    })}
  >
    <Tab.Screen name="Menu" children={() => <DummyScreen title="Menu Placeholder" />} />
    <Tab.Screen name="Settings" children={() => <DummyScreen title="Settings" />} />
    <Tab.Screen name="Dashboard" children={() => <DummyScreen title="Dashboard (JSON)" />} />
    <Tab.Screen name="Alerts" children={() => <DummyScreen title="Alerts" />} />
    <Tab.Screen name="Logout" component={LogoutScreen} />
  </Tab.Navigator>
);

export default TabNavigator;
