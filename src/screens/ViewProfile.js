import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';  // ✅ Import useNavigation

const ViewProfile = () => {
  const navigation = useNavigation();  // ✅ Hook to access navigation

  return (
    <View style={styles.container}>
      

      <Text style={styles.title}>User Profile</Text>
      <Text style={styles.text}>Name: John Doe</Text>
      <Text style={styles.text}>Email: john.doe@example.com</Text>
      <Text style={styles.text}>Role: Student</Text>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  backButton: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  backText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ViewProfile;
