import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { AuthContext } from '../context/AuthContext';

const CustomDrawerContent = (props) => {
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout(); // <- call context logout to also update state
    props.navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/avatar.png')}
          style={styles.avatar}
        />
        <Text style={styles.name}>Welcome!</Text>
        <TouchableOpacity onPress={() => props.navigation.navigate('ViewProfile')}>
          <Text style={styles.link}>View Profile</Text>
        </TouchableOpacity>
      </View>

      <DrawerItemList {...props} />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#007bff',
    marginTop: 4,
  },
  logoutButton: {
    marginTop: 20,
    marginLeft: 20,
  },
  logoutText: {
    color: 'red',
    fontWeight: 'bold',
  },
});
