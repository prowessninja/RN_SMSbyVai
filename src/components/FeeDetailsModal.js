import React from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from "react-native";

const FeeDetailsModal = ({ visible, onClose, data }) => {
    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerText}>Student: {data.user_name}</Text>
                            <Text>Roll No: {data.admission_number}</Text>
                            <Text>Standard: {data.standard}</Text>
                            <Text>Academic Year: {data.academic_year}</Text>
                        </View>
                        <TouchableOpacity style={styles.concessionButton}>
                            <Text style={styles.concessionText}>Add Concession</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Fee Details Table */}
                    <View style={styles.tableContainer}>
                        <Text style={styles.sectionTitle}>Fee Details</Text>
                        <FlatList
                            data={data.feeSummary}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{item.feeType}</Text>
                                    <Text style={styles.tableCell}>{item.totalAmount}</Text>
                                    <Text style={styles.tableCell}>{item.concession || 0}</Text>
                                    <Text style={styles.tableCell}>{item.dueAmount}</Text>
                                    <Text style={styles.tableCell}>{item.amountPaid}</Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.payButton,
                                            { backgroundColor: item.dueAmount > 0 ? "#2d3e83" : "gray" },
                                        ]}
                                    >
                                        <Text style={styles.payButtonText}>
                                            {item.dueAmount > 0 ? "Pay" : "Paid"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    </View>

                    {/* Amount to Be Paid */}
                    <View style={styles.paymentContainer}>
                        <Text style={styles.sectionTitle}>Amount to be Paid</Text>
                        <View style={styles.paymentRow}>
                            <Text>Amount to Pay: ₹{data.pending_fee || 0}</Text>
                            <TouchableOpacity style={styles.payAmountButton}>
                                <Text style={styles.payAmountText}>Pay Amount</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Payment History */}
                    <View style={styles.paymentHistoryContainer}>
                        <Text style={styles.sectionTitle}>Payment History</Text>
                        <FlatList
                            data={data.feeSummary}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{item.feeType}</Text>
                                    <Text style={styles.tableCell}>₹{item.totalAmount}</Text>
                                    <Text style={styles.tableCell}>
                                        ₹{item.concession || 0}
                                        {item.concession > 0 && (
                                            <TouchableOpacity style={styles.editButton}>
                                                <Text style={styles.editButtonText}>Edit</Text>
                                            </TouchableOpacity>
                                        )}
                                    </Text>
                                    <Text style={styles.tableCell}>₹{item.dueAmount}</Text>
                                    <Text style={styles.tableCell}>₹{item.amountPaid}</Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.payButton,
                                            { backgroundColor: item.dueAmount > 0 ? "#2d3e83" : "gray" },
                                        ]}
                                        disabled={item.dueAmount === 0}
                                    >
                                        <Text style={styles.payButtonText}>
                                            {item.dueAmount > 0 ? "Pay" : "Paid"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />

                    </View>

                    {/* Close Button */}
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
    },
    modalContainer: {
        backgroundColor: "white",
        marginHorizontal: 20,
        borderRadius: 10,
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    concessionButton: {
        backgroundColor: "#2d3e83",
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    concessionText: {
        color: "white",
    },
    tableContainer: {
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    tableCell: {
        flex: 1,
        textAlign: "center",
    },
    payButton: {
        padding: 5,
        borderRadius: 5,
    },
    payButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    paymentContainer: {
        marginBottom: 20,
    },
    paymentRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    payAmountButton: {
        backgroundColor: "#2d3e83",
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    payAmountText: {
        color: "white",
    },
    paymentHistoryContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    invoiceText: {
        color: "#2d3e83",
        fontWeight: "bold",
    },
    closeButton: {
        alignSelf: "center",
        marginTop: 20,
        padding: 10,
        backgroundColor: "#2d3e83",
        borderRadius: 5,
    },
    closeButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    editButton: {
        backgroundColor: "#FFD700",
        marginLeft: 5,
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 5,
    },
    editButtonText: {
        color: "#000",
        fontWeight: "bold",
    },
    payButton: {
        padding: 5,
        borderRadius: 5,
    },
    payButtonText: {
        color: "white",
        fontWeight: "bold",
    },

});

export default FeeDetailsModal;
