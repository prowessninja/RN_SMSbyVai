// === Final Full Production-Ready InventoryScreen.js ===
// [No truncation, all UI retained, bug fixes applied]

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Eyecon from 'react-native-vector-icons/FontAwesome';
import LottieView from 'lottie-react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as CommonAPI from '../api/common';
import InventoryModal from '../components/InventoryModal';
import { TextInput } from 'react-native';
import TrackingModal from '../components/TrackingModal';

const InventoryScreen = () => {
    const nav = useNavigation();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [inventoryList, setInventoryList] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [profileImage, setProfileImage] = useState(null);
    const [currentUserName, setCurrentUserName] = useState('');
    const [currentUserRole, setCurrentUserRole] = useState('');
    const [academicYears, setAcademicYears] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [showProfileCard, setShowProfileCard] = useState(true);
    const [expandedItemIds, setExpandedItemIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredList, setFilteredList] = useState([]);
    const [trackingModalVisible, setTrackingModalVisible] = useState(false);
    const [trackingFormData, setTrackingFormData] = useState(null);
    const [trackingEditMode, setTrackingEditMode] = useState(false);

    useEffect(() => {
        fetchUserAndMeta();
    }, []);

    useEffect(() => {
        if (selectedBranch) {
            fetchInventory();
        }
    }, [selectedBranch]);

    const fetchUserAndMeta = async () => {
        try {
            const [branchRes, yearRes, userRes] = await Promise.all([
                CommonAPI.fetchActiveBranches(),
                CommonAPI.fetchAcademicYears(),
                CommonAPI.fetchCurrentUserInfo(),
            ]);

            const branchData = branchRes.data?.results || [];
            const yearData = yearRes.data?.results || [];
            const user = userRes.data;

            const branchOptions = branchData.map(b => ({ label: b.name, value: b.id }));
            const yearOptions = yearData.map(y => ({ label: y.name, value: y.id }));

            setBranches(branchOptions);
            setAcademicYears(yearOptions);
            setSelectedBranch(branchOptions[0]?.value || null);
            setSelectedYear(yearOptions[0]?.value || null);
            setCurrentUserName(user.first_name || 'User');
            setCurrentUserRole(user.group?.name || 'Role');
            setProfileImage(user.profile_image);
        } catch (err) {
            console.error('Failed to load meta or user', err);
        }
    };

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredList(inventoryList);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = inventoryList.filter(item =>
                item.name?.toLowerCase().includes(query) ||
                item.status?.toLowerCase().includes(query)
            );
            setFilteredList(filtered);
        }
    }, [searchQuery, inventoryList]);

    const fetchInventory = async () => {
        if (!selectedBranch) return;
        setLoading(true);
        try {
            const res = await CommonAPI.fetchInventory(selectedBranch);
            const list = res.results || [];
            setInventoryList(list);
            setFilteredList(list);
        } catch (err) {
            console.error("Error fetching inventory", err.response?.data || err.message);
            Alert.alert("Error", "Failed to fetch inventory.");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setFormData(null);
        setIsEditMode(false);
        setModalVisible(true);
    };

    const openEdit = (item) => {
        setFormData(item);
        setIsEditMode(true);
        setModalVisible(true);
    };

    const handleAcademicYearChange = value => setSelectedYear(value);
    const handleBranchChange = value => setSelectedBranch(value);

    const toggleExpand = (id) => {
        setExpandedItemIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const openTrackingAdd = (inventoryItem) => {
        setTrackingFormData({
            inventory_type_id: inventoryItem.id,
            quantity: '',
            status: '',
            room: '',
            stationary_type: '',
            return_date: '',
            remarks: ''
        });
        setTrackingEditMode(false);
        setTrackingModalVisible(true);
    };

    const openTrackingEdit = (trackingItem) => {
        console.log('Tracking Item:', trackingItem);

        setTrackingFormData({
            ...trackingItem,
            inventory_type_id: trackingItem.inventory, // Correctly maps `inventory` to `inventory_type_id`
            room: trackingItem.room?.id || trackingItem.room,
            stationary_type: trackingItem.stationary_type?.id || trackingItem.stationary_type,
        });
        setTrackingEditMode(true);
        setTrackingModalVisible(true);
    };



    const renderTrackingRows = (tracking = []) => (
        tracking.map((track, index) => (
            <View key={index} style={styles.trackingCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={styles.metaText}>Room: {track.room?.name || '-'}</Text>
                        <Text style={styles.metaText}>Room No: {track.room?.room_no || '-'}</Text>
                        <Text style={styles.metaText}>Qty: {track.quantity}</Text>
                        <Text style={styles.metaText}>Date: {track.created_at?.split("T")[0]}</Text>
                        <Text style={styles.metaText}>Status: {track.status}</Text>
                    </View>
                    <TouchableOpacity onPress={() => openTrackingEdit(track, track.inventory)}>
                        <Icon name="edit" size={20} color="#2d3e83" />
                    </TouchableOpacity>
                </View>
            </View>
        ))
    );

    const renderItem = ({ item }) => {
        const isExpanded = expandedItemIds.includes(item.id);

        return (
            <View style={styles.cardContainer}>
                <View style={styles.cardTopRow}>
                    <View style={styles.cardHeaderLeft}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.metaText}>Status: {item.status}</Text>
                        <Text style={styles.metaText}>Quantity: {item.quantity}</Text>
                        <Text style={styles.metaText}>Price: ₹{item.price}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <TouchableOpacity onPress={() => openEdit(item)} style={styles.editIcon}>
                            <Icon name="edit" size={18} color="#2d3e83" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => toggleExpand(item.id)} style={{ marginTop: 6 }}>
                        <Icon name={isExpanded ? "expand-less" : "expand-more"} size={24} color="#2d3e83" />
                    </TouchableOpacity>
                </View>

                {isExpanded && (
                    <View style={{ marginTop: 10 }}>
                        <TouchableOpacity
                            onPress={() => openTrackingAdd(item)}
                            style={styles.addTrackingBtn}
                        >
                            <Icon name="add-circle" size={20} color="#2d3e83" />
                            <Text style={styles.addTrackingText}>Add Tracking</Text>
                        </TouchableOpacity>

                        {item.inventory_tracking?.length > 0
                            ? renderTrackingRows(item.inventory_tracking)
                            : <Text style={{ textAlign: 'center', color: '#666', marginVertical: 6 }}>No tracking data</Text>}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => setShowProfileCard(prev => !prev)}
                style={styles.iconToggle}
            >
                <Eyecon
                    name={showProfileCard ? 'eye-slash' : 'eye'}
                    size={15}
                    color="#fff"
                />
            </TouchableOpacity>

            {showProfileCard && (
                <View style={styles.profileCard}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.profileAvatar} />
                    ) : (
                        <LottieView
                            source={require('../../assets/default.json')}
                            autoPlay
                            loop
                            style={styles.profileAnimation}
                        />
                    )}
                    <Text style={styles.profileName}>{currentUserName}</Text>
                    <Text style={styles.profileRole}>{currentUserRole}</Text>
                    <View style={styles.dropdownRow}>
                        <Dropdown
                            style={styles.dropdown}
                            data={academicYears}
                            labelField="label"
                            valueField="value"
                            value={selectedYear}
                            placeholder="Select Academic Year"
                            onChange={item => handleAcademicYearChange(item.value)}
                        />
                        <Dropdown
                            style={styles.dropdown}
                            data={branches}
                            labelField="label"
                            valueField="value"
                            value={selectedBranch}
                            placeholder="Select Branch"
                            onChange={item => handleBranchChange(item.value)}
                        />
                    </View>
                </View>
            )}

            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => nav.navigate('Dashboard')}>
                        <Icon name="arrow-back" size={24} color="#2d3e83" />
                    </TouchableOpacity>
                    <Icon name="inventory" size={24} color="#2d3e83" style={{ marginLeft: 10 }} />
                    <Text style={styles.title}>Inventory</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
                    <Icon name="add-circle-outline" size={24} color="#2d3e83" />
                    <Text style={styles.addText}>Add</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#2d3e83" />
                    <Text style={{ marginTop: 12, fontSize: 16, color: '#2d3e83' }}>
                        Loading Inventory... Please hold tight!
                    </Text>
                </View>
            ) : (
                <>
                    <View style={{ marginVertical: 10 }}>
                        <View style={styles.searchBar}>
                            <Icon name="search" size={20} color="#999" style={{ marginHorizontal: 8 }} />
                            <TextInput
                                style={{ flex: 1 }}
                                placeholder="Search inventory..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Icon name="close" size={20} color="#999" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <FlatList
                        data={filteredList}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={{ padding: 16 }}
                    />
                </>
            )}

            <TrackingModal
                visible={trackingModalVisible}
                onClose={() => setTrackingModalVisible(false)}
                branchId={selectedBranch}
                formData={trackingFormData}
                setFormData={setTrackingFormData}
                isEditMode={trackingEditMode}
                refreshInventory={fetchInventory}
            />

            <InventoryModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                isEditMode={isEditMode}
                formData={formData}
                setFormData={setFormData}
                branchId={selectedBranch}
                academicYearId={selectedYear}
                refreshList={fetchInventory}
            />

            {actionLoading && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}
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
    title: { fontSize: 18, fontWeight: 'bold', color: '#2d3e83', marginLeft: 10 },
    addBtn: { flexDirection: 'row', alignItems: 'center' },
    addText: { marginLeft: 4, fontSize: 14, color: '#2d3e83' },
    inventoryBlock: {
        backgroundColor: '#fff',
        padding: 14,
        marginBottom: 16,
        borderRadius: 10,
        elevation: 2,
    },
    cardHeader: { paddingBottom: 10, borderBottomColor: '#ddd', borderBottomWidth: 1 },
    actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
    image: { width: 60, height: 60, borderRadius: 8 },
    name: { fontSize: 16, fontWeight: '600', color: '#333' },
    trackingTable: { marginTop: 10 },
    trackingRowHeader: {
        flexDirection: 'row',
        backgroundColor: '#e8ebf7',
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
    },
    trackingRow: {
        flexDirection: 'row',
        backgroundColor: '#f4f6f9',
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    trackingCellHeader: { flex: 1, fontWeight: '600', color: '#2d3e83', fontSize: 13 },
    trackingCell: { flex: 1, fontSize: 13, color: '#333' },
    overlay: {
        position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center',
        alignItems: 'center', zIndex: 10,
    },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    iconToggle: {
        alignSelf: 'flex-end', backgroundColor: '#2d3e83',
        padding: 8, borderRadius: 20, marginRight: 10, marginTop: 10,
    },
    profileCard: {
        alignItems: 'center', marginBottom: 15, backgroundColor: '#2d3e83',
        padding: 20, borderRadius: 16, elevation: 3,
    },
    profileAvatar: { height: 80, width: 80, borderRadius: 40, marginBottom: 10 },
    profileAnimation: { height: 80, width: 80, marginBottom: 10 },
    profileName: { fontSize: 22, fontWeight: '700', color: '#fff' },
    profileRole: { fontSize: 14, color: '#fff', marginBottom: 10 },
    dropdownRow: {
        flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10,
    },
    dropdown: {
        width: '48%', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, height: 40,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#2d3e83',
    },
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 14,
        marginBottom: 16,
        elevation: 3,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardHeaderLeft: {
        flex: 1,
        paddingRight: 10,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d3e83',
        marginBottom: 4,
    },
    metaText: {
        fontSize: 13,
        color: '#444',
        marginBottom: 2,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 6,
        backgroundColor: '#eee',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    trackingCard: {
        backgroundColor: '#eef1fa',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },

    editIcon: {
        padding: 4,
    },

    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        height: 40,
        paddingHorizontal: 10,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    addTrackingBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    addTrackingText: {
        marginLeft: 6,
        fontSize: 13,
        color: '#2d3e83',
        fontWeight: '600',
    },



});

export default InventoryScreen;
