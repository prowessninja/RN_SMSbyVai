import React, { useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Switch } from 'react-native';

const DynamicForm = ({ schema, data, onChange }) => {
  // Add logs on initial render
  useEffect(() => {
    console.log('📦 DynamicForm received schema:', schema);
    console.log('📦 DynamicForm received data:', data);
  }, [schema, data]);

  if (!schema || !schema.properties) {
    console.warn('⚠️ DynamicForm: schema or schema.properties is missing!');
    return null;
  }

  if (!data || typeof data !== 'object') {
    console.warn('⚠️ DynamicForm: data is missing or invalid!');
    return null;
  }

  return (
    <View>
      {Object.entries(schema.properties).map(([key, prop]) => {
        const value = data[key];
        const isBoolean = prop.type === 'boolean';
        const isDate = prop.format === 'date';

        return (
          <View key={key} style={styles.fieldContainer}>
            <Text style={styles.label}>{prop.title || key}</Text>

            {isBoolean ? (
              <Switch
                value={!!value}
                onValueChange={(val) => {
                  console.log(`🖋 onChange called for [${key}]:`, val);
                  onChange(key, val);
                }}
              />
            ) : (
              <TextInput
                style={styles.input}
                placeholder={prop.description || key}
                value={value !== undefined && value !== null ? String(value) : ''}
                onChangeText={(text) => {
                  console.log(`🖋 onChange called for [${key}]:`, text);
                  onChange(key, text);
                }}
                keyboardType={isDate ? 'numbers-and-punctuation' : 'default'}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: { marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
  },
});

export default DynamicForm;
