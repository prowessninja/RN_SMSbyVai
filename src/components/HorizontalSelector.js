import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HorizontalSelector = ({ 
  items, 
  selectedId, 
  onSelect, 
  title = 'Select Option', 
  iconName = 'format-list-bulleted' 
}) => {
  if (!Array.isArray(items) || items.length === 0) {
    return <Text style={styles.noData}>No data available</Text>;
  }

  return (
    <LinearGradient colors={['#f9f9f9', '#e0e0e0']} style={styles.wrapper}>
      <View style={styles.header}>
        
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onSelect(item)}
            style={[
              styles.item,
              selectedId === item.id && styles.selectedItem,
            ]}
          >
            <Icon
              name="check-circle-outline"
              size={16}
              color={selectedId === item.id ? '#fff' : '#333'}
              style={{ marginRight: 6 }}
            />
            <Text style={selectedId === item.id ? styles.selectedText : styles.text}>
              {item.name || item.year || item.display_name || 'N/A'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  item: {
    flexDirection: 'row',
    height: 36,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#eee',
    borderRadius: 18,
  },
  selectedItem: {
    backgroundColor: '#007AFF',
  },
  text: {
    color: '#333',
    fontSize: 14,
  },
  selectedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noData: {
    color: '#555',
    fontSize: 14,
    paddingVertical: 10,
    textAlign: 'center',
  },
});

export default HorizontalSelector;
