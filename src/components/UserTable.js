import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UserTable = ({ users }) => {
  const renderItem = ({ item, index }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{index + 1}</Text>

      <View style={[styles.cell, styles.nameCell]}>
        {item.profile_image ? (
          <Image source={{ uri: item.profile_image }} style={styles.avatar} />
        ) : (
          <Icon name="account" size={20} color="#666" style={styles.avatarFallback} />
        )}
        <Text>{item.first_name} {item.last_name}</Text>
      </View>

      <Text style={styles.cell}>{item.identifier || '-'}</Text>
      <Text style={styles.cell}>{item.is_active ? 'Active' : 'Inactive'}</Text>
      <Text style={styles.cell}>{item.city || '-'}</Text>

      <View style={[styles.cell, styles.contactCell]}>
        {item.email && <Icon name="email" size={16} color="#007AFF" style={styles.contactIcon} />}
        {item.phone && <Icon name="phone" size={16} color="#4CAF50" style={styles.contactIcon} />}
      </View>

      <Text style={styles.cell}>{item.criteria || '-'}</Text>

      <TouchableOpacity style={styles.cell}>
        <Icon name="dots-vertical" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      ListHeaderComponent={() => (
        <View style={[styles.row, styles.headerRow]}>
          <Text style={styles.headerCell}>S.No</Text>
          <Text style={[styles.headerCell, styles.nameCell]}>Name <Icon name="filter" size={14} /></Text>
          <Text style={styles.headerCell}>Identifier</Text>
          <Text style={styles.headerCell}>Status <Icon name="sort" size={14} /></Text>
          <Text style={styles.headerCell}>City <Icon name="filter" size={14} /></Text>
          <Text style={styles.headerCell}>Contact</Text>
          <Text style={styles.headerCell}>Criteria</Text>
          <Text style={styles.headerCell}>Actions</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  headerRow: {
    backgroundColor: '#f5f5f5',
  },
  cell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  headerCell: {
    flex: 1,
    paddingHorizontal: 4,
    fontWeight: 'bold',
  },
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  avatarFallback: {
    marginRight: 6,
  },
  contactCell: {
    flexDirection: 'row',
  },
  contactIcon: {
    marginHorizontal: 4,
  },
});

export default UserTable;
