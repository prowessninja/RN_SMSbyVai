import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const InfoTile = ({ title, value, icon, backgroundColor = '#0a1f44' }) => (
  <View style={[styles.tile, { backgroundColor }]}>
    {icon && <Icon name={icon} size={28} color="#fff" style={styles.icon} />}
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  icon: {
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    padding: 6,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fefefe',
  },
  title: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default InfoTile;
