import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { fetchDepartmentDetails } from '../api/common';

const { height } = Dimensions.get('window');

const getRandomBg = () => {
  const colors = ['#f9f9f9', '#f0f4ff', '#fef6e4', '#e4f9f5', '#fff4f4', '#f4f7ff'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const DepartmentDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { department_id } = route.params;

  const [departmentDetails, setDepartmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const getDepartmentDetails = async () => {
      try {
        const data = await fetchDepartmentDetails(department_id);
        setDepartmentDetails(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    getDepartmentDetails();
  }, [department_id]);

  if (loading) return <Text style={styles.loadingText}>Loading...</Text>;
  if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

  const { results = [] } = departmentDetails || {};
  const departmentInfo = results.length > 0 ? results[0].department : {};
  const hod = departmentInfo?.head_of_the_department || {};
  const description = departmentInfo?.description || 'No description available.';
  const members = results;

  const fullAddress = hod.address
    ? `${hod.address.street || ''}, ${hod.address.city || ''}, ${hod.address.state || ''} - ${hod.address.zip_code || ''}`
    : 'N/A';

  const filteredMembers = members.filter((member) => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    return fullName.includes(searchText.toLowerCase());
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Departments')}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Icon name="office-building-outline" size={22} color="#fff" style={styles.titleIcon} />
        <Text style={styles.headerTitle}>Department Details</Text>
      </View>

      <View style={styles.wall} />

      <View style={styles.cardContainer}>
        <View style={[styles.rowBox, { backgroundColor: getRandomBg() }]}>
          <Text style={styles.hodName}>
            {hod.first_name || 'N/A'} {hod.last_name || ''} - {hod.designation || 'N/A'}
          </Text>
        </View>

        <View style={[styles.rowBox, { backgroundColor: getRandomBg(), flexDirection: 'row' }]}>
          <View style={styles.leftColumn}>
            {hod.profile_picture ? (
              <Image source={{ uri: hod.profile_picture }} style={styles.profileImage} />
            ) : (
              <LottieView
                source={require('../../assets/default.json')}
                autoPlay
                loop
                style={styles.lottieFallback}
              />
            )}
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.iconRow}>
              <Icon name="email-outline" size={20} color="#333" />
              <Text style={styles.iconText}>{hod.email || 'N/A'}</Text>
            </View>
            <View style={styles.iconRow}>
              <Icon name="phone-outline" size={20} color="#333" />
              <Text style={styles.iconText}>{hod.phone || 'N/A'}</Text>
            </View>
            <View style={styles.iconRow}>
              <Icon name="map-marker-outline" size={20} color="#333" />
              <Text style={styles.iconText}>{fullAddress}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.sectionText}>{description}</Text>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Members of Department</Text>
        <TextInput
          placeholder="Search by Full Name"
          style={styles.searchInput}
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {filteredMembers.length === 0 ? (
        <Text style={styles.noMembersText}>No members found.</Text>
      ) : (
        filteredMembers.map((member, index) => (
          <View
            key={member.id || index}
            style={[styles.memberCard, { backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9ff' }]}
          >
            <Text style={styles.memberText}>Staff ID: {member.employee_id || 'N/A'}</Text>
            <Text style={styles.memberText}>
              Name: {member.first_name} {member.last_name}
            </Text>
            <Text style={styles.memberText}>Phone: {member.phone || 'N/A'}</Text>
            <Text style={styles.memberText}>Email: {member.email || 'N/A'}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  wall: { backgroundColor: '#2d3e83', height: 30 },
  cardContainer: { marginTop: -20, paddingHorizontal: 16, gap: 10 },
  rowBox: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 6,
  },
  leftColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightColumn: {
    flex: 2,
    justifyContent: 'center',
    paddingLeft: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
    borderWidth: 2,
    borderColor: '#e6e6e6',
  },
  lottieFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
  },
  hodName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3e83',
    textAlign: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  iconText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
  },
  section: {
    marginVertical: 16,
    padding: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    marginHorizontal: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    width: 180,
    fontSize: 14,
  },
  memberCard: {
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  memberText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  loadingText: {
    marginTop: 40,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 40,
    fontSize: 16,
    textAlign: 'center',
    color: 'red',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d3e83',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 10,
  },
  titleIcon: {
    marginLeft: 12,
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DepartmentDetailsScreen;
