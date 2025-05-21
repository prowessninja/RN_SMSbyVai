// UnifiedStationeryModal.js — merged Add + Edit
import React from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import CheckBox from '@react-native-community/checkbox';
import { ActivityIndicator } from 'react-native';


const UnifiedStationeryModal = ({
    visible,
    onClose,
    onSubmit,
    formData,
    setFormData,
    stationaryTypes,
    inventoryTracking,
    isEdit = false,
    loading,
}) => {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{isEdit ? 'Edit Stationery' : 'Add Stationery'}</Text>

                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter name"
                        value={formData.name}
                        onChangeText={name => setFormData(d => ({ ...d, name }))}
                    />

                    <Text style={styles.label}>Stationery Type</Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={stationaryTypes}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Type"
                        value={formData.selectedType}
                        onChange={item => setFormData(d => ({ ...d, selectedType: item.value }))}
                    />

                    <Text style={styles.label}>Inventory</Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={inventoryTracking}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Inventory"
                        value={formData.selectedInventory}
                        onChange={item => setFormData(d => ({ ...d, selectedInventory: item.value }))}
                    />

                    <Text style={styles.label}>Price</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter price"
                        keyboardType="numeric"
                        value={formData.price}
                        onChangeText={price => setFormData(d => ({ ...d, price }))}
                    />

                    <Text style={styles.label}>Quantity</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter quantity"
                        keyboardType="numeric"
                        value={formData.quantity}
                        onChangeText={quantity => setFormData(d => ({ ...d, quantity }))}
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter description"
                        value={formData.description}
                        onChangeText={description => setFormData(d => ({ ...d, description }))}
                    />

                    <View style={styles.checkboxRow}>
                        <CheckBox
                            value={formData.isActive}
                            onValueChange={val => setFormData(d => ({ ...d, isActive: val }))}
                        />
                        <Text style={styles.label}>Active</Text>
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.btnText}>Cancel</Text>
                        </TouchableOpacity>
                        {loading && (
                            <View style={{ marginTop: 15, alignItems: 'center' }}>
                                <ActivityIndicator size="small" color="#2d3e83" />
                                <Text style={{ marginTop: 6 }}>Submitting...</Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
                            <Text style={styles.btnText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#f0f0ff',
        padding: 20,
        borderRadius: 12,
        width: '90%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    label: {
        fontWeight: '600',
        marginTop: 10,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 40,
        marginTop: 5,
    },
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 40,
        marginTop: 5,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelBtn: {
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 8,
    },
    submitBtn: {
        backgroundColor: '#2d3e83',
        padding: 10,
        borderRadius: 8,
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default UnifiedStationeryModal;
