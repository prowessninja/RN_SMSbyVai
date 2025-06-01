import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';

const InvoiceModal = ({ visible, onClose, invoiceData, onDownload }) => {
  const {
    studentName,
    standard,
    invoiceNumber,
    issueDate,
    paymentDate,
    amount,
    feeDetails,
    totalFee,
    totalConcession,
    pendingAmount,
    paymentType
  } = invoiceData;


  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView>
            <View style={styles.header}>
              <Text style={styles.logo}>📄 Logo</Text>
              <Text style={styles.issueDate}>Issue Date: {issueDate}</Text>
            </View>

            <View style={styles.billTo}>
              <Text style={styles.label}>BILL TO</Text>
              <Text style={styles.value}>{studentName}</Text>
              <Text style={styles.value}>{standard}</Text>
            </View>

            <View style={styles.paymentDetails}>
              <Text style={styles.label}>PAYMENT</Text>
              <Text style={styles.value}>Payment Date: {paymentDate}</Text>
              <Text style={styles.value}>Mode of Payment: {paymentType}</Text>
              <Text style={styles.value}>RS {amount}</Text>
            </View>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.cell}>ITEM</Text>
                <Text style={styles.cell}>TOTAL AMOUNT</Text>
                <Text style={styles.cell}>PAID</Text>
                <Text style={styles.cell}>AMOUNT</Text>
              </View>
              {feeDetails.map((fee, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.cell}>{fee.type}</Text>
                  <Text style={styles.cell}>{fee.amount}</Text>
                  <Text style={styles.cell}>{fee.amount}</Text>
                  <Text style={styles.cell}>RS {fee.amount}</Text>
                </View>
              ))}
              <View style={styles.tableFooter}>
                <Text style={styles.cell}>Total</Text>
                <Text style={styles.cell}></Text>
                <Text style={styles.cell}>{amount}</Text>
                <Text style={styles.cell}>RS {amount}</Text>
              </View>
            </View>

            <Text style={styles.summaryHeader}>Fee summary</Text>
            <View style={styles.summaryTable}>
              <View style={styles.summaryRow}>
                <Text>Total Fee Amount</Text>
                <Text style={styles.bold}>RS {totalFee}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Paid Amount</Text>
                <Text style={styles.bold}>RS {totalFee - pendingAmount}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Pending Amount</Text>
                <Text style={styles.bold}>RS {pendingAmount}</Text>
              </View>
            </View>

            <Text style={styles.footerText}>Powered By VisionariesAI Labs</Text>
            <Text style={styles.footerLink}>https://visionariesai.com</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.downloadBtn} onPress={onDownload}>
                <Text style={styles.downloadText}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default InvoiceModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    backgroundColor: '#fff',
    width: '95%',
    maxHeight: '95%',
    borderRadius: 8,
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  issueDate: {
    fontSize: 12
  },
  billTo: {
    marginTop: 16
  },
  label: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4
  },
  value: {
    fontSize: 13,
    marginBottom: 2
  },
  paymentDetails: {
    marginTop: 12
  },
  table: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderColor: '#ccc'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  tableFooter: {
    flexDirection: 'row',
    backgroundColor: '#fafafa'
  },
  cell: {
    flex: 1,
    padding: 8,
    fontSize: 12,
    borderRightWidth: 1,
    borderColor: '#ddd',
    textAlign: 'center'
  },
  summaryHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6
  },
  summaryTable: {
    borderWidth: 1,
    borderColor: '#ccc'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  bold: {
    fontWeight: 'bold'
  },
  footerText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12
  },
  footerLink: {
    textAlign: 'center',
    fontSize: 12,
    color: 'blue',
    marginBottom: 16
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12
  },
  downloadBtn: {
    backgroundColor: '#2d3e83',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6
  },
  cancelBtn: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6
  },
  downloadText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
