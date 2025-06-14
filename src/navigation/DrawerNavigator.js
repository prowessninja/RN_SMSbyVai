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
//import StationeryScreen from '../screens/StationeryListScreen';
import StationeryListScreen from '../screens/StationeryListScreen';
import ClassAndSectionDetailsScreen from '../screens/ClassAndSectionDetailsScreen';
import DepartmentDetailsScreen from '../screens/DepartmentDetailsScreen';
import StationeryTypesScreen from '../screens/StationeryTypesScreen';
import InventoryScreen from '../screens/InventoryScreen';
import InventoryTypesScreen from '../screens/InventoryTypesScreen';
import InventoryAnalyticsScreen from '../screens/InventoryAnalyticsScreen';
import FeeStructureScreen from '../screens/FeeStructureScreen';
import FeeTypesScreen from '../screens/FeeTypesScreen';
import StudentFeeStatus from '../screens/StudentFeeStatus';
import FeePaymentHistoryScreen from '../screens/FeePaymentHistoryScreen';
import FeeAnalyticsScreen from '../screens/FeeAnalyticsScreen';
import EventsScreen from '../screens/EventsScreen';
import EditEventScreen from '../screens/EditEventScreen';
import ClassAttendanceScreen from '../screens/ClassAttendanceScreen';
import StaffAttendanceScreen from '../screens/StaffAttendanceScreen';
import TimetableScreen from '../screens/TimetableScreen';


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
      <Stack.Screen name="Fee Structure" component={FeeStructureScreen} />
      <Stack.Screen name="Fee Types" component={FeeTypesScreen} />
      <Stack.Screen name="Student Fee Status" component={StudentFeeStatus} />
      <Stack.Screen name="Payment History" component={FeePaymentHistoryScreen} />
      <Stack.Screen name="Fee Analytics" component={FeeAnalyticsScreen} />
      <Stack.Screen name="Events" component={EventsScreen} />
      <Stack.Screen name="Class Attendance" component={ClassAttendanceScreen} />
      <Stack.Screen name="Staff Attendance" component={StaffAttendanceScreen} />
      <Stack.Screen name="Time Table" component={TimetableScreen} />

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
      <Drawer.Screen name="Fee Structure" component={FeeStructureScreen} />
      <Drawer.Screen name="Fee Types" component={FeeTypesScreen} />
      <Drawer.Screen name="Student Fee Status" component={StudentFeeStatus} />
      <Drawer.Screen name="Payment History" component={FeePaymentHistoryScreen} />
      <Drawer.Screen name="Fee Analytics" component={FeeAnalyticsScreen} />
      <Drawer.Screen name="Events" component={EventsScreen} />
      <Drawer.Screen name="EditEventScreen" component={EditEventScreen} />
      <Drawer.Screen name="Class Attendance" component={ClassAttendanceScreen} />
      <Drawer.Screen name="Staff Attendance" component={StaffAttendanceScreen} />
      <Drawer.Screen name="Time Table" component={TimetableScreen} />
    </Drawer.Navigator>
  );
};

export default MainDrawer;
