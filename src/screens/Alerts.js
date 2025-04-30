import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Alerts = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Alerts Screen</Text>
    </View>
  );
};

export default Alerts;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, fontWeight: 'bold' },
});
