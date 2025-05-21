// StationeryTypeModal.js
import React from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';

const StationeryTypeModal = ({
  visible,
  onClose,
  onSubmit,
  loading,
  formData,
  setFormData,
  isEditMode,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.heading}>
          {isEditMode ? 'Edit Stationary Type' : 'Create Stationary Type'}
        </Text>

        <View style={styles.tabHeader}>
          <Text style={styles.tabText}>All Stationary Types</Text>
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Stationary Type..."
          value={formData.name}
          onChangeText={name => setFormData(fd => ({ ...fd, name }))}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter Description..."
          multiline
          value={formData.description}
          onChangeText={description => setFormData(fd => ({ ...fd, description }))}
        />

        <View style={styles.row}>
          <Text style={styles.label}>Active</Text>
          <Switch
            value={formData.is_active}
            onValueChange={val => setFormData(fd => ({ ...fd, is_active: val }))}
          />
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={onSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>{loading ? 'Processing...' : 'Submit'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 4,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3e83',
    marginBottom: 10,
  },
  tabHeader: {
    backgroundColor: '#e3e0f3',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  tabText: {
    fontWeight: '500',
    color: '#2d3e83',
  },
  label: {
    marginBottom: 6,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#2d3e83',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default StationeryTypeModal;
