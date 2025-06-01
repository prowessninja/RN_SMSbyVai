import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
    ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { fetchFeeTypes, createFeeStructure, updateFeeStructure } from '../api/feeApi';
import { fetchStandardsForYearBranch } from '../api/common';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FeeStructureModal = ({
    visible,
    onClose,
    onSubmit,
    selectedFee,
    academicYears,
    selectedAcademicYear,
    selectedBranch,
}) => {
    const isEdit = !!selectedFee;

    const [standards, setStandards] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [form, setForm] = useState({
        standard: null,
        academic_year: selectedAcademicYear?.id,
        fee_type: null,
        amount: '',
        min_amount: '',
        due_date: new Date(),
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        if (!selectedBranch?.id || !selectedAcademicYear?.id) return;
        loadInitialData();
    }, [selectedBranch, selectedAcademicYear]);

    useEffect(() => {
        if (selectedFee) {
            setForm({
                standard: selectedFee.standard.id,
                academic_year: selectedFee.academic_year.id,
                fee_type: selectedFee.fee_type.id,
                amount: selectedFee.amount.toString(),
                min_amount: selectedFee.min_amount.toString(),
                due_date: new Date(selectedFee.due_date),
            });
        } else {
            setForm({
                standard: null,
                academic_year: selectedAcademicYear?.id,
                fee_type: null,
                amount: '',
                min_amount: '',
                due_date: new Date(),
            });
        }
    }, [selectedFee, selectedAcademicYear]);

    const loadInitialData = async () => {
        const token = await AsyncStorage.getItem('userToken');
        const stdData = await fetchStandardsForYearBranch(selectedAcademicYear.id, selectedBranch.id, token);
        const typeData = await fetchFeeTypes(selectedBranch.id);
        setStandards(stdData?.results || []);
        setFeeTypes(typeData);
    };

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const handleDateChange = (_, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            handleChange('due_date', selectedDate);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setStatusMessage(isEdit ? 'Updating...' : 'Adding...');
        try {
            const payload = {
                standard_id: parseInt(form.standard),
                academic_year_id: parseInt(form.academic_year),
                fee_type_id: parseInt(form.fee_type),
                amount: parseFloat(form.amount),
                min_amount: parseFloat(form.min_amount),
                due_date: form.due_date.toISOString().split('T')[0],
            };

            let response;
            if (isEdit) {
                response = await updateFeeStructure(selectedFee.id, {
                    id: selectedFee.id,
                    ...payload,
                });
            } else {
                response = await createFeeStructure({
                    ...payload,
                    branch: selectedBranch.id,
                });
            }

            setStatusMessage(isEdit ? 'Update Successful!' : 'Add Successful!');
            setTimeout(() => {
                setLoading(false);
                onSubmit(response);
                onClose();
            }, 1200);
        } catch (error) {
            setLoading(false);
            setStatusMessage('');
            alert('Failed to save fee. Please try again.');
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>{isEdit ? 'Edit Fee' : 'Add Fee'}</Text>

                    <Dropdown
                        style={styles.dropdown}
                        data={standards.map(s => ({ label: s.name, value: s.id }))}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Standard"
                        value={form.standard}
                        onChange={(item) => handleChange('standard', item.value)}
                    />

                    <Dropdown
                        style={styles.dropdown}
                        data={academicYears.map(y => ({ label: y.name, value: y.id }))}
                        labelField="label"
                        valueField="value"
                        placeholder="Academic Year"
                        value={form.academic_year}
                        onChange={(item) => handleChange('academic_year', item.value)}
                    />

                    <Dropdown
                        style={styles.dropdown}
                        data={feeTypes.map(t => ({ label: t.name, value: t.id }))}
                        labelField="label"
                        valueField="value"
                        placeholder="Fee Type"
                        value={form.fee_type}
                        onChange={(item) => handleChange('fee_type', item.value)}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Amount"
                        keyboardType="numeric"
                        value={form.amount}
                        onChangeText={(text) => handleChange('amount', text)}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Term Amount"
                        keyboardType="numeric"
                        value={form.min_amount}
                        onChangeText={(text) => handleChange('min_amount', text)}
                    />

                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                        <Text style={styles.dateText}>
                            Due Date: {form.due_date.toISOString().split('T')[0]}
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={form.due_date}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                        />
                    )}

                    <View style={styles.actions}>
                        <TouchableOpacity onPress={onClose} style={styles.cancelButton} disabled={loading}>
                            <Text style={{ color: '#fff' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
                            <Text style={{ color: '#fff' }}>{isEdit ? 'Update' : 'Add'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>{statusMessage}</Text>
                    </View>
                )}
            </View>
        </Modal>
    );
};

export default FeeStructureModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        width: '90%',
        borderRadius: 10,
        padding: 20,
        elevation: 5,
        zIndex: 1,
    },
    title: {
        fontSize: 18,
        color: '#2d3e83',
        fontWeight: 'bold',
        marginBottom: 15,
    },
    dropdown: {
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 10,
        height: 40,
    },
    input: {
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
        marginBottom: 10,
    },
    dateButton: {
        backgroundColor: '#e1e7ff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    dateText: {
        color: '#2d3e83',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelButton: {
        backgroundColor: '#aaa',
        padding: 10,
        borderRadius: 8,
        width: '45%',
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#2d3e83',
        padding: 10,
        borderRadius: 8,
        width: '45%',
        alignItems: 'center',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(45, 62, 131, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        borderRadius: 10,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
});
