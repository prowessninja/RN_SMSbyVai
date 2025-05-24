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
import BrachesScreen from '../screens/BranchesScreen';
import BranchesScreen from '../screens/BranchesScreen';
import StationeryScreen from '../screens/StationeryListScreen';
import StationeryListScreen from '../screens/StationeryListScreen';
import ClassAndSectionDetailsScreen from '../screens/ClassAndSectionDetailsScreen';
import DepartmentDetailsScreen from '../screens/DepartmentDetailsScreen';
import StationeryTypesScreen from '../screens/StationeryTypesScreen';
import InventoryScreen from '../screens/InventoryScreen';
import InventoryTypesScreen from '../screens/InventoryTypesScreen';
import InventoryAnalyticsScreen from '../screens/InventoryAnalyticsScreen';


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
      <Stack.Screen name="CreateRole" component={CreateRoleScreen} options={{ headerShown: true }} />
      <Stack.Screen name="Branches" component={BrachesScreen} />
      <Stack.Screen name="Stationery List" component={StationeryListScreen} />
      <Stack.Screen name="ClassAndSecDet" component={ClassAndSectionDetailsScreen} />
      <Stack.Screen name="DepartmentDet" component={DepartmentDetailsScreen} />
      <Stack.Screen name="Stationery Types" component={StationeryTypesScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="Inventory Types" component={InventoryTypesScreen} />
      <Stack.Screen name="Inventory Analytics" component={InventoryAnalyticsScreen} />
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
      <Drawer.Screen name="CreateRole" component={CreateRoleScreen} />
      <Drawer.Screen name="Branches" component={BranchesScreen} />
      <Drawer.Screen name="Stationery List" component={StationeryListScreen} />
      <Drawer.Screen name="ClassAndSecDet" component={ClassAndSectionDetailsScreen} />
      <Drawer.Screen name="DepartmentDet" component={DepartmentDetailsScreen} />
      <Drawer.Screen name="Stationery Types" component={StationeryTypesScreen} />
      <Drawer.Screen name="Inventory" component={InventoryScreen} />
      <Drawer.Screen name="Inventory Types" component={InventoryTypesScreen} />
      <Drawer.Screen name="Inventory Analytics" component={InventoryAnalyticsScreen} />
    </Drawer.Navigator>
  );
};

export default MainDrawer;
