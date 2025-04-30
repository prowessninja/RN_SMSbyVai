import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DummyMenu = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Menu Screen (Custom Sidebar Items)</Text>
    </View>
  );
};

export default DummyMenu;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, fontWeight: 'bold' },
});
