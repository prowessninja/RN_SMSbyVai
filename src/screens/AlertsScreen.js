import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';

const AlertsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="notifications-outline" size={24} color="#2d3e83" style={{ marginRight: 8 }} />
          <Text style={styles.headerText}>Alerts</Text>
        </View>
      </View>

      {/* Animation & Text */}
      <View style={styles.content}>
        <LottieView
          source={require('../../assets/animations/no-internet.json')} // 👈 Add your Lottie file here
          autoPlay
          loop
          style={styles.lottie}
        />
        <Text style={styles.noAlertsText}>No Alerts to Display</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3e83',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lottie: {
    width: 200,
    height: 200,
  },
  noAlertsText: {
    marginTop: 20,
    fontSize: 18,
    color: '#666',
  },
});

export default AlertsScreen;
