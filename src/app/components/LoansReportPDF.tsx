'use client';

import React from "react";
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
} from "@react-pdf/renderer";

// Estilos do PDF
const styles = StyleSheet.create({
    page: {
        padding: 25,
        fontFamily: "Helvetica",
        backgroundColor: "#ffffff",
        fontSize: 10,
    },
    header: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: "#667eea",
        borderRadius: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 11,
        color: "#ffffff",
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        gap: 10,
    },
    statCard: {
        flex: 1,
        padding: 10,
        backgroundColor: "#f0f4ff",
        borderRadius: 6,
        textAlign: "center",
    },
    statValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#667eea",
        marginBottom: 3,
    },
    statLabel: {
        fontSize: 9,
        color: "#666666",
    },
    debtCard: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: "#f8f9fa",
        borderLeftWidth: 4,
        borderLeftColor: "#667eea",
        borderRadius: 6,
    },
    debtHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    borrowerInfo: {
        flex: 1,
    },
    borrowerName: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#333333",
        marginBottom: 4,
    },
    cardBadge: {
        fontSize: 9,
        color: "#ffffff",
        backgroundColor: "#667eea",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        alignSelf: "flex-start",
        overflow: "hidden",
        textAlign: "center",
    },
    debtTotalSection: {
        alignItems: "flex-end",
    },
    debtTotalLabel: {
        fontSize: 9,
        color: "#666666",
        marginBottom: 2,
    },
    debtTotalAmount: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#e74c3c",
    },
    table: {
        marginTop: 8,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#667eea",
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    tableHeaderCell: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 9,
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    tableRowHighlight: {
        flexDirection: "row",
        paddingVertical: 6,
        paddingHorizontal: 8,
        backgroundColor: "#fef3c7",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    tableCell: {
        fontSize: 9,
        color: "#333333",
    },
    col1: { width: "20%" },
    col2: { width: "25%" },
    col3: { width: "30%" },
    col4: { width: "25%" },
    statusBadge: {
        fontSize: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        textAlign: "center",
    },
    statusPending: {
        backgroundColor: "#fee2e2",
        color: "#dc2626",
    },
    statusPaid: {
        backgroundColor: "#d1fae5",
        color: "#059669",
    },
    subtotalRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 5,
    },
    subtotalText: {
        fontSize: 10,
        fontWeight: "bold",
    },
    totalSection: {
        marginTop: 20,
        padding: 20,
        backgroundColor: "#667eea",
        borderRadius: 8,
    },
    totalGrid: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    totalItem: {
        alignItems: "center",
    },
    totalLabel: {
        fontSize: 11,
        color: "#ffffff",
        marginBottom: 5,
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#ffffff",
    },
    footer: {
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        fontSize: 8,
        color: "#999999",
        textAlign: "center",
    },
});

interface Installment {
    name?: string;
    amount?: number;
    dueDate?: string;
    isPaid?: boolean;
    installmentNumber?: number;
    totalInstallments?: number;
}

interface Card {
    name?: string;
    id?: string;
    userId?: string;
}

interface Debt {
    id?: string;
    borrowerName?: string;
    amount?: number;
    dueDate?: string;
    isPaid?: boolean;
    card?: Card;
    installments?: Installment[];
}

interface LoansReportPDFProps {
    debts?: Debt[];
    user?: { name?: string | null; email?: string | null };
}

export const LoansReportPDF: React.FC<LoansReportPDFProps> = ({
    debts = [],
    user = {},
}) => {

    const formatCurrency = (value?: number) =>
        `R$ ${((value ?? 0).toFixed(2)).replace(".", ",")}`;

    const formatDate = (dateString?: string) =>
        dateString ? new Date(dateString).toLocaleDateString("pt-BR") : "-";

    const isOctober2025 = (dateString?: string) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        return date.getMonth() === 9 && date.getFullYear() === 2025;
    };

    const stats = debts.reduce(
        (acc, debt) => {
            const pendingInstallments = debt.installments?.filter(
                (i) => !i.isPaid
            ) || [];
            pendingInstallments.forEach((inst) => {
                acc.totalGeneral += inst.amount ?? 0;
                acc.totalInstallments += 1;
                if (isOctober2025(inst.dueDate)) {
                    acc.totalOctober += inst.amount ?? 0;
                }
            });
            acc.totalDebts += 1;
            return acc;
        },
        {
            totalOctober: 0,
            totalGeneral: 0,
            totalDebts: 0,
            totalInstallments: 0,
        }
    );

    const generatedDate = new Date().toLocaleString("pt-BR");

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Relatório de Empréstimos</Text>
                    <Text style={styles.headerSubtitle}>
                        Usuário: {user.name || "Não informado"}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        Email: {user.email || "Não informado"}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        Data: {generatedDate}
                    </Text>
                </View>

                {/* Estatísticas */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.totalDebts}</Text>
                        <Text style={styles.statLabel}>Total de Dívidas</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.totalInstallments}</Text>
                        <Text style={styles.statLabel}>Parcelas Pendentes</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {formatCurrency(stats.totalOctober)}
                        </Text>
                        <Text style={styles.statLabel}>Outubro/2025</Text>
                    </View>
                </View>

                {/* Lista de Dívidas */}
                {debts.map((debt, idx) => {
                    const pendingInstallments =
                        debt.installments?.filter((i) => !i.isPaid) || [];

                    const subtotal = pendingInstallments.reduce(
                        (sum, inst) => sum + (inst.amount ?? 0),
                        0
                    );

                    return (
                        <View key={debt.id || idx} style={styles.debtCard}>
                            <View style={styles.debtHeader}>
                                <View style={styles.borrowerInfo}>
                                    <Text style={styles.borrowerName}>
                                        {debt.borrowerName || "Nome não informado"}
                                    </Text>
                                    <Text style={styles.cardBadge}>
                                        {debt.card?.name || "Sem cartão"}
                                    </Text>
                                </View>
                                <View style={styles.debtTotalSection}>
                                    <Text style={styles.debtTotalLabel}>
                                        Valor Total da Dívida
                                    </Text>
                                    <Text style={styles.debtTotalAmount}>
                                        {formatCurrency(debt.amount ?? 0)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.table}>
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.tableHeaderCell, styles.col1]}>Parcela</Text>
                                    <Text style={[styles.tableHeaderCell, styles.col2]}>Valor</Text>
                                    <Text style={[styles.tableHeaderCell, styles.col3]}>Vencimento</Text>
                                    <Text style={[styles.tableHeaderCell, styles.col4]}>Status</Text>
                                </View>

                                {pendingInstallments.map((inst, i) => {
                                    const isOct = isOctober2025(inst.dueDate);
                                    const rowStyle = isOct
                                        ? styles.tableRowHighlight
                                        : styles.tableRow;

                                    return (
                                        <View key={i} style={rowStyle}>
                                            <Text style={[styles.tableCell, styles.col1]}>
                                                {inst.installmentNumber ?? i + 1}/{inst.totalInstallments ?? pendingInstallments.length}
                                            </Text>
                                            <Text style={[styles.tableCell, styles.col2]}>
                                                {formatCurrency(inst.amount)}
                                            </Text>
                                            <Text style={[styles.tableCell, styles.col3]}>
                                                {formatDate(inst.dueDate)}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.tableCell,
                                                    styles.col4,
                                                    styles.statusBadge,
                                                    inst.isPaid ? styles.statusPaid : styles.statusPending,
                                                ]}
                                            >
                                                {inst.isPaid ? "Pago" : "Pendente"}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Subtotal por dívida */}
                            <View style={styles.subtotalRow}>
                                <Text style={styles.subtotalText}>
                                    Subtotal: {formatCurrency(subtotal)}
                                </Text>
                            </View>
                        </View>
                    );
                })}

                {/* Totais */}
                <View style={styles.totalSection}>
                    <View style={styles.totalGrid}>
                        <View style={styles.totalItem}>
                            <Text style={styles.totalLabel}>Total de Outubro/2025</Text>
                            <Text style={styles.totalAmount}>
                                {formatCurrency(stats.totalOctober)}
                            </Text>
                        </View>
                        <View style={styles.totalItem}>
                            <Text style={styles.totalLabel}>Total Geral Pendente</Text>
                            <Text style={styles.totalAmount}>
                                {formatCurrency(stats.totalGeneral)}
                            </Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.footer}>
                    Documento gerado automaticamente em {generatedDate}
                </Text>
            </Page>
        </Document>
    );
};
