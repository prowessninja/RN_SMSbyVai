import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import ViewProfile from '../screens/ViewProfile';
import UsersScreen from '../screens/UsersScreen';
import UserScreen from '../screens/AddUserScreen';
import UserScreen from '../screens/EditUserScreen';
import UserDetailsScreen from '../screens/UserDetailsScreen';
import CustomDrawerContent from './CustomDrawerContent';


const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function UsersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UsersScreen" component={UsersScreen} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
      <Stack.Screen name="EditUser" component={EditUserScreen} />
    </Stack.Navigator>
  );
}

const MainDrawer = () => {
  return (
    <Drawer.Navigator
      initialRouteName="HomeTabs"
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="HomeTabs" component={TabNavigator} />
      <Drawer.Screen name="Users" component={UsersStack} />
      <Drawer.Screen name="ViewProfile" component={ViewProfile} />
    </Drawer.Navigator>
  );
};

export default MainDrawer;
