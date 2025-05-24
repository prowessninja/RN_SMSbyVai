import React, { useEffect, useState } from 'react';
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
    Image,
    Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Eyecon from 'react-native-vector-icons/FontAwesome';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import * as CommonAPI from '../api/common';

const InventoryTypesScreen = () => {
    const nav = useNavigation();

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [types, setTypes] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', description: '' });

    const [showProfileCard, setShowProfileCard] = useState(true);
    const [profileImage, setProfileImage] = useState(null);
    const [currentUserName, setCurrentUserName] = useState('');
    const [currentUserRole, setCurrentUserRole] = useState('');
    const [academicYears, setAcademicYears] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [filteredTypes, setFilteredTypes] = useState([]);


    const fetchTypes = async () => {
        setLoading(true);
        try {
            const response = await CommonAPI.fetchInventoryTypes(selectedBranch);
            const data = response.data?.results || [];
            setTypes(data);
            console.log('Data in fetchTypes', data);
        } catch (error) {
            console.error('Failed to fetch inventory types:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserAndMeta = async () => {
        try {
            const [branchRes, yearRes, userRes] = await Promise.all([
                CommonAPI.fetchActiveBranches(),
                CommonAPI.fetchAcademicYears(),
                CommonAPI.fetchCurrentUserInfo(),
            ]);

            const mappedBranches = branchRes.data.results.map(b => ({ label: b.name, value: b.id }));
            const mappedYears = yearRes.data.results.map(y => ({ label: y.name, value: y.id }));

            setBranches(mappedBranches);
            setAcademicYears(mappedYears);
            if (mappedBranches.length) setSelectedBranch(mappedBranches[0].value);
            if (mappedYears.length) setSelectedYear(mappedYears[0].value);

            const user = userRes.data;
            setCurrentUserName(user.first_name || 'User');
            setCurrentUserRole(user.group?.name || 'Role');
            setProfileImage(user.profile_image);
        } catch (err) {
            console.error('Error loading meta:', err);
        }
    };

    useEffect(() => {
        fetchUserAndMeta();
    }, []);

    useEffect(() => {
        if (selectedBranch !== null) {
            fetchTypes();
        }
    }, [selectedBranch]);

    useEffect(() => {
        if (searchText.trim()) {
            const filtered = types.filter(item =>
                item.name.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredTypes(filtered);
        } else {
            setFilteredTypes(types);
        }
    }, [searchText, types]);

    const openCreate = () => {
        setFormData({ id: null, name: '', description: '' });
        setIsEditMode(false);
        setModalVisible(true);
    };

    const openEdit = (item) => {
        setFormData({ id: item.id, name: item.name, description: item.description });
        setIsEditMode(true);
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        setModalLoading(true);
        try {
            if (isEditMode) {
                await CommonAPI.updateInventoryType(formData.id, {
                    name: formData.name,
                    description: formData.description,
                });
            } else {
                await CommonAPI.createInventoryType({
                    name: formData.name,
                    description: formData.description,
                    branch_id: selectedBranch,
                    academic_year_id: selectedYear,
                    is_active: true,
                });
            }
            setModalVisible(false);
            fetchTypes();
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Something went wrong.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = (id) => {
        Vibration.vibrate([0, 200, 100, 200]);
        Alert.alert('Delete', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    setActionLoading(true);
                    try {
                        await CommonAPI.deleteInventoryType(id);
                        fetchTypes();
                    } catch (err) {
                        Alert.alert('Error', 'Could not delete.');
                    } finally {
                        setActionLoading(false);
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.desc}>({item.description})</Text>
                <Text style={styles.status}>
                    Status: <Text style={{ color: item.is_active ? 'green' : 'red' }}>{item.is_active ? 'Active' : 'Inactive'}</Text>
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
            <TouchableOpacity onPress={() => setShowProfileCard(prev => !prev)} style={styles.iconToggle}>
                <Eyecon name={showProfileCard ? 'eye-slash' : 'eye'} size={15} color="#fff" />
            </TouchableOpacity>

            {showProfileCard && (
                <View style={styles.profileCard}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.profileAvatar} />
                    ) : (
                        <LottieView source={require('../../assets/default.json')} autoPlay loop style={styles.profileAnimation} />
                    )}
                    <Text style={styles.profileName}>{currentUserName}</Text>
                    <Text style={styles.profileRole}>{currentUserRole}</Text>
                    <View style={styles.dropdownRow}>
                        <Dropdown data={academicYears} labelField="label" valueField="value" value={selectedYear} placeholder="Academic Year" style={styles.dropdown} onChange={item => setSelectedYear(item.value)} />
                        <Dropdown data={branches} labelField="label" valueField="value" value={selectedBranch} placeholder="Branch" style={styles.dropdown} onChange={item => setSelectedBranch(item.value)} />
                    </View>
                </View>
            )}

            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => nav.goBack()}>
                        <Icon name="arrow-back" size={24} color="#2d3e83" />
                    </TouchableOpacity>
                    <Icon name="inventory" size={24} color="#2d3e83" style={{ marginLeft: 10 }} />
                    <Text style={styles.title}>Inventory Types</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
                    <Icon name="add-circle-outline" size={24} color="#2d3e83" />
                    <Text style={styles.addText}>Type</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#666" style={{ marginHorizontal: 8 }} />
                <TextInput style={styles.searchInput} placeholder="Search inventory types..." value={searchText} onChangeText={setSearchText} />
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#2d3e83" />
                    <Text style={{ marginTop: 12, color: '#2d3e83' }}>Loading Inventory Types…</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredTypes}
                    keyExtractor={i => i.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                />

            )}

            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>{isEditMode ? 'Edit Inventory Type' : 'Add Inventory Type'}</Text>

                            <Text style={styles.label}>Name</Text>
                            <TextInput placeholder="Name" style={styles.input} value={formData.name} onChangeText={txt => setFormData({ ...formData, name: txt })} />

                            <Text style={styles.label}>Description</Text>
                            <TextInput placeholder="Description" style={styles.input} value={formData.description} onChangeText={txt => setFormData({ ...formData, description: txt })} />

                            <View style={styles.modalActions}>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                                    <Text style={[styles.btnText, { color: '#2d3e83' }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSubmit} style={styles.saveBtn} disabled={modalLoading}>
                                    <Text style={styles.btnText}>{modalLoading ? 'Saving…' : isEditMode ? 'Update' : 'Add'}</Text>
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
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3e83',
        marginLeft: 10,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#2d3e83',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    desc: {
        fontSize: 14,
        color: '#666',
    },
    status: {
        marginTop: 4,
        fontSize: 14,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconToggle: {
        alignSelf: 'flex-end',
        backgroundColor: '#2d3e83',
        padding: 8,
        borderRadius: 20,
        marginRight: 10,
        marginTop: 10,
    },
    profileCard: {
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: '#2d3e83',
        padding: 20,
        borderRadius: 16,
        elevation: 3,
    },
    profileAvatar: {
        height: 80,
        width: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    profileAnimation: {
        height: 80,
        width: 80,
        marginBottom: 10,
    },
    profileName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
    },
    profileRole: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 10,
    },
    dropdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    dropdown: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        elevation: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginTop: 12,
        backgroundColor: '#fff',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3e83',
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    cancelBtn: {
        padding: 10,
        marginRight: 10,
    },
    saveBtn: {
        backgroundColor: '#2d3e83',
        padding: 10,
        borderRadius: 6,
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    label: {
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 4,
        color: '#333',
    },
    cancelBtn: {
        padding: 10,
        marginRight: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#2d3e83',
        borderRadius: 6,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 5,
        paddingVertical: 1,
        margin: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingLeft: 8,
    },


});

export default InventoryTypesScreen;
