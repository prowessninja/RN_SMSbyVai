// src/components/HorizontalSelector.js
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const HorizontalSelector = ({ items, selectedId, onSelect }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return <Text style={styles.noData}>No data available</Text>;
  }

  return (
    <View style={styles.container}>
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
            <Text style={selectedId === item.id ? styles.selectedText : styles.text}>
              {item.name || item.year || item.display_name || 'N/A'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50, // fixed height
    marginVertical: 10,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  item: {
    height: 36,
    paddingHorizontal: 16,
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
