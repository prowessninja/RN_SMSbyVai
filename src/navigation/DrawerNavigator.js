// navigation/DrawerNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TabNavigator from './TabNavigator';
import ViewProfile from '../screens/ViewProfile';
import CustomDrawerContent from './CustomDrawerContent'; // ✅ Import your custom drawer

const Drawer = createDrawerNavigator();

const MainDrawer = () => {
  return (
    <Drawer.Navigator
      initialRouteName="HomeTabs"
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <CustomDrawerContent {...props} />} // ✅ Use it here
    >
      <Drawer.Screen name="HomeTabs" component={TabNavigator} />
      <Drawer.Screen name="ViewProfile" component={ViewProfile} />
    </Drawer.Navigator>
  );
};

export default MainDrawer;
