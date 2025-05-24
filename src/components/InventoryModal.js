import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as CommonAPI from '../api/common';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'react-native-image-picker';

const InventoryModal = ({
    visible,
    onClose,
    isEditMode,
    formData,
    setFormData,
    branchId,
    academicYearId,
    refreshList,
}) => {
    const [inventoryTypes, setInventoryTypes] = useState([]);
    const [showOverlay, setShowOverlay] = useState(false);
    const [statusOptions] = useState([
        { label: 'Available', value: 'Available' },
        { label: 'Not-Available', value: 'Not-Available' },
    ]);
    const [stationaryOptions] = useState([
        { label: 'True', value: true },
        { label: 'False', value: false },
    ]);

    useEffect(() => {
        if (visible) {
            loadInventoryTypes();
        }
    }, [visible]);

    const loadInventoryTypes = async () => {
        try {
            const res = await CommonAPI.fetchInventoryTypes(branchId);
            const options = res.data?.results.map(i => ({ label: i.name, value: i.id })) || [];
            setInventoryTypes(options);
        } catch (err) {
            console.error('Failed to load inventory types', err);
        }
    };

    const handleImagePick = async (field) => {
        ImagePicker.launchImageLibrary({ mediaType: 'photo', includeBase64: true }, (response) => {
            if (response.didCancel || response.errorMessage) return;
            const base64 = response.assets?.[0]?.base64;
            const type = response.assets?.[0]?.type;
            if (base64 && type) {
                const base64Image = `data:${type};base64,${base64}`;
                setFormData(prev => ({ ...prev, [field]: base64Image }));
            }
        });
    };

    const isBase64Image = (img) => {
        return typeof img === 'string' && img.startsWith('data:image');
    };

    const handleSave = async () => {
        try {
            const payload = {
                id: formData.id,
                name: formData.name,
                quantity: formData.quantity,
                inventory_type_id:
                    typeof formData.inventory_type === 'object'
                        ? formData.inventory_type.id
                        : formData.inventory_type,
                price: formData.price,
                description: formData.description,
                is_stationary: formData.is_stationary,
                status: formData.status,
                remarks: formData.remarks,
                branch_id: branchId,
            };

            if (isBase64Image(formData.bill_image)) {
                payload.bill_image = formData.bill_image;
            }

            if (isBase64Image(formData.product_image)) {
                payload.product_image = formData.product_image;
            }

            if (isEditMode) {
                await CommonAPI.updateInventory(formData.id, payload);
            } else {
                await CommonAPI.createInventory({
                    ...payload,
                    academic_year: academicYearId,
                });
            }

            // Show overlay message
            setShowOverlay(true);
            setTimeout(() => {
                setShowOverlay(false);
                refreshList();
                onClose();
            }, 1500); // show for 1.5 seconds
        } catch (err) {
            console.error('Failed to save inventory', err.response?.data || err.message);
            Alert.alert('Error', 'Failed to save inventory.');
        }
    };

    return (
        <>
            <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.heading}>{isEditMode ? 'Edit' : 'Add'} Inventory</Text>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={formData?.name || ''}
                                onChangeText={text => setFormData({ ...formData, name: text })}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Quantity</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={String(formData?.quantity || '')}
                                onChangeText={text => setFormData({ ...formData, quantity: Number(text) })}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Inventory Type</Text>
                            <Dropdown
                                style={styles.input}
                                data={inventoryTypes}
                                labelField="label"
                                valueField="value"
                                value={formData?.inventory_type}
                                placeholder="Select type"
                                onChange={item => setFormData({ ...formData, inventory_type: item.value })}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Price</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={String(formData?.price || '')}
                                onChangeText={text => setFormData({ ...formData, price: Number(text) })}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={styles.input}
                                value={formData?.description || ''}
                                onChangeText={text => setFormData({ ...formData, description: text })}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Is Stationary</Text>
                            <Dropdown
                                style={styles.input}
                                data={stationaryOptions}
                                labelField="label"
                                valueField="value"
                                value={formData?.is_stationary}
                                placeholder="true / false"
                                onChange={item => setFormData({ ...formData, is_stationary: item.value })}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Status</Text>
                            <Dropdown
                                style={styles.input}
                                data={statusOptions}
                                labelField="label"
                                valueField="value"
                                value={formData?.status}
                                placeholder="Select Status"
                                onChange={item => setFormData({ ...formData, status: item.value })}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Remarks</Text>
                            <TextInput
                                style={styles.input}
                                value={formData?.remarks || ''}
                                onChangeText={text => setFormData({ ...formData, remarks: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.imageBlock}>
                            <Text style={styles.label}>
                                {isEditMode ? 'Bill Image' : 'Upload Bill Image'}
                            </Text>
                            {formData?.bill_image ? (
                                <Image source={{ uri: formData.bill_image }} style={styles.image} />
                            ) : null}
                            <TouchableOpacity
                                style={styles.imageButton}
                                onPress={() => handleImagePick('bill_image')}
                            >
                                <Text>{isEditMode ? 'Change Bill Image' : 'Upload Bill Image'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.imageBlock}>
                            <Text style={styles.label}>
                                {isEditMode ? 'Product Image' : 'Upload Product Image'}
                            </Text>
                            {formData?.product_image ? (
                                <Image source={{ uri: formData.product_image }} style={styles.image} />
                            ) : null}
                            <TouchableOpacity
                                style={styles.imageButton}
                                onPress={() => handleImagePick('product_image')}
                            >
                                <Text>{isEditMode ? 'Change Product Image' : 'Upload Product Image'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Modal>

            {showOverlay && (
                <View style={styles.overlay}>
                    <View style={styles.overlayBox}>
                        <Text style={styles.overlayText}>
                            Inventory {isEditMode ? 'updated' : 'added'} successfully
                        </Text>
                    </View>
                </View>
            )}
        </>
    );

};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    heading: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d3e83',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    halfInput: {
        width: '48%',
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 6,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    imageBlock: {
        width: '48%',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 120,
        resizeMode: 'contain',
        marginVertical: 8,
    },
    imageButton: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    footer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    saveBtn: {
        backgroundColor: '#2d3e83',
        padding: 12,
        borderRadius: 6,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    saveText: {
        color: '#fff',
        fontWeight: '600',
    },
    cancelBtn: {
        borderColor: '#2d3e83',
        borderWidth: 1,
        padding: 12,
        borderRadius: 6,
        flex: 1,
        alignItems: 'center',
    },
    cancelText: {
        color: '#2d3e83',
        fontWeight: '600',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    overlayBox: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    overlayText: {
        fontSize: 16,
        color: '#2d3e83',
        fontWeight: '600',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    overlayBox: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    overlayText: {
        fontSize: 16,
        color: '#2d3e83',
        fontWeight: '600',
    },

});

export default InventoryModal;
