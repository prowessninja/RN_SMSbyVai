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
import { fetchClassAndSectionDetails } from '../api/common';
import LottieView from 'lottie-react-native';

const { height } = Dimensions.get('window');

const getRandomBg = () => {
  const colors = ['#f9f9f9', '#f0f4ff', '#fef6e4', '#e4f9f5', '#fff4f4', '#f4f7ff'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const ClassAndSectionDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { branch_id, section_id, standard_id } = route.params;

  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const getClassAndSectionDetails = async () => {
      try {
        const data = await fetchClassAndSectionDetails(branch_id, section_id, standard_id);
        setClassDetails(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    getClassAndSectionDetails();
  }, [branch_id, section_id]);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  const { sectionByStandard = [], students = [] } = classDetails;
  const sectionInfo = sectionByStandard[0] || {};

  const hod = sectionInfo.head_teacher || {};
  const rep = sectionInfo.class_representative || {};
  const standard = sectionInfo.standard || {};
  const fullAddress = hod.address
    ? `${hod.address.street || ''}, ${hod.address.city || ''}, ${hod.address.state || ''} - ${hod.address.zip_code || ''}`
    : 'N/A';

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    return fullName.includes(searchText.toLowerCase());
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Custom Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Standards')}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Icon name="clipboard-text-outline" size={22} color="#fff" style={styles.titleIcon} />
        <Text style={styles.headerTitle}>Class and Section Details</Text>
      </View>

      <View style={styles.wall} />

      <View style={styles.cardContainer}>
        {/* First Rounded Rectangle */}
        <View style={[styles.rowBox, { backgroundColor: getRandomBg() }]}>
          <Text style={styles.classTitle}>
            {standard.name || 'Class'} - {sectionInfo.name || 'Section'}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLeft}>
              HoD: {hod.first_name || 'N/A'} {hod.last_name || ''}
            </Text>
            <Text style={styles.infoRight}>
              Rep: {rep.first_name || 'N/A'} {rep.last_name || ''}
            </Text>
          </View>
        </View>

        {/* Second Rounded Rectangle - Profile + Contact + Address */}
        <View style={[styles.rowBox, { backgroundColor: getRandomBg(), flexDirection: 'row' }]}>
          <View style={styles.leftColumn}>
            {hod?.profile_picture ? (
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
        <Text style={styles.sectionText}>
          This section is responsible for higher secondary curriculum, focusing on science and mathematics with experienced faculty and engaging academic programs.
        </Text>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Class Students</Text>
        <TextInput
          placeholder="Search by Full Name"
          style={styles.searchInput}
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.studentTableHeader}>
        <Text style={styles.tableHeaderCell}>Roll No</Text>
        <Text style={styles.tableHeaderCell}>Name</Text>
        <Text style={styles.tableHeaderCell}>Phone</Text>
        <Text style={styles.tableHeaderCell}>Email</Text>
      </View>

      {filteredStudents.map((student, index) => (
        <View
          style={[
            styles.studentRow,
            { backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9ff' },
          ]}
          key={student.id}
        >
          <Text style={styles.tableCell}>{student.admission_number}</Text>
          <Text style={styles.tableCell}>{`${student.first_name} ${student.last_name}`}</Text>
          <Text style={styles.tableCell}>{student.phone}</Text>
          <Text style={styles.tableCell}>{student.email}</Text>
        </View>
      ))}
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
  classTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3e83',
    textAlign: 'center',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLeft: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  infoRight: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
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
  studentTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2d3e83',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 13,
    flex: 1,
    color: '#fff',
    textAlign: 'center',
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableCell: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  hodNameRow: {
    marginBottom: 6,
  },
  hodNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3e83',
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

export default ClassAndSectionDetailsScreen;
