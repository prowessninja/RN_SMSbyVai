import React from 'react';
import {
  FlatList,
  ActivityIndicator,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import UserCard from './UserCard';

const UserCardList = ({ users, loading, onEndReached }) => {
  if (loading && users.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!loading && users.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No users found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.cardContainer}>
          <UserCard user={item} />
        </View>
      )}
      numColumns={2}
      columnWrapperStyle={styles.row}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loading ? <ActivityIndicator size="small" color="#007AFF" style={styles.footerLoader} /> : null
      }
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  cardContainer: {
    flex: 1,
    marginVertical: 10,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 3,
  },
  footerLoader: {
    marginVertical: 10,
  },
});

export default UserCardList;
