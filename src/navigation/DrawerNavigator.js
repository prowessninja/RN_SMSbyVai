import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import ViewProfile from '../screens/ViewProfile';
import UsersScreen from '../screens/UsersScreen';
import AddUserScreen from '../screens/AddUserScreen';
import EditUserScreen from '../screens/EditUserScreen';
import UserDetailsScreen from '../screens/UserDetailsScreen';
import StandardsScreen from '../screens/StandardsScreen';
import DepartmentsScreen from '../screens/DepartmentsScreen';
import CustomDrawerContent from './CustomDrawerContent';
import UserPermissionsScreen from '../screens/UserPermissionsScreen';
import CreateRoleScreen from '../screens/CreateRoleScreen'; // adjust path if needed


const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function UsersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UsersScreen" component={UsersScreen} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
      <Stack.Screen name="EditUser" component={EditUserScreen} />
      <Stack.Screen name="Standards" component={StandardsScreen} />
      <Stack.Screen name="Permissions" component={UserPermissionsScreen} />
      <Stack.Screen name="CreateRole" component={CreateRoleScreen}  options={{ headerShown: true }}/>
      
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
      <Drawer.Screen name="Standards" component={StandardsScreen} />
      <Drawer.Screen name="Departments" component={DepartmentsScreen} />
      <Drawer.Screen name="User Permissions" component={UserPermissionsScreen} />
      <Drawer.Screen name="CreateRole" component={CreateRoleScreen}/>
    </Drawer.Navigator>
  );
};

export default MainDrawer;
