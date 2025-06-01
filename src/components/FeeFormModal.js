// FeeFormModal.js (Enhanced with expandable cards, action buttons, and mobile-friendly UI)
import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Linking,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Platform, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InvoiceModal from './InvoiceModal';
import {
    ProvideConcessionModal,
    EditConcessionModal,
    PayModal,
    PayMultipleFeeModal,
} from './FeeModals';

const FeeFormModal = ({ visible, onClose, selectedFeeSummary, selectedUserInfo, onRefresh }) => {
    const [expandedIndexes, setExpandedIndexes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedTxn, setSelectedTxn] = useState(null);
    const [showProvideConcession, setShowProvideConcession] = useState(false);
    const [showEditConcession, setShowEditConcession] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [showPayMultipleFee, setShowPayMultipleFee] = useState(false);
    const [selectedFeeItem, setSelectedFeeItem] = useState(null);
    const [selectedConcessionData, setSelectedConcessionData] = useState(null);

    const toggleExpand = (index) => {
        setExpandedIndexes((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };

    const renderFeeItem = (item, index) => {
        const isExpanded = expandedIndexes.includes(index);
        const isFullyPaid = item.total_amount_to_pay === 0;
        const hasConcession = item.concession_amount > 0;

        return (
            <View key={index} style={styles.feeCard}>
                <TouchableOpacity onPress={() => toggleExpand(index)}>
                    <View style={styles.feeHeader}>
                        <Text style={styles.feeTitle}>{item.fee.fee_type.name}</Text>
                        <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color="#2d3e83"
                        />
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.feeDetails}>
                        <Text style={styles.label}>Total: ₹{item.fee.amount}</Text>
                        <Text style={styles.label}>Concession: ₹{item.concession_amount || 0}</Text>
                        <Text style={styles.label}>Paid: ₹{item.total_paid || 0}</Text>
                        <Text style={styles.label}>Due: ₹{item.total_amount_to_pay || 0}</Text>

                        <View style={styles.buttonRow}>
                            {isFullyPaid ? (
                                <View style={styles.disabledButton}>
                                    <Text style={styles.disabledbuttonText}>Paid</Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        setSelectedFeeItem(item);
                                        setShowPayModal(true);
                                    }}
                                >
                                    <Text style={[styles.buttonText, { color: '#fff' }]}>Pay</Text>
                                </TouchableOpacity>
                            )}
                            {hasConcession && (
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        setSelectedConcessionData({
                                            fee_id: item.fee.id,
                                            user_id: selectedUserInfo.user_id,
                                            id: item.concession_id,
                                            amount: item.concession_amount,
                                        });
                                        setShowEditConcession(true);
                                    }}
                                >
                                    <Text style={styles.buttonText}>Edit</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    const generatePDF = async (txn) => {
        const safeDate = txn.payment_date || txn.date || new Date().toISOString();
        const cleanDate = safeDate.replace(/[^0-9]/g, '');

        const htmlContent = `
  <html>
    <head>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          padding: 20px;
        }
        .header, .footer {
          text-align: center;
        }
        .invoice-title {
          font-size: 20px;
          font-weight: bold;
        }
        .contact-info, .address {
          font-size: 11px;
          margin-top: 4px;
        }
        .section {
          margin-top: 12px;
        }
        .section h3 {
          background: #2d3e83;
          color: white;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 13px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 6px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .amount-summary td {
          font-weight: bold;
        }
        .amount-right {
          text-align: right;
          font-size: 16px;
          font-weight: bold;
          margin-top: 10px;
        }
        .thank-you {
          text-align: center;
          margin-top: 30px;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="invoice-title">INVOICE</div>
          <div class="contact-info">
            931-000-1111 | hr@visionariesailabs.com | visionariesailabs.com
          </div>
          <div class="address">
            Srikakulam, AP, India - 532401
          </div>
        </div>

        <div class="section">
          <h3>Billed To</h3>
          <p>${selectedUserInfo.user_name}<br/>${selectedUserInfo.standard}</p>
        </div>

        <div class="section">
          <table>
            <tr>
              <td><strong>Invoice Number:</strong></td>
              <td>${txn.payment_reference || safeDate}</td>
            </tr>
            <tr>
              <td><strong>Date of Issue:</strong></td>
              <td>${formatDate(new Date())}</td>
            </tr>
            <tr>
              <td><strong>Payment Date:</strong></td>
              <td>${formatDate(txn.payment_date || txn.date)}</td>
            </tr>
          </table>
        </div>

        <div class="amount-right">
          RS ${txn.amount.toFixed(2)}
        </div>

        <div class="section">
          <h3>Fee Description</h3>
          <table>
            <thead>
              <tr>
                <th>Fees</th>
                <th>Amount</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${txn.feetype || txn.fee_type}</td>
                <td>RS ${txn.amount.toFixed(2)}</td>
                <td>RS ${txn.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <table class="amount-summary">
            <tr><td>Subtotal</td><td>RS ${txn.amount.toFixed(2)}</td></tr>
            <tr><td>Tax</td><td>RS 0.00</td></tr>
            <tr><td><strong>Total</strong></td><td><strong>RS ${txn.amount.toFixed(2)}</strong></td></tr>
          </table>
        </div>

        <div class="section">
          <h3>Fee Summary</h3>
          <table>
            <tr><td>Total Fee Amount</td><td>RS ${selectedUserInfo.totalfee}</td></tr>
            <tr><td>Total Concession Amount</td><td>RS ${selectedUserInfo.concessions?.reduce((sum, c) => sum + c.amount, 0) || 0}</td></tr>
            <tr><td>Total Amount Paid</td><td>RS ${selectedUserInfo.totalfee - selectedUserInfo.pending_fee}</td></tr>
            <tr><td>Amount Pending</td><td>RS ${selectedUserInfo.pending_fee}</td></tr>
          </table>
        </div>

        <div class="section">
          <h3>Payment Details</h3>
          <table>
            <tr><td>Collected By</td><td>-</td></tr>
            <tr><td>Payment Mode</td><td>${txn.payment_type}</td></tr>
          </table>
        </div>

        <div class="thank-you">
          Thank you for your payment!
        </div>
      </div>
    </body>
  </html>
`;



        try {
            const options = {
                html: htmlContent,
                fileName: `Invoice_${cleanDate}`,
                directory: 'Documents',
                height: 1122, // A4 height in pixels at 96 DPI
                width: 794,   // A4 width in pixels at 96 DPI
            };


            const file = await RNHTMLtoPDF.convert(options);
            Alert.alert('PDF Generated', `Invoice saved to: ${file.filePath}`);
        } catch (err) {
            console.error('PDF generation error', err);
            Alert.alert('Error', 'Failed to generate invoice.');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString(); // includes both date and time
    };


    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <ScrollView>
                        <View style={styles.headerRow}>
                            <Text style={styles.title}>{selectedUserInfo?.user_name}</Text>
                            <TouchableOpacity onPress={onClose}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
                        </View>

                        <View style={styles.studentCard}>
                            <Text style={styles.info}>Admission No: {selectedUserInfo?.admission_number}</Text>
                            <Text style={styles.info}>Standard: {selectedUserInfo?.standard}</Text>
                            <Text style={styles.info}>Academic Year: {selectedUserInfo?.academic_year}</Text>

                            <TouchableOpacity
                                style={styles.mainPayButton}
                                onPress={() => setShowProvideConcession(true)}
                            >
                                <Text style={styles.buttonText}>Provide Concession</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sectionTitle}>Fee Breakdown</Text>
                        {(selectedFeeSummary?.results || []).map(renderFeeItem)}

                        <View style={styles.amountDueRow}>
                            <Text style={styles.amountDueLabel}>Amount to be paid:</Text>
                            <Text style={styles.amountDueValue}>₹{selectedUserInfo?.pending_fee}</Text>
                        </View>

                        {selectedUserInfo?.pending_fee > 0 && (
                            <TouchableOpacity
                                style={styles.mainPayButton}
                                onPress={() => setShowPayMultipleFee(true)}
                            >
                                <Text style={styles.buttonText}>Pay Multiple Fee</Text>
                            </TouchableOpacity>
                        )}

                        <Text style={styles.sectionTitle}>Payment History</Text>
                        {(selectedUserInfo?.transactions || []).length === 0 ? (
                            <Text style={styles.info}>No transactions available.</Text>
                        ) : (
                            selectedUserInfo.transactions.map((txn, i) => (
                                <View key={i} style={styles.paymentCard}>
                                    <TouchableOpacity
                                        style={styles.downloadIconWrapper}
                                        onPress={() => {
                                            setSelectedTxn(txn);
                                            setShowInvoiceModal(true);
                                        }}
                                    >
                                        <Ionicons name="download-outline" size={20} color="#2d3e83" />
                                    </TouchableOpacity>

                                    <Text style={styles.label}>Fee Type: {txn.feetype || txn.fee_type}</Text>
                                    <Text style={styles.label}>Date of Payment: {txn.date?.split('T')[0] || txn.payment_date?.split('T')[0]}</Text>
                                    <Text style={styles.label}>Amount: ₹{txn.amount}</Text>
                                    <Text style={styles.label}>Mode: {txn.payment_type}</Text>
                                    <Text style={styles.label}>Status: {txn.status || 'Success'}</Text>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {showInvoiceModal && selectedTxn && (
                        <InvoiceModal
                            visible={showInvoiceModal}
                            onClose={() => setShowInvoiceModal(false)}
                            invoiceData={{
                                studentName: selectedUserInfo.user_name,
                                standard: selectedUserInfo.standard,
                                invoiceNumber: selectedTxn.payment_reference || selectedTxn.payment_date,
                                issueDate: formatDate(new Date()), // CURRENT TIMESTAMP
                                paymentDate: formatDate(selectedTxn.payment_date || selectedTxn.date), // FROM TXN
                                amount: selectedTxn.amount,
                                feeDetails: [{ type: selectedTxn.feetype || selectedTxn.fee_type, amount: selectedTxn.amount }],
                                totalFee: selectedUserInfo.totalfee,
                                totalConcession: selectedUserInfo.concessions?.reduce((sum, c) => sum + c.amount, 0) || 0,
                                pendingAmount: selectedUserInfo.pending_fee,
                                paymentType: selectedTxn.payment_type,
                            }}
                            onDownload={() => generatePDF(selectedTxn)}
                        />

                    )}

                    <ProvideConcessionModal
                        visible={showProvideConcession}
                        userInfo={selectedUserInfo}
                        feeSummary={selectedFeeSummary}
                        onClose={() => setShowProvideConcession(false)}
                        onSubmit={onRefresh}
                    />


                    <EditConcessionModal
                        visible={showEditConcession}
                        concessionData={selectedConcessionData}
                        onClose={() => setShowEditConcession(false)}
                        onSubmit={onRefresh}
                    />

                    <PayModal
                        visible={showPayModal}
                        feeId={selectedFeeItem?.fee.id}
                        userId={selectedUserInfo.user_id}
                        onClose={() => setShowPayModal(false)}
                        onSubmit={onRefresh}
                    />

                    <PayMultipleFeeModal
                        visible={showPayMultipleFee}
                        feeSummary={selectedFeeSummary}
                        userId={selectedUserInfo.user_id}
                        onClose={() => setShowPayMultipleFee(false)}
                        onSubmit={onRefresh}
                    />

                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#fff" />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );



};

export default FeeFormModal;

// Keep existing styles below unchanged


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        width: '95%',
        maxHeight: '90%',
        borderRadius: 10,
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3e83',
    },
    closeBtn: {
        fontSize: 20,
        color: '#888',
    },
    studentCard: {
        marginTop: 10,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f1f3ff',
        marginBottom: 10,
    },
    info: {
        fontSize: 13,
        marginVertical: 2,
        color: '#444',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3e83',
        marginTop: 16,
        marginBottom: 8,
    },
    feeCard: {
        backgroundColor: '#fafafa',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    feeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    feeTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#2d3e83',
    },
    feeDetails: {
        marginTop: 8,
    },
    label: {
        fontSize: 13,
        marginBottom: 2,
        color: '#444',
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 8,
    },
    button: {
        backgroundColor: '#2d3e83',
        padding: 6,
        borderRadius: 6,
    },
    disabledButton: {
        borderColor: 'green',
        borderWidth: 1,
        padding: 6,
        borderRadius: 6,
    },
    disabledbuttonText: {
        color: 'green', // Only if used in Paid button
        fontWeight: 'bold',
    },
    buttonText: {
        color: 'white', // Only if used in Paid button
        fontWeight: 'bold',
    },
    editButton: {
        borderColor: '#2d3e83',
        borderWidth: 1,
        padding: 6,
        borderRadius: 6,
    },
    editText: {
        color: '#2d3e83',
        fontWeight: '600',
    },
    amountDueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingVertical: 10,
        backgroundColor: '#f1f3ff',
        borderRadius: 6,
        paddingHorizontal: 10,
    },
    amountDueLabel: {
        fontWeight: '600',
        fontSize: 14,
        color: '#333',
    },
    amountDueValue: {
        fontWeight: '700',
        fontSize: 14,
        color: '#e63946',
    },
    mainPayButton: {
        marginTop: 12,
        backgroundColor: '#2d3e83',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    downloadIconWrapper: {
        position: 'absolute',
        top: 6,
        right: 6,
        zIndex: 1,
    },
    paymentCard: {
        position: 'relative',
        marginTop: 10,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
    },
    invoiceButton: {
        marginTop: 6,
        padding: 6,
        backgroundColor: '#2d3e83',
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    invoiceText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
});