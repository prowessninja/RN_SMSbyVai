import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UserCard = ({ user }) => {
  return (
    <View style={styles.card}>
      {user.profile_image ? (
        <Image source={{ uri: user.profile_image }} style={styles.avatar} />
      ) : (
        <Icon name="account-circle" size={60} color="#ccc" style={styles.avatar} />
      )}

      <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
        {user.first_name} {user.last_name}
      </Text>

      <Text style={styles.identifier} numberOfLines={1} ellipsizeMode="tail">
        {user.identifier || '-'}
      </Text>

      <View style={styles.infoRow}>
        <Icon name="checkbox-marked-circle" size={16} color={user.is_active ? '#4CAF50' : '#f44336'} />
        <Text style={styles.infoText}>{user.is_active ? 'Active' : 'Inactive'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Icon name="city" size={16} color="#555" />
        <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
          {user.city || '-'}
        </Text>
      </View>

      {user.email && (
        <View style={styles.infoRow}>
          <Icon name="email" size={16} color="#007AFF" />
          <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
            {user.email}
          </Text>
        </View>
      )}

      {user.phone && (
        <View style={styles.infoRow}>
          <Icon name="phone" size={16} color="#4CAF50" />
          <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
            {user.phone}
          </Text>
        </View>
      )}

      <View style={styles.infoRow}>
        <Icon name="clipboard-list" size={16} color="#555" />
        <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
          {user.criteria || '-'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    padding: 10,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 240,
    maxWidth: '100%',
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
  },
  infoText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#555',
    maxWidth: 120,
  },
});

export default UserCard;
