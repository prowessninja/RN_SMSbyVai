import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UserRow = ({ user, index }) => {
  const getStatusColor = (isActive) => (isActive ? '#4CAF50' : '#F44336');

  return (
    <View style={styles.row}>
      <Text style={styles.cell}>{index + 1}</Text>

      <View style={[styles.cell, styles.nameCell]}>
        <Image
          source={
            user.profile_image
              ? { uri: user.profile_image }
              : require('../../assets/avatar.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{`${user.first_name || ''} ${user.last_name || ''}`.trim()}</Text>
      </View>

      <Text style={styles.cell}>{user.employee_id || user.admission_number || '-'}</Text>

      <View style={[styles.cell, styles.statusCell]}>
        <Icon
          name={user.is_active ? 'check-circle' : 'close-circle'}
          size={18}
          color={getStatusColor(user.is_active)}
        />
        <Text style={{ marginLeft: 5 }}>
          {user.is_active ? 'Active' : 'Inactive'}
        </Text>
      </View>

      <Text style={styles.cell}>
        {user.address?.city || user.address?.district || '-'}
      </Text>

      <View style={[styles.cell, styles.contactCell]}>
        {user.email && (
          <>
            <Icon name="email" size={16} color="#007AFF" style={styles.icon} />
            <Text style={styles.contactText}>{user.email}</Text>
          </>
        )}
        {user.phone && (
          <>
            <Icon name="phone" size={16} color="#007AFF" style={styles.icon} />
            <Text style={styles.contactText}>{user.phone}</Text>
          </>
        )}
      </View>

      <Text style={styles.cell}>{user.student_type || user.designation || '-'}</Text>

      <TouchableOpacity style={styles.cell}>
        <Icon name="dots-vertical" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  statusCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactCell: {
    flexDirection: 'column',
  },
  icon: {
    marginRight: 4,
    marginTop: 2,
  },
  contactText: {
    fontSize: 12,
    color: '#333',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    color: '#000',
  },
});

export default UserRow;
