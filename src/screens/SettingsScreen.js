import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';


const SettingsScreen = () => {
  const navigation = useNavigation();

  const email = 'user@example.com';
  const maskedPassword = '********';

  const handleBack = () => {
    navigation.navigate('Dashboard');
  };

  const handleChangeEmail = () => {
    // Navigate or handle change email logic
    console.log('Change Email pressed');
  };

  const handleResetPassword = () => {
    // Navigate or handle reset password logic
    console.log('Reset Password pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.heading}>Settings</Text>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          {/* Email Row */}
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Email Address:</Text>
              <Text style={styles.value}>{email}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleChangeEmail}>
              <Text style={styles.buttonText}>Change Email</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Password Row */}
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Password:</Text>
              <Text style={styles.value}>{maskedPassword}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#333',
  },
  section: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2d3e83',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  value: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#2d3e83',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 12,
  },
});

export default SettingsScreen;
