import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../context/AuthContext';
import { fetchFeeStructures } from '../api/feeApi';
import ProfileSection from '../components/ProfileSection';
import FeeStructureModal from '../components/FeeStructureModal';


if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FeeStructureScreen = ({ navigation }) => {
    const { user, selectedBranch, selectedAcademicYear, academicYears } = useContext(AuthContext);
    const [showProfile, setShowProfile] = useState(true);
    const [feeData, setFeeData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [expandedStandards, setExpandedStandards] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);


    const groupedFees = feeData.reduce((acc, fee) => {
        const stdName = fee.standard.name;
        if (!acc[stdName]) acc[stdName] = [];
        acc[stdName].push(fee);
        return acc;
    }, {});

    const openAddModal = () => {
        setSelectedFee(null);
        setModalVisible(true);
    };

    const openEditModal = (fee) => {
        setSelectedFee(fee);
        setModalVisible(true);
    };

    const handleModalSubmit = (newOrUpdatedFee) => {
        fetchFeeStructures(selectedBranch.id, selectedAcademicYear.id).then(setFeeData);
    };

    useEffect(() => {
        if (selectedBranch?.id && selectedAcademicYear?.id) {
            setLoading(true);
            fetchFeeStructures(selectedBranch.id, selectedAcademicYear.id)
                .then(setFeeData)
                .finally(() => setLoading(false));
        }
    }, [selectedBranch, selectedAcademicYear]);

    const toggleStandard = (standard) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedStandards((prev) => ({
            ...prev,
            [standard]: !prev[standard],
        }));
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>



            <ProfileSection user={user} showProfile={showProfile} setShowProfile={setShowProfile} />
            {/* Header Bar */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
                        <Ionicons name="arrow-back" size={24} color="#2d3e83" />
                    </TouchableOpacity>
                    <MaterialIcon name="attach-money" size={22} color="#2d3e83" />
                    <Text style={styles.headerTitle}>Fee Structure</Text>
                </View>
                <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
                    <MaterialIcon name="add-circle-outline" size={26} color="#2d3e83" />
                </TouchableOpacity>
            </View>

            <TextInput
                style={styles.searchBar}
                placeholder="Search standard..."
                onChangeText={setSearchTerm}
                value={searchTerm}
            />

            {loading ? (
                <View style={styles.loaderWrapper}>
                    <ActivityIndicator size="large" color="#2d3e83" />
                    <Text style={{ color: '#555', marginTop: 10 }}>Loading fee structures…</Text>
                </View>
            ) : (
                Object.entries(groupedFees)
                    .filter(([standard]) => standard.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(([standard, fees]) => {
                        const isExpanded = expandedStandards[standard];
                        return (
                            <View key={standard} style={styles.standardCard}>
                                <TouchableOpacity onPress={() => toggleStandard(standard)} style={styles.cardHeader}>
                                    <Text style={styles.standardName}>{standard}</Text>
                                    <MaterialIcon
                                        name={isExpanded ? 'expand-less' : 'expand-more'}
                                        size={24}
                                        color="#2d3e83"
                                    />
                                </TouchableOpacity>

                                {isExpanded &&
                                    fees.map((fee) => (
                                        <View key={fee.id} style={styles.feeRow}>
                                            <View style={styles.feeTextBlock}>
                                                <Text style={styles.feeTitle}>{fee.fee_type.name}</Text>
                                                <Text>Amount: ₹{fee.amount}</Text>
                                                <Text>Min. Term: ₹{fee.min_amount}</Text>
                                                <Text>Due Date: {fee.due_date}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => openEditModal(fee)}>
                                                <MaterialIcon name="edit" size={22} color="#2d3e83" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                            </View>


                        );


                    })
            )}

            <View style={{ height: 50 }} />

            <FeeStructureModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleModalSubmit}
                selectedFee={selectedFee}
                academicYears={academicYears}
                selectedAcademicYear={selectedAcademicYear}
                selectedBranch={selectedBranch}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#f3f4ff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3e83',
        marginLeft: 8,
    },
    addButton: {
        paddingHorizontal: 4,
    },
    searchBar: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
        marginVertical: 10,
    },
    standardCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#eaf0ff',
    },
    standardName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3e83',
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderColor: '#ccc',
    },
    feeTextBlock: {
        flex: 1,
        paddingRight: 10,
    },
    feeTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 2,
    },
    loaderWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
});

export default FeeStructureScreen;
