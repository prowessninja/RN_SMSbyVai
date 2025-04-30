import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InfoTile = ({ title, value }) => (
  <View style={styles.tile}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  title: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
});

export default InfoTile;
