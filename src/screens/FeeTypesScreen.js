import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
    Modal,
    TouchableWithoutFeedback,
    Keyboard,
    Vibration,
    Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import ProfileSection from '../components/ProfileSection';
import * as feeApi from '../api/feeApi';
import { AuthContext } from '../context/AuthContext';

const FeeTypesScreen = () => {
    const nav = useNavigation();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [types, setTypes] = useState([]);
    const [filteredTypes, setFilteredTypes] = useState([]);
    const [searchText, setSearchText] = useState('');

    const [modalVisible, setModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        description: '',
        is_active: true,
    });

    const [showProfile, setShowProfile] = useState(true);
    const { user, selectedBranch, selectedAcademicYear } = useContext(AuthContext);

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const data = await feeApi.fetchFeeTypes(selectedBranch.id);
            setTypes(data);
        } catch (error) {
            console.error('Failed to fetch fee types:', error);
            Alert.alert('Error', 'Unable to load fee types.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedBranch) {
            fetchTypes();
        }
    }, [selectedBranch]);

    useEffect(() => {
        if (searchText.trim()) {
            setFilteredTypes(
                types.filter(t =>
                    t.name.toLowerCase().includes(searchText.toLowerCase())
                )
            );
        } else {
            setFilteredTypes(types);
        }
    }, [searchText, types]);

    const openCreate = () => {
        setFormData({ id: null, name: '', description: '', is_active: true });
        setIsEditMode(false);
        setModalVisible(true);
    };

    const openEdit = item => {
        setFormData({
            id: item.id,
            name: item.name,
            description: item.description,
            is_active: item.is_active,
        });
        setIsEditMode(true);
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        const { id, name, description, is_active } = formData;
        if (!name.trim()) {
            return Alert.alert('Validation', 'Name is required.');
        }
        setModalLoading(true);
        try {
            if (isEditMode) {
                // PATCH https://…/api/fee-types/12/  with { is_active, name, description }
                await feeApi.updateFeeType(id, { is_active, name, description });
            } else {
                // POST https://…/api/fee-types/  with { name, description, branch_id, academic_year_id }
                await feeApi.createFeeType({
                    name,
                    description,
                    branch_id: selectedBranch.id.toString(),
                    academic_year_id: selectedAcademicYear.id.toString(),
                });
            }
            setModalVisible(false);
            fetchTypes();
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Something went wrong saving.');
        } finally {
            setModalLoading(false);
        }
    };


    const handleDelete = id => {
        Vibration.vibrate([0, 200, 100, 200]);
        Alert.alert('Delete Fee Type', 'Are you sure you want to delete this fee type?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    setActionLoading(true);
                    try {
                        await feeApi.deleteFeeType(id);
                        fetchTypes();
                    } catch (err) {
                        console.error(err);
                        Alert.alert('Error', 'Failed to delete.');
                    } finally {
                        setActionLoading(false);
                    }
                },
            },
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.desc}>({item.description})</Text>
                <Text style={styles.status}>
                    Status:{' '}
                    <Text style={{ color: item.is_active ? 'green' : 'red' }}>
                        {item.is_active ? 'Active' : 'Inactive'}
                    </Text>
                </Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEdit(item)}>
                    <Icon name="edit" size={22} color="#2d3e83" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginLeft: 12 }}>
                    <Icon name="delete" size={22} color="red" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <ProfileSection user={user} showProfile={showProfile} setShowProfile={setShowProfile} />

            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => nav.goBack()}>
                        <Icon name="arrow-back" size={24} color="#2d3e83" />
                    </TouchableOpacity>
                    <Icon name="payments" size={24} color="#2d3e83" style={{ marginLeft: 10 }} />
                    <Text style={styles.title}>Fee Types</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
                    <Icon name="add-circle-outline" size={24} color="#2d3e83" />
                    <Text style={styles.addText}>Type</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#666" style={{ marginHorizontal: 8 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search fee types..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#2d3e83" />
                    <Text style={{ marginTop: 12, color: '#2d3e83' }}>Loading Fee Types…</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredTypes}
                    keyExtractor={i => i.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                />
            )}

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {isEditMode ? 'Edit Fee Type' : 'Add Fee Type'}
                            </Text>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                placeholder="Name"
                                style={styles.input}
                                value={formData.name}
                                onChangeText={txt => setFormData({ ...formData, name: txt })}
                            />
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                placeholder="Description"
                                style={styles.input}
                                value={formData.description}
                                onChangeText={txt => setFormData({ ...formData, description: txt })}
                            />
                            {isEditMode && (
                                <View style={styles.switchRow}>
                                    <Text style={styles.label}>Is Active</Text>
                                    <Switch
                                        value={formData.is_active}
                                        onValueChange={val => setFormData({ ...formData, is_active: val })}
                                        thumbColor={formData.is_active ? '#2d3e83' : '#ccc'}
                                        trackColor={{ false: '#ccc', true: '#a2b3f1' }}
                                    />
                                </View>
                            )}
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    style={styles.cancelBtn}
                                >
                                    <Text style={[styles.btnText, { color: '#2d3e83' }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    style={styles.saveBtn}
                                    disabled={modalLoading}
                                >
                                    <Text style={styles.btnText}>
                                        {modalLoading ? 'Saving…' : isEditMode ? 'Update' : 'Add'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#f4f6f9' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3e83',
        marginLeft: 10,
    },
    addBtn: { flexDirection: 'row', alignItems: 'center' },
    addText: { marginLeft: 4, fontSize: 14, color: '#2d3e83' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    searchInput: { flex: 1, height: 40 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
        elevation: 1,
    },
    name: { fontSize: 16, fontWeight: '600', color: '#333' },
    desc: { fontSize: 14, color: '#666' },
    status: { marginTop: 4, fontSize: 14 },
    actions: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    label: { fontSize: 14, marginTop: 8 },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 8,
        marginTop: 4,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    cancelBtn: { padding: 8 },
    saveBtn: {
        backgroundColor: '#2d3e83',
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    btnText: { color: '#fff', fontWeight: '600' },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
});

export default FeeTypesScreen;
