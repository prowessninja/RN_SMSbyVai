// FeeModals.js
import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { Picker } from '@react-native-picker/picker';
import {
    getFeeTypesByStandard,
    createFeeConcession,
    editFeeConcession,
    createFeePayment,
    createMultipleFeePayments,
} from '../api/feeApi';

export const ProvideConcessionModal = ({ visible, onClose, userInfo, feeSummary, onSubmit }) => {
    const [feeTypes, setFeeTypes] = useState([]);
    const [feeId, setFeeId] = useState(null);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (visible) {
            loadFeeTypes();
        }
    }, [visible]);

    const loadFeeTypes = async () => {
        const fees = await getFeeTypesByStandard(userInfo.branch_id, userInfo.standard_id, userInfo.academic_year_id);
        const dueFeeTypeIds = Array.isArray(feeSummary?.results)
            ? feeSummary.results
                  .filter(f => f.total_amount_to_pay > 0 && f?.fee?.fee_type?.id != null)
                  .map(f => f.fee.fee_type.id)
            : [];

        const filteredFees = fees.filter(f => dueFeeTypeIds.includes(f.fee_type?.id));
        setFeeTypes(filteredFees);
    };

    const handleSubmit = async () => {
        await createFeeConcession({ user_id: userInfo.user_id, fee_id: feeId, amount: parseFloat(amount) });
        onSubmit();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalView}>
                <Text style={styles.title}>Provide Concession</Text>
                <Picker selectedValue={feeId} onValueChange={setFeeId}>
                    {feeTypes.map((fee) => (
                        <Picker.Item key={fee.id} label={fee.fee_type.name} value={fee.id} />
                    ))}
                </Picker>
                <TextInput placeholder="Amount" keyboardType="numeric" value={amount} onChangeText={setAmount} style={styles.input} />
                <View style={styles.buttonRow}>
                    <TouchableOpacity onPress={onClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity onPress={handleSubmit}><Text style={styles.submit}>Submit</Text></TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export const EditConcessionModal = ({ visible, onClose, concessionData, onSubmit }) => {
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (concessionData) setAmount(concessionData.amount.toString());
    }, [concessionData]);

    const handleSubmit = async () => {
        const payload = {
            id: concessionData.id,
            fee_id: concessionData.fee_id,
            user_id: concessionData.user_id,
            amount: parseFloat(amount),
        };
        await editFeeConcession(concessionData.id, payload);
        onSubmit();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalView}>
                <Text style={styles.title}>Edit Concession</Text>
                <TextInput placeholder="Amount" keyboardType="numeric" value={amount} onChangeText={setAmount} style={styles.input} />
                <View style={styles.buttonRow}>
                    <TouchableOpacity onPress={onClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity onPress={handleSubmit}><Text style={styles.submit}>Submit</Text></TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export const PayModal = ({ visible, onClose, feeId, userId, onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [paymentType, setPaymentType] = useState('Cash');
    const [paymentReference, setPaymentReference] = useState('');

    const handleSubmit = async () => {
        const payload = {
            user_id: userId,
            fee: feeId,
            amount: parseFloat(amount),
            payment_type: paymentType,
            payment_reference: paymentType === 'Online' ? paymentReference : null,
        };
        await createFeePayment(payload);
        onSubmit();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalView}>
                <Text style={styles.title}>Pay Fee</Text>
                <TextInput placeholder="Amount" keyboardType="numeric" value={amount} onChangeText={setAmount} style={styles.input} />
                <Picker selectedValue={paymentType} onValueChange={setPaymentType}>
                    <Picker.Item label="Cash" value="Cash" />
                    <Picker.Item label="Online" value="Online" />
                </Picker>
                {paymentType === 'Online' && (
                    <TextInput
                        placeholder="Payment Reference"
                        value={paymentReference}
                        onChangeText={setPaymentReference}
                        style={styles.input}
                    />
                )}
                <View style={styles.buttonRow}>
                    <TouchableOpacity onPress={onClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity onPress={handleSubmit}><Text style={styles.submit}>Submit</Text></TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export const PayMultipleFeeModal = ({ visible, onClose, userId, feeSummary, onSubmit }) => {
    const [paymentType, setPaymentType] = useState('Cash');
    const [selectedFees, setSelectedFees] = useState({});
    const [paymentReference, setPaymentReference] = useState('');

    const toggleFee = (feeId, amount) => {
        setSelectedFees((prev) => {
            const isSelected = !!prev[feeId];
            if (isSelected) {
                const copy = { ...prev };
                delete copy[feeId];
                return copy;
            } else {
                return { ...prev, [feeId]: amount.toString() };
            }
        });
    };

    const updateAmount = (feeId, value) => {
        setSelectedFees((prev) => ({ ...prev, [feeId]: value }));
    };

    const handleSubmit = async () => {
        const payload = Object.entries(selectedFees).map(([feeId, amt]) => ({
            user_id: userId,
            fee_id: parseInt(feeId),
            amount: parseFloat(amt),
            payment_type: paymentType,
            payment_reference: paymentType === 'Online' ? paymentReference : '',
        }));

        await createMultipleFeePayments(payload);
        onSubmit();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <ScrollView contentContainerStyle={styles.modalView}>
                <Text style={styles.title}>Pay Multiple Fees</Text>
                {feeSummary.results
                    .filter(item => item.total_amount_to_pay > 0)
                    .map((item) => (
                        <View key={item.fee.id} style={styles.feeRow}>
                            <CheckBox
                                value={!!selectedFees[item.fee.id]}
                                onValueChange={() => toggleFee(item.fee.id, item.total_amount_to_pay)}
                            />
                            <Text>{item.fee.fee_type.name}</Text>
                            <TextInput
                                style={styles.amountInput}
                                editable={!!selectedFees[item.fee.id]}
                                keyboardType="numeric"
                                value={selectedFees[item.fee.id] || ''}
                                onChangeText={(text) => updateAmount(item.fee.id, text)}
                            />
                        </View>
                    ))}
                <Picker selectedValue={paymentType} onValueChange={setPaymentType}>
                    <Picker.Item label="Cash" value="Cash" />
                    <Picker.Item label="Online" value="Online" />
                </Picker>
                {paymentType === 'Online' && (
                    <TextInput
                        placeholder="Payment Reference"
                        value={paymentReference}
                        onChangeText={setPaymentReference}
                        style={styles.input}
                    />
                )}
                <View style={styles.buttonRow}>
                    <TouchableOpacity onPress={onClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity onPress={handleSubmit}><Text style={styles.submit}>Submit</Text></TouchableOpacity>
                </View>
            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalView: {
        marginTop: 'auto',
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    input: {
        borderBottomWidth: 1,
        marginVertical: 12,
        padding: 6,
    },
    amountInput: {
        flex: 1,
        borderBottomWidth: 1,
        marginLeft: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    cancel: {
        color: 'red',
        fontWeight: 'bold',
    },
    submit: {
        color: 'green',
        fontWeight: 'bold',
    },
    feeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
});
