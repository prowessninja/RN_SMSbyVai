import React, { useEffect, useState } from 'react';
import { ScrollView, Image, Modal, TextInput } from 'react-native';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet
} from 'react-native';
import PermissionsAPI from '../api/permissions';
import CommonAPI from '../api/common';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Dropdown } from 'react-native-element-dropdown';
import { useIsFocused } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import Eyecon from 'react-native-vector-icons/FontAwesome5';


const RANDOM_BG_COLORS = ['#f9c2ff', '#d0f0c0', '#cce5ff', '#ffecb3', '#d1c4e9', '#ffe0b2'];
const ALTERNATE_ROW_COLORS = ['#ffffff', '#f5f5f5'];

const UserPermissionsScreen = ({ navigation }) => {
    const [roles, setRoles] = useState([]);
    const isFocused = useIsFocused();
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [permissionsMap, setPermissionsMap] = useState({});
    const [editablePermissionsMap, setEditablePermissionsMap] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [academicYears, setAcademicYears] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState('');
    const [currentUserName, setCurrentUserName] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayText, setOverlayText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [availablePermissions, setAvailablePermissions] = useState([]); // ✅ Add this!
    const [showProfileCard, setShowProfileCard] = useState(true);

    useEffect(() => {
        fetchGroups(); // 🚨 this only runs once when mounted
    }, []);

    const fetchMetaData = async () => {
        try {
            const [branchRes, yearRes, userRes] = await Promise.all([
                CommonAPI.fetchActiveBranches(),
                CommonAPI.fetchAcademicYears(),
                CommonAPI.fetchCurrentUserInfo()
            ]);

            const branchesData = branchRes.data?.results || [];
            const academicYearsData = yearRes.data?.results || [];

            setBranches(branchesData.map(branch => ({ label: branch.name, value: branch.id })));
            setAcademicYears(academicYearsData.map(year => ({ label: year.name, value: year.id })));

            const userData = userRes.data;
            setCurrentUserRole(userData.group?.name || 'Role');
            setCurrentUserName(userData.first_name || 'User');
            setProfileImage(userData.profile_image);

            if (branchesData.length > 0) setSelectedBranch(branchesData[0].id);
            if (academicYearsData.length > 0) setSelectedYear(academicYearsData[0].id);

        } catch (error) {
            console.error('Error fetching metadata:', error);
            Alert.alert('Error', 'Failed to load metadata.');
        }
    };

    const fetchGroups = async (branchId) => {
        try {
            const response = await PermissionsAPI.fetchGroupsByBranch(branchId);
            setRoles(response.data.results || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
            Alert.alert('Error', 'Failed to fetch roles.');
        }
    };

    const handleViewPermissions = async (role) => {
        setLoading(true);
        setIsEditing(false);
        try {
            const [groupResponse, allPermissions] = await Promise.all([
                PermissionsAPI.fetchGroupById(role.id),
                PermissionsAPI.fetchAllPermissionsPaginated()
            ]);

            console.log('✅ Group data:', groupResponse.data);
            console.log('✅ Total permissions fetched:', allPermissions.length);


            console.log('✅ Logging ALL permissions type_name + operation_name:');
            allPermissions.forEach((perm) => {
                console.log(
                    `Type: ${perm.type_name}, Operation: ${perm.operation_name}, ID: ${perm.id}`
                );
            });
            const permissions = groupResponse.data.permissions || [];

            setAvailablePermissions(allPermissions);  // full array now

            const map = mapPermissionsByModule(allPermissions, permissions);
            setPermissionsMap(map);
            setEditablePermissionsMap(map);

            setSelectedRole({
                ...role,
                staff_type: groupResponse.data.group_type?.type || 'Teaching',
            });
        } catch (error) {
            console.error('Error fetching group permissions:', error);
            Alert.alert('Error', 'Failed to fetch permissions for this role.');
        } finally {
            setLoading(false);
        }
    };




    const mapPermissionsByModule = (allPermissions, rolePermissions) => {
        const map = {};

        // Superset first
        allPermissions.forEach((p) => {
            const type = p.type_name;
            const op = p.operation_name;

            if (!map[type]) {
                map[type] = {
                    view: { checked: false, id: null },
                    add: { checked: false, id: null },
                    change: { checked: false, id: null },
                    delete: { checked: false, id: null }
                };
            }

            map[type][op] = { checked: false, id: p.id };
        });

        // Now mark the assigned ones
        rolePermissions.forEach((p) => {
            const type = p.type_name;
            const op = p.operation_name;
            if (map[type] && map[type][op]) {
                map[type][op].checked = true;
            }
        });

        return map;
    };



    useEffect(() => {
        fetchMetaData();
    }, []);

    useEffect(() => {
        if (selectedBranch) {
            setShowOverlay(true);
            setOverlayText('Branch changed successfully');
            fetchGroups(selectedBranch).then(() => {
                setTimeout(() => setShowOverlay(false), 1000);
            });
        }
    }, [selectedBranch]);

    useEffect(() => {
        if (isFocused && selectedBranch) {
            console.log('🔄 Screen is focused, re-fetching roles...');
            fetchGroups(selectedBranch);
        }
    }, [isFocused, selectedBranch]);

    useEffect(() => {
        const excludedRoles = ['Organisation Admin', 'IoT User'];

        const filtered = roles.filter(role =>
            (!role.academic_year || role.academic_year === selectedYear) &&
            !excludedRoles.includes(role.name)
        );

        setFilteredRoles(filtered);
    }, [selectedYear, roles]);

    const handleAcademicYearChange = (yearId) => {
        setSelectedYear(yearId);
        setShowOverlay(true);
        setOverlayText('Academic Year changed successfully');
        setTimeout(() => setShowOverlay(false), 1000);
    };

    const handleTogglePermission = (module, permissionType) => {
        setEditablePermissionsMap(prev => ({
            ...prev,
            [module]: {
                ...prev[module],
                [permissionType]: {
                    ...prev[module][permissionType],
                    checked: !prev[module][permissionType].checked
                }
            }
        }));
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditablePermissionsMap(permissionsMap);
    };

    const handleSaveChanges = async () => {
        // Build permission IDs array
        const selectedPermissionIds = [];

        Object.keys(editablePermissionsMap).forEach((moduleName) => {
            const perms = editablePermissionsMap[moduleName];
            ['view', 'add', 'change', 'delete'].forEach((operation) => {
                if (perms[operation] && perms[operation].checked) {
                    const match = availablePermissions.find(
                        (p) =>
                            p.type_name.toLowerCase() === moduleName.toLowerCase() &&
                            p.operation_name === operation
                    );
                    if (match) {
                        selectedPermissionIds.push(match.id);
                    }
                }
            });
        });

        // Build payload
        const payload = {
            name: selectedRole.name,
            staff_type: selectedRole.staff_type || "Teaching",
            permissions_id: selectedPermissionIds,
            controlled_groups_id: [],  // You can update this if needed
        };

        console.log('Submitting payload:', payload);

        try {
            await PermissionsAPI.updateGroup(selectedRole.id, payload);
            setPermissionsMap(editablePermissionsMap);
            setIsEditing(false);
            Alert.alert('Success', 'Permissions updated successfully.');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save changes.');
        }
    };


    const handleDeleteRole = (groupId) => {
        Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete this role?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const success = await PermissionsAPI.deleteGroup(groupId);
                            if (success) {
                                setRoles((prevRoles) =>
                                    prevRoles.filter((role) => role.id !== groupId)
                                );
                                setSelectedRole(null);  // Go back to list view
                                Alert.alert('Deleted', 'Role deleted successfully.');
                            } else {
                                Alert.alert('Error', 'Failed to delete role');
                            }
                        } catch (error) {
                            console.error('Error deleting role:', error);
                            Alert.alert('Error', 'Something went wrong while deleting the role.');
                        }
                    }
                },
            ]
        );
    };


    const renderRoleItem = ({ item }) => {
        const bgColor = RANDOM_BG_COLORS[Math.floor(Math.random() * RANDOM_BG_COLORS.length)];
        return (
            <View style={[styles.roleItem, { backgroundColor: bgColor }]}>
                <Text style={styles.roleName}>{item.name}</Text>
                <TouchableOpacity
                    onPress={() => handleViewPermissions(item)}
                    style={styles.viewButton}
                    accessibilityLabel="View Permissions"
                >
                    <Eyecon name="key" size={16} color="#fff" style={{ marginRight: 6 }} />
                    
                </TouchableOpacity>
            </View>
        );
    };

    const renderPermissionsTable = () => {
        const filteredKeys = Object.keys(editablePermissionsMap).filter((key) =>
            key.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const isOrgAdmin = selectedRole?.name === 'Organisation Admin';

        return (
            <ScrollView style={{ marginTop: 20 }} contentContainerStyle={{ paddingBottom: 30 }}>
                <View style={styles.subHeaderRow}>
                    <TouchableOpacity onPress={() => setSelectedRole(null)}>
                        <Icon name="arrow-back" size={28} color="#2d3e83" />
                    </TouchableOpacity>
                    <Icon name="shield" size={28} color="#2d3e83" style={{ marginLeft: 10 }} />
                    <Text style={styles.detailsHeaderText}>Role Details - {selectedRole?.name}</Text>
                </View>

                {/* Edit/Delete buttons */}
                {!isOrgAdmin && (
                    <View style={styles.editButtonRow}>
                        {!isEditing ? (
                            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                                <Icon name="edit" size={20} color="#fff" />
                                <Text style={styles.editButtonText}>Edit Role</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                                    <Icon name="close" size={20} color="#fff" />
                                    <Text style={styles.editButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                                    <Icon name="save" size={20} color="#fff" />
                                    <Text style={styles.editButtonText}>Save Changes</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteRole(selectedRole.id)}>
                            <Text style={styles.editButtonText}>Delete Role</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.tableHeaderWrapper}>
                    <Text style={styles.tableTitle}>Permissions</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Permission Type..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                </View>

                <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>Permission Type</Text>
                    <Text style={styles.tableCell}>Read</Text>
                    <Text style={styles.tableCell}>Create</Text>
                    <Text style={styles.tableCell}>Update</Text>
                    <Text style={styles.tableCell}>Delete</Text>
                </View>

                {filteredKeys.length > 0 ? (
                    filteredKeys.map((module, index) => (
                        <View
                            key={module}
                            style={[
                                styles.tableRow,
                                { backgroundColor: ALTERNATE_ROW_COLORS[index % 2] }
                            ]}
                        >
                            <Text style={[styles.tableCell, { flex: 2 }]}>{module}</Text>
                            {['view', 'add', 'change', 'delete'].map((perm) => (
                                <TouchableOpacity
                                    key={perm}
                                    style={styles.tableCell}
                                    disabled={!isEditing}
                                    onPress={() => isEditing && handleTogglePermission(module, perm)}
                                >
                                    <Icon
                                        name={
                                            editablePermissionsMap[module][perm]?.checked
                                                ? 'check-box'
                                                : 'check-box-outline-blank'
                                        }
                                        size={20}
                                        color="#2d3e83"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))
                ) : (
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>No permissions available.</Text>
                )}
            </ScrollView>
        );
    };




    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Modal visible={showOverlay} transparent animationType="fade">
                <View style={styles.overlayContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.overlayText}>{overlayText}</Text>
                </View>
            </Modal>

            {(loading && !showOverlay) ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#2d3e83" />
                </View>
            ) : (
                <>
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
                    <View style={{ padding: 15, marginBottom: 0.5 }}></View>
                    {showProfileCard && (
                        <View style={styles.profileContainer}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.avatar} />
                            ) : (
                                <LottieView
                                    source={require('../../assets/default.json')}
                                    autoPlay
                                    loop
                                    style={styles.animation}
                                />
                            )}

                            <Text style={styles.greeting}>{currentUserName}</Text>
                            <Text style={styles.roleText}>{currentUserRole}</Text>

                            <View style={styles.dropdownRow}>
                                <Dropdown
                                    style={styles.dropdown}
                                    data={academicYears}
                                    labelField="label"
                                    valueField="value"
                                    value={selectedYear ?? ''}
                                    placeholder="Academic Year"
                                    onChange={(item) => handleAcademicYearChange(item.value)}
                                />
                                <Dropdown
                                    style={styles.dropdown}
                                    data={branches}
                                    labelField="label"
                                    valueField="value"
                                    value={selectedBranch ?? ''}
                                    placeholder="Branch"
                                    onChange={(item) => setSelectedBranch(item.value)}
                                />
                            </View>
                        </View>
                    )}


                    {!selectedRole && (
                        <View style={styles.subHeaderRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
                                    <Icon name="arrow-back" size={28} color="#2d3e83" />
                                </TouchableOpacity>
                                <Icon name="groups" size={28} color="#2d3e83" style={{ marginLeft: 10 }} />
                                <Text style={styles.detailsHeaderText}>User Roles</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.createRoleButton}
                                onPress={() => navigation.navigate('CreateRole')}
                            >
                                <Icon name="add-circle" size={20} color="#fff" style={{ marginRight: 5 }} />
                                <Text style={styles.createRoleButtonText}>Role</Text>
                            </TouchableOpacity>
                        </View>

                    )}

                    {!selectedRole ? (
                        filteredRoles.length > 0 ? (
                            <FlatList
                                data={filteredRoles}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderRoleItem}
                            />
                        ) : (
                            <Text style={{ textAlign: 'center', marginTop: 20 }}>No roles found.</Text>
                        )
                    ) : (
                        renderPermissionsTable()
                    )}
                </>
            )}
        </View>
    );
};

// ... [imports remain the same]

const styles = StyleSheet.create({
    overlayContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayText: {
        marginTop: 10,
        fontSize: 16,
        color: '#fff',
    },
    cardContainer: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    profileContainer: {
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: '#2d3e83',
        padding: 20,
        borderRadius: 16,
        elevation: 3,
    },
    avatar: {
        height: 80,
        width: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    roleText: {
        fontSize: 14, color: '#fff', marginBottom: 10
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
    subHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 20,
    },
    detailsHeaderText: {
        fontSize: 18,
        color: '#2d3e83',
        fontWeight: 'bold',
    },
    roleItem: {
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    roleName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    viewButton: {
        backgroundColor: '#2d3e83',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    viewButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    tableHeaderWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 10,
        paddingHorizontal: 5,
    },
    tableTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3e83',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 40,
        width: '50%',
        backgroundColor: '#fff',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: 'rgb(153, 224, 255)',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,

    },
    tableCell: {
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#2d3e83',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    editButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 10,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2d3e83',
        padding: 10,
        borderRadius: 8,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 8,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'gray',
        padding: 10,
        borderRadius: 8,
    },
    deleteButton: {
        marginLeft: 'auto',
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 8,
    },
    editButtonText: {
        color: '#fff',
        marginLeft: 5,
        fontWeight: 'bold',
    },
    createRoleButton: {
        backgroundColor: '#2d3e83',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 'auto',  // This aligns the button to the right side
    },
    createRoleButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    greeting: { fontSize: 22, fontWeight: '700', color: '#fff' },
    animation: { height: 80, width: 80, marginBottom: 10 },
    iconToggle: {
        alignSelf: 'flex-end',
        backgroundColor: '#2d3e83',
        padding: 8,
        borderRadius: 20,
        marginRight: 10,
        marginTop: 10,
    },

});



export default UserPermissionsScreen;
