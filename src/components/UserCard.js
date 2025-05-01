import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const UserCard = ({ user }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.navigate('UserDetails', { userId: user.id })} activeOpacity={0.8}>
      <View style={styles.card}>
        {/* Profile Image */}
        {user.profile_image ? (
          <Image source={{ uri: user.profile_image }} style={styles.avatar} />
        ) : (
          <Icon name="account-circle" size={60} color="#ccc" style={styles.avatar} />
        )}

        {/* Name and Identifier */}
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {user.first_name} {user.last_name}
        </Text>
        {/* ➤ Add Employee ID */}
        <Text style={styles.identifier} numberOfLines={1} ellipsizeMode="tail">
          Identifier: {user.employee_id || '-'}
        </Text>

        {/* Status */}
        <View style={styles.infoRow}>
          <Icon name="checkbox-marked-circle" size={16} color={user.is_active ? '#4CAF50' : '#f44336'} />
          <Text style={styles.infoText}>{user.is_active ? 'Active' : 'Inactive'}</Text>
        </View>

        {/* City */}
        <View style={styles.infoRow}>
          <Icon name="city" size={16} color="#555" />
          <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
            {user.address?.city || '-'}
          </Text>
        </View>

        {/* Email */}
        {user.email && (
          <View style={styles.infoRow}>
            <Icon name="email" size={16} color="#007AFF" />
            <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
              {user.email}
            </Text>
          </View>
        )}

        {/* Phone */}
        {user.phone && (
          <View style={styles.infoRow}>
            <Icon name="phone" size={16} color="#4CAF50" />
            <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
              {user.phone}
            </Text>
          </View>
        )}

        {/* Criteria */}
        
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    padding: 12,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 250,
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  identifier: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    maxWidth: '100%',
  },
  infoText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#555',
    flexShrink: 1,
  },
});

export default UserCard;
