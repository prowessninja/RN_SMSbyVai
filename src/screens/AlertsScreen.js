import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import { fetchNotifications, fetchAnnouncements } from '../api/notificationsApi';
import moment from 'moment';
import { AlertsContext } from '../context/AuthContext'; // your badge context
import AddAnnouncementModal from '../components/AddAnnouncementModal';
import { AuthContext } from '../context/AuthContext';


const AlertsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [view, setView] = useState('notifications'); // toggle
  const { setBadgeCount } = useContext(AlertsContext);
  const [showModal, setShowModal] = useState(false);

  const {
  selectedBranch,
  selectedAcademicYear,
} = useContext(AuthContext);

console.log('Selected Year:',selectedAcademicYear.id);
console.log('Selected Branch:',selectedBranch.id);


// Use these directly without dropdowns in AlertsScreen


  const now = new Date();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const [notifs, anncs] = await Promise.all([
        fetchNotifications(),
        fetchAnnouncements(),
      ]);

      // Sort for display
      const sortedNotifs = [...notifs].sort(
        (a, b) => new Date(b.created) - new Date(a.created)
      );
      const sortedAnncs = [...anncs].sort(
        (a, b) => new Date(b.start_date) - new Date(a.start_date)
      );

      setNotifications(sortedNotifs);
      setAnnouncements(sortedAnncs);

      // Count upcoming notifications & announcements for badge
      const upcomingNotifsCount = sortedNotifs.filter(n => new Date(n.created) >= now).length;
      const upcomingAnncsCount = sortedAnncs.filter(a => new Date(a.end_date) >= now).length;

      setBadgeCount(upcomingNotifsCount + upcomingAnncsCount);
    } catch (err) {
      console.error('Error fetching alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const onAddAnnouncement = () => {
    setShowModal(true);
  };


  // Render all notifications (no filter)
  const renderNotifications = () => (
    <View style={styles.section}>
      {notifications.length === 0 ? (
        <Text style={{ color: '#666', fontStyle: 'italic' }}>No notifications</Text>
      ) : (
        notifications.map((n) => (
          <View key={n.id} style={styles.notificationCard}>
            <View style={styles.timelineDot} />
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{n.title}</Text>
              <Text style={styles.notificationText}>{n.description}</Text>
              <Text style={styles.notificationDate}>
                {moment(n.created).format('DD MMM YYYY, hh:mm A')}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  // Render all announcements (no filter)
  const renderAnnouncements = () => (
    <View style={styles.section}>
      {announcements.length === 0 ? (
        <Text style={{ color: '#666', fontStyle: 'italic' }}>No announcements</Text>
      ) : (
        announcements.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={styles.announcementCard}
            onPress={() => toggleExpand(a.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.announcementTitle}>{a.title}</Text>
            {expanded[a.id] && (
              <View style={styles.announcementDetails}>
                <Text>Date: {a.start_date}</Text>
                <Text>From: {a.start_time || 'N/A'}</Text>
                <Text>To: {a.end_time || 'N/A'}</Text>
                <Text>Venue: {a.venue}</Text>
                <Text style={{ marginTop: 8 }}>{a.description}</Text>
                {a.image && (
                  <Image
                    source={{ uri: a.image }}
                    style={styles.announcementImage}
                    resizeMode="contain"
                  />
                )}
                {a.pdf_attachment && (
                  <TouchableOpacity onPress={() => Linking.openURL(a.pdf_attachment)}>
                    <Text style={styles.downloadLink}>📄 Download Attachment</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color="#2d3e83"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.headerText}>Alerts</Text>
        </View>

        {view === 'announcements' && (
          <TouchableOpacity
            onPress={onAddAnnouncement}
            style={styles.addButton}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={28} color="#2d3e83" />
          </TouchableOpacity>
        )}
      </View>

      {/* Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, view === 'notifications' && styles.toggleButtonActive]}
          onPress={() => setView('notifications')}
        >
          <Text
            style={[styles.toggleText, view === 'notifications' && styles.toggleTextActive]}
          >
            Notifications ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, view === 'announcements' && styles.toggleButtonActive]}
          onPress={() => setView('announcements')}
        >
          <Text style={[styles.toggleText, view === 'announcements' && styles.toggleTextActive]}>
            Announcements ({announcements.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2d3e83" />
        </View>
      ) : notifications.length === 0 && announcements.length === 0 ? (
        <View style={styles.content}>
          <LottieView
            source={require('../../assets/animations/no-alerts.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={styles.noAlertsText}>No Alerts to Display</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {view === 'notifications' ? renderNotifications() : renderAnnouncements()}
        </ScrollView>
      )}

      <AddAnnouncementModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmitted={fetchAlerts}
      />

    </SafeAreaView>


  );

};

const styles = StyleSheet.create({
  // ... your styles unchanged
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3e83',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lottie: {
    width: 200,
    height: 200,
  },
  noAlertsText: {
    marginTop: 20,
    fontSize: 18,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  toggleButtonActive: {
    backgroundColor: '#2d3e83',
  },
  toggleText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  notificationCard: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingLeft: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    backgroundColor: '#2d3e83',
    borderRadius: 5,
    marginRight: 12,
    marginTop: 6,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3e83',
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  announcementCard: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  announcementTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2d3e83',
  },
  announcementDetails: {
    marginTop: 10,
  },
  announcementImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 6,
  },
  downloadLink: {
    marginTop: 10,
    color: '#2d3e83',
    textDecorationLine: 'underline',
  },
});

export default AlertsScreen;
