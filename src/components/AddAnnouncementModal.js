import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import * as ImagePicker from 'react-native-image-picker';
import moment from 'moment';
import { postAnnouncement } from '../api/notificationsApi';

const AddAnnouncementModal = ({ visible, onClose, onSubmitted }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    venue: '',
    external_url: '',
    image: null,
    pdf_attachment: null,
    academic_year: 1,
    branch: 2,
  });

  const [showPickers, setShowPickers] = useState({});

  const handleInput = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handlePickImage = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo', includeBase64: true }, (response) => {
      if (!response.didCancel && !response.errorCode && response.assets?.[0]) {
        const asset = response.assets[0];
        handleInput('image', `data:${asset.type};base64,${asset.base64}`);
      }
    });
  };

  const handlePickPDF = async () => {
    try {
      const res = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.pdf] });
      const base64 = await RNFS.readFile(res.uri, 'base64');
      handleInput('pdf_attachment', `data:application/pdf;base64,${base64}`);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) console.warn(err);
    }
  };

  const handlePicker = (key, event, selectedValue) => {
    setShowPickers(prev => ({ ...prev, [key]: false }));
    if (selectedValue) {
      const formatted = key.includes('date')
        ? moment(selectedValue).format('YYYY-MM-DD')
        : moment(selectedValue).format('HH:mm');
      handleInput(key, formatted);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.start_date || !form.end_date) {
      Alert.alert('Validation Error', 'Title, Description, and Dates are required.');
      return;
    }

    try {
      console.log('Submitting announcement form:', form);
      await postAnnouncement(form);
      onSubmitted?.();
      onClose();
    } catch (err) {
      console.error('Post error:', err);
      Alert.alert('Error', 'Failed to post announcement.');
    }
  };

  const renderField = (label, key, isTime = false) => (
    <View style={styles.inputBlock}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowPickers(prev => ({ ...prev, [key]: true }))}
      >
        <Text style={{ color: form[key] ? '#000' : '#999' }}>
          {form[key] || `Select ${label}`}
        </Text>
      </TouchableOpacity>
      {showPickers[key] && (
        <DateTimePicker
          mode={isTime ? 'time' : 'date'}
          value={new Date()}
          display="default"
          onChange={(e, val) => handlePicker(key, e, val)}
        />
      )}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalWrapper}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Add Announcement</Text>

            {[
              { label: 'Title', key: 'title' },
              { label: 'Description', key: 'description' },
              { label: 'Venue', key: 'venue' },
              { label: 'External URL', key: 'external_url' }
            ].map(({ label, key }) => (
              <View key={key} style={styles.inputBlock}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Enter ${label}`}
                  value={form[key]}
                  onChangeText={(text) => handleInput(key, text)}
                  multiline={key === 'description'}
                />
              </View>
            ))}

            {renderField('Start Date', 'start_date')}
            {renderField('End Date', 'end_date')}
            {renderField('Start Time', 'start_time', true)}
            {renderField('End Time', 'end_time', true)}

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Image</Text>
              <TouchableOpacity style={styles.input} onPress={handlePickImage}>
                <Text>{form.image ? 'Image Selected' : 'Choose Image'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>PDF Attachment</Text>
              <TouchableOpacity style={styles.input} onPress={handlePickPDF}>
                <Text>{form.pdf_attachment ? 'PDF Selected' : 'Choose PDF'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '92%',
    maxHeight: '90%',
    borderRadius: 12,
    padding: 16,
  },
  container: {
    paddingBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3e83',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputBlock: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2d3e83',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 8,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    borderColor: '#2d3e83',
    borderWidth: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelText: {
    color: '#2d3e83',
    fontWeight: 'bold',
  },
});

export default AddAnnouncementModal;
