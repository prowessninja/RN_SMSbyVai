// components/EventDetailsModal.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import dayjs from 'dayjs';

const EventDetailsModal = ({ visible, event, onClose, onEdit, onDelete, loading }) => {
  if (!event) return null;

  const formattedStart = dayjs(event.start_date).format('YYYY-MM-DD HH:mm');
  const formattedEnd = dayjs(event.end_date).format('YYYY-MM-DD HH:mm');

  const createdBy = event.created_by?.first_name && event.created_by?.last_name
    ? `${event.created_by.first_name} ${event.created_by.last_name}`
    : 'Unknown';

  let eventTo = 'N/A';

  if (event.applies_to === 'Branches') {
    eventTo = event.branches?.map((b) => b.name).join(', ') || 'N/A';
  } else if (event.applies_to === 'Departments') {
    eventTo = event.departments?.map((d) => d.name).join(', ') || 'N/A';
  } else if (event.applies_to === 'Standards') {
    eventTo = event.standards?.map((s) => s.name).join(', ') || 'N/A';
  } else if (event.applies_to === 'Sections') {
    eventTo = event.sections?.map((s) => {
      const standardName = s.standard?.name || 'Unknown Standard';
      return `${standardName} - ${s.name}`;
    }).join(', ') || 'N/A';
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <View style={styles.headerRow}>
              <Text style={styles.modalTitle}>Event Details</Text>
              <View style={styles.actionIcons}>
                <TouchableOpacity style={styles.iconBtn} onPress={onEdit}>
                  <Icon name="edit" size={18} color="#2d3e83" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={onDelete}>
                  <Icon name="trash" size={18} color="#d32f2f" />
                </TouchableOpacity>
              </View>
            </View>

            {event.image && (
              <Image
                source={{ uri: event.image }}
                style={styles.image}
                resizeMode="cover"
              />
            )}

            <Text style={styles.label}>Title:</Text>
            <Text style={styles.value}>{event.name}</Text>

            <Text style={styles.label}>Created by:</Text>
            <Text style={styles.value}>{createdBy}</Text>

            <Text style={styles.label}>Start:</Text>
            <Text style={styles.value}>{formattedStart}</Text>

            <Text style={styles.label}>End:</Text>
            <Text style={styles.value}>{formattedEnd}</Text>

            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{event.description}</Text>

            <Text style={styles.label}>Event To:</Text>
            <Text style={styles.value}>{eventTo}</Text>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Deleting...</Text>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3e83',
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    padding: 6,
  },
  label: {
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  value: {
    color: '#555',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: '#2d3e83',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

});

export default EventDetailsModal;
