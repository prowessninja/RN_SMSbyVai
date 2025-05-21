import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Feather from 'react-native-vector-icons/Feather';

import Dashboard from '../screens/Dashboard';
import SettingsScreen from '../screens/SettingsScreen';
import AlertsScreen from '../screens/AlertsScreen';

const Tab = createBottomTabNavigator();

const DummyScreen = ({ title }) => (
  <View style={styles.center}>
    <Text>{title}</Text>
  </View>
);

const AnimatedIcon = ({ name, focused, size, color }) => {
  const scaleValue = React.useRef(new Animated.Value(focused ? 1.2 : 1)).current;

  React.useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.2 : 1,
      useNativeDriver: true,
      friction: 5,
      tension: 150,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Feather name={name} size={size} color={color} />
    </Animated.View>
  );
};

const LogoutTabButton = ({ accessibilityState }) => {
  const focused = accessibilityState.selected;
  const { logout } = useContext(AuthContext);

  const confirmLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Pressable
      onPress={confirmLogout}
      style={({ pressed }) => [
        styles.tabButton,
        {
          opacity: pressed ? 0.6 : 1,
          borderTopColor: focused ? '#e74c3c' : 'transparent',
          borderTopWidth: 3,
        },
      ]}
    >
      <Feather name="log-out" size={28} color={focused ? '#e74c3c' : 'gray'} />
      <Text style={[styles.tabLabel, { color: focused ? '#e74c3c' : 'gray' }]}>
        Logout
      </Text>
    </Pressable>
  );
};

const TabNavigator = () => {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.floatingTabBar,
        tabBarIcon: ({ size, focused }) => {
          let iconName = '';
          switch (route.name) {
            case 'Settings':
              iconName = 'settings';
              break;
            case 'Dashboard':
              iconName = 'home';
              break;
            case 'Alerts':
              iconName = 'alert-circle';
              break;
            case 'Menu':
              iconName = 'menu';
              break;
            default:
              iconName = 'circle';
          }

          const iconColor = focused ? '#007AFF' : 'gray';

          return (
            <View style={styles.iconContainer}>
              <AnimatedIcon
                name={iconName}
                size={size}
                focused={focused}
                color={iconColor}
              />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          );
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Menu"
        children={() => <DummyScreen title="" />}
        options={{
          tabBarButton: (props) => (
            <Pressable
              {...props}
              onPress={() => navigation.openDrawer()}
              style={({ pressed }) => [
                styles.tabButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Feather
                name="menu"
                size={28}
                color={props.accessibilityState.selected ? '#007AFF' : 'gray'}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: props.accessibilityState.selected
                      ? '#007AFF'
                      : 'gray',
                  },
                ]}
              >
                Menu
              </Text>
            </Pressable>
          ),
        }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen
        name="Logout"
        component={DummyScreen}
        options={{
          tabBarButton: (props) => <LogoutTabButton {...props} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingTabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    elevation: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    height: 60,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    borderTopWidth: 0, // remove default border
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
  },
  activeIndicator: {
    marginTop: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
});

export default TabNavigator;
