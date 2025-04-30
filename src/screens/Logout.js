import React, { useEffect, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const Logout = () => {
  const { logout } = useContext(AuthContext);

  // just clear the token; AppNavigator will send you back to Login
  useEffect(() => {
    logout();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Logging you out…</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1,justifyContent:'center',alignItems:'center' },
  text:      { marginTop:10, fontSize:16 },
});

export default Logout;
