// navigation/DrawerNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TabNavigator from './TabNavigator';
import ViewProfile from '../screens/ViewProfile'; 

const Drawer = createDrawerNavigator();

const MainDrawer = () => {
  return (
    <Drawer.Navigator initialRouteName="HomeTabs" screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="HomeTabs" component={TabNavigator} />
      <Drawer.Screen name="ViewProfile" component={ViewProfile} />
    </Drawer.Navigator>
  );
};

export default MainDrawer;
