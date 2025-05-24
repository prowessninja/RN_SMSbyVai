import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as CommonAPI from '../api/common';

const TrackingModal = ({
  visible,
  onClose,
  branchId,
  formData,
  setFormData,
  isEditMode,
  refreshInventory, // ✅ updated from refreshData
}) => {
  const [rooms, setRooms] = useState([]);
  const [inventoryTypes, setInventoryTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMsg, setOverlayMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const statusOptions = [
    { label: 'Issued', value: 'Issued' },
    { label: 'Not-Available', value: 'Not-Available' },
    { label: 'Damaged', value: 'Damaged' },
    { label: 'Lost', value: 'Lost' },
  ];

  useEffect(() => {
    if (visible) {
      loadDropdownData();
      setOverlayVisible(false);
      setOverlayMsg('');
      setSubmitting(false);
    }
  }, [visible]);

  const loadDropdownData = async () => {
    setLoading(true);
    try {
      const roomRes = await CommonAPI.fetchRooms(branchId);
      const roomsList = roomRes?.data?.results ?? roomRes?.results ?? (Array.isArray(roomRes) ? roomRes : []);
      const mappedRooms = roomsList.map(r => ({
        label: r.name,
        value: r.id,
        itemLabel: `${r.name} (${r.room_no})`,
      }));

      const inventoryRes = await CommonAPI.fetchInventory(branchId);
      const inventoryList = inventoryRes?.data?.results ?? inventoryRes?.results ?? (Array.isArray(inventoryRes) ? inventoryRes : []);
      const mappedInventory = inventoryList.map(i => ({
        label: i.name,
        value: Number(i.id),
        is_stationary: i.is_stationary,
      }));

      setRooms(mappedRooms);
      setInventoryTypes(mappedInventory);

      if (isEditMode && formData) {
        const inventoryId = formData.inventory_type_id ?? formData.inventory;
        const matchedInventory = mappedInventory.find(i => i.value === Number(inventoryId));
        if (matchedInventory) {
          setFormData(prev => ({
            ...prev,
            inventory_type_id: matchedInventory.value,
            is_stationary: matchedInventory.is_stationary,
          }));
        } else {
          triggerOverlay('Selected item no longer exists');
        }
      } else {
        setFormData(prev => ({
          ...prev,
          is_stationary: false,
        }));
      }
    } catch (err) {
      console.error('Dropdown load error:', err);
      triggerOverlay('Failed to load dropdown data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, return_date: selectedDate.toISOString().split('T')[0] }));
    }
  };

  const triggerOverlay = (msg) => {
    setOverlayMsg(msg);
    setOverlayVisible(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setOverlayVisible(true);
    setOverlayMsg(isEditMode ? 'Updating…' : 'Adding…');

    const payload = {
      room_id: formData.room,
      quantity: formData.quantity,
      inventory_id: formData.inventory_type_id,
      return_date: formData.return_date,
      status: formData.status,
      remarks: formData.remarks || '',
      stationery: formData.is_stationary ? 'Yes' : 'No',
      branch_id: branchId,
    };
    if (isEditMode) payload.id = formData.id;

    try {
      await CommonAPI.submitTrackingData(payload, isEditMode);

      setOverlayMsg(`Tracking ${isEditMode ? 'updated' : 'added'} successfully.`);

      // ✅ Call parent reload function
      if (refreshInventory) {
        await refreshInventory();
      }

      // Delay to show success message then close modal
      setTimeout(() => {
        setSubmitting(false);
        setOverlayVisible(false);
        onClose();
      }, 1200);
    } catch (error) {
      console.error('Submit error:', error);
      setOverlayMsg(`Failed to ${isEditMode ? 'update' : 'add'} tracking.`);
      setSubmitting(false);
      setTimeout(() => setOverlayVisible(false), 1500);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={styles.container}>
        <Text style={styles.heading}>{isEditMode ? 'Edit Tracking' : 'Add Tracking'}</Text>

        {loading ? (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#2d3e83" />
          </View>
        ) : (
          <>
            <Text style={styles.label}>Name</Text>
            <Dropdown
              data={inventoryTypes}
              style={styles.input}
              labelField="label"
              valueField="value"
              value={formData?.inventory_type_id}
              placeholder="Select Inventory"
              onChange={item => handleChange('inventory_type_id', item.value)}
            />

            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(formData.quantity || '')}
              onChangeText={txt => handleChange('quantity', Number(txt))}
            />

            <Text style={styles.label}>Status</Text>
            <Dropdown
              data={statusOptions}
              style={styles.input}
              labelField="label"
              valueField="value"
              value={formData.status}
              placeholder="Select Status"
              onChange={item => handleChange('status', item.value)}
            />

            <Text style={styles.label}>Is Stationery</Text>
            <View style={styles.switchContainer}>
              <Text>{formData.is_stationary ? 'True' : 'False'}</Text>
              <Switch
                value={formData.is_stationary}
                onValueChange={value => handleChange('is_stationary', value)}
              />
            </View>

            <Text style={styles.label}>Room</Text>
            <Dropdown
              data={rooms}
              style={styles.input}
              labelField="label"
              valueField="value"
              value={formData.room}
              placeholder="Select Room"
              renderItem={item => <Text style={styles.itemText}>{item.itemLabel}</Text>}
              onChange={item => handleChange('room', item.value)}
            />

            <Text style={styles.label}>Return Date</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text style={{ color: formData.return_date ? '#000' : '#999' }}>
                {formData.return_date || 'Select Date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.return_date ? new Date(formData.return_date) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <Text style={styles.label}>Remarks</Text>
            <TextInput
              style={styles.input}
              value={formData.remarks || ''}
              onChangeText={txt => handleChange('remarks', txt)}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.saveText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={submitting}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {overlayVisible && (
          <View style={styles.fullOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            {overlayMsg ? <Text style={styles.overlayTextFull}>{overlayMsg}</Text> : null}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#f9f9f9' },
  spinnerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 20, fontWeight: 'bold', color: '#2d3e83', marginBottom: 20 },
  label: { fontSize: 14, marginTop: 10, marginBottom: 4, color: '#333' },
  input: {
    height: 40,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    justifyContent: 'center',
    marginBottom: 5,
  },
  itemText: { padding: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  saveBtn: {
    backgroundColor: '#2d3e83',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    borderColor: '#2d3e83',
    borderWidth: 1,
    padding: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: 'bold' },
  cancelText: { color: '#2d3e83', fontWeight: 'bold' },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 5,
  },
  fullOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  overlayTextFull: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default TrackingModal;
