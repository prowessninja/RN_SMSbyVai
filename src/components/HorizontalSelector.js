// src/components/HorizontalSelector.js
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

const HorizontalSelector = ({ items, selectedId, onSelect }) => {
  // Guard clause to prevent errors if items is not an array or is undefined
  if (!Array.isArray(items) || items.length === 0) {
    return <Text>No data available</Text>;  // Or you could return null or a loading state
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id} // Ensure 'id' exists, otherwise use fallback
          onPress={() => onSelect(item)}
          style={[
            styles.item,
            selectedId === item.id && styles.selectedItem,
          ]}
        >
          <Text style={selectedId === item.id ? styles.selectedText : styles.text}>
            {item.name || item.year || item.display_name || 'N/A'}  {/* Fallback to 'N/A' */}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
  },
  selectedItem: {
    backgroundColor: '#007AFF',
  },
  text: {
    color: '#333',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HorizontalSelector;
