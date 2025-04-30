// navigation/TabNavigator.js
import React, { useContext, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import Dashboard from '../screens/Dashboard'; 

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

const TabNavigator = () => {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        // Default icon behavior for non-Menu tabs
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
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

        // Tint colors
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { display: 'flex' },
      })}
    >
      <Tab.Screen
        name="Menu"
        children={() => <DummyScreen title="Menu Placeholder" />}
        options={{
          // Custom button to open drawer
          tabBarButton: (props) => (
            <TouchableOpacity {...props} onPress={() => navigation.openDrawer()}>
              <Icon
                name="bars"
                size={24}
                color={props.focused ? '#007AFF' : 'gray'}
              />
              <Text style={{ color: props.focused ? '#007AFF' : 'gray', fontSize: 12 }}>
                Menu
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen name="Settings" children={() => <DummyScreen title="Settings" />} />
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Alerts" children={() => <DummyScreen title="Alerts" />} />
      <Tab.Screen name="Logout" component={LogoutScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
