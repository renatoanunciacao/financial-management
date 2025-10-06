'use client';

import { useState, useEffect, useMemo, useTransition } from "react";
import { ColumnDef, useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { Button } from "./ui/Button";
import { NewLoanModal } from "./LoanFormData";
import { Pagination } from "./Pagination";
import { LoanDetailModal, LoanDetailModalProps } from "./LoanDetailModal";
import { TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import AlertMessage from "./Alert";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { LoansReportPDF } from "./LoansReportPTD";
import DownloadLoans from "./DownloadLoans";

interface CardLoan {
    id: string;
    borrower: string;
    totalValue: number;
    installments: number;
    purchaseDate: string;
    card: string;
    paidInstallments: number;
}

interface Session {
    user?: {
        id?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    expires: string;
}


export default function CardLoansTable() {
    const [loans, setLoans] = useState<CardLoan[]>([]);
    const [debts, setDebts] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<LoanDetailModalProps['loan']>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [loanToDelete, setLoanToDelete] = useState<CardLoan | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [user, setUser] = useState<Session | null>(null);



    const handleViewLoanDetail = async (loan: CardLoan) => {
        setLoadingDetail(true);
        try {
            const res = await fetch(`/api/card-loans/${loan.id}`);
            const data = await res.json();
            setSelectedLoan(data);
            setDetailModalOpen(true);
        } catch (err) {
            console.error("Erro ao carregar detalhes do empréstimo:", err);
        } finally {
            setLoadingDetail(false);
        }
    };

    useEffect(() => {
        async function fetchLoans() {
            try {
                const res = await fetch("/api/card-loans");
                const data = await res.json();

                const mapped: CardLoan[] = data.map((loan: any) => {
                    const totalInstallments = loan.installments?.[0]?.totalInstallments ?? 1;
                    const paidInstallments = loan.installments
                        ? loan.installments.filter((inst: any) => inst.isPaid).length
                        : 0;

                    return {
                        id: loan.id,
                        borrower: loan.borrowerName,
                        totalValue: loan.amount,
                        installments: totalInstallments,
                        purchaseDate: loan.dueDate,
                        card: loan.card?.name ?? "Sem cartão",
                        paidInstallments,
                    };
                });

                setLoans(mapped);
            } catch (err) {
                console.error("Erro ao carregar empréstimos:", err);
            }
        }
        fetchLoans();
    }, []);

    useEffect(() => {
        async function fetchData() {

            const session = await fetch("/api/auth/session");
            const result = await session.json();
            setUser(result);

            const debtsRes = await fetch("/api/card-loans/active"); // rota para dívidas ativas
            const data = await debtsRes.json();
            const mapped = data.map((debt: any) => ({
                id: debt.id,
                borrowerName: debt.borrowerName,
                amount: debt.amount,
                card: debt.card,
                installments: debt.installments?.filter((i: any) => !i.isPaid) || [],
            }));

            setDebts(mapped);
        }
        fetchData();
    }, []);


    const handleSaveLoan = async (loan: any) => {
        try {
            const res = await fetch("/api/card-loans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loan),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Erro ao salvar empréstimo:", errorText);
                return;
            }

            setModalOpen(false);
            setAlert({ type: 'success', message: 'Empréstimo criado com sucesso' });
            setTimeout(() => setAlert(null), 3000);

            // Atualiza a lista após salvar
            const updatedLoansRaw = await fetch("/api/card-loans").then(res => res.json());
            const updatedLoans = updatedLoansRaw.map((debt: any) => ({
                id: debt.id,
                borrower: debt.borrowerName,
                totalValue: debt.amount,
                installments: debt.installments.length,
                purchaseDate: debt.dueDate,
                card: debt.card?.name ?? "—",
                paidInstallments: debt.installments.filter((i: any) => i.isPaid).length,
            }));

            setLoans(updatedLoans);
        } catch (err) {
            console.error("Erro de rede ao salvar empréstimo:", err);
        }
    };

    const handleDeleteLoan = async () => {
        if (!loanToDelete) return;

        try {
            const res = await fetch(`/api/card-loans/${loanToDelete.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Erro ao deletar empréstimo");


            const result = await res.json();
            // Remove da lista local
            setLoans(prev => prev.filter(l => l.id !== loanToDelete.id));
            setShowDeleteModal(false);
            setLoanToDelete(null);
            setAlert({ type: 'success', message: `${result.message}` });
            setTimeout(() => setAlert(null), 3000);
        } catch (err) {
            console.error("Erro ao deletar empréstimo:", err);
            setAlert({ type: 'error', message: 'Erro ao deletar empréstimo' });

        }
    };



    const columns = useMemo<ColumnDef<CardLoan>[]>(() => [
        { accessorKey: "borrower", header: "Quem deve" },
        { accessorKey: "totalValue", header: "Valor Total", cell: info => `R$ ${info.getValue<number>().toFixed(2)}` },
        { accessorKey: "installments", header: "Parcelas" },
        { accessorKey: "paidInstallments", header: "Parcelas Pagas" },
        { accessorKey: "purchaseDate", header: "Data da Compra", cell: info => new Date(info.getValue<string>()).toLocaleDateString() },
        { accessorKey: "card", header: "Cartão" },
        {
            id: "actions",
            header: "Ações",
            cell: ({ row }) => {
                const loan = row.original;
                const allPaid = loan.installments === loan.paidInstallments;

                return (
                    <div className="flex gap-2">
                        <button
                            className="text-blue-500 hover:underline cursor-pointer"
                            onClick={() => handleViewLoanDetail(loan)}
                        >
                            <EyeIcon className="h-5 w-5" />
                        </button>

                        {allPaid && (
                            <button
                                className="text-red-600 hover:underline cursor-pointer"
                                onClick={() => {
                                    setLoanToDelete(loan);
                                    setShowDeleteModal(true);
                                }}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                );
            },
        },
    ], []);

    const table = useReactTable({
        data: loans,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                {debts && (
                    <DownloadLoans debts={debts} user={{ name: user?.user?.name, email: user?.user?.email }} />
                )}


                <Button onClick={() => setModalOpen(true)}>+ Novo Empréstimo</Button>
            </div>

            {loans.length === 0 ? (
                <p className="text-gray-500 text-center py-20">Nenhum empréstimo encontrado</p>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id} className="border-b border-gray-300 p-3 text-left">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map((row, idx) => (
                                    <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="border-b border-gray-200 p-3">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {table.getRowModel().rows.map(row => (
                            <div key={row.id} className="bg-white shadow rounded-lg p-4 space-y-2">
                                {row.getVisibleCells().map(cell => (
                                    <div key={cell.id} className="flex justify-between">
                                        <span className="font-semibold text-gray-600">{cell.column.columnDef.header as string}</span>
                                        <span>{flexRender(cell.column.columnDef.cell, cell.getContext())}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Paginação */}
                    <Pagination table={table} />
                </>
            )}

            <NewLoanModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveLoan} />

            {loadingDetail && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                        <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <p>Carregando detalhes...</p>
                    </div>
                </div>
            )}

            <LoanDetailModal
                open={detailModalOpen && !loadingDetail}
                onClose={() => setDetailModalOpen(false)}
                loan={selectedLoan}
                onUpdateLoan={(updatedLoan: any) => {
                    setLoans(prevLoans =>
                        prevLoans.map(l =>
                            l.id === updatedLoan.id
                                ? { ...l, paidInstallments: updatedLoan.installments.filter((i: any) => i.isPaid).length }
                                : l
                        )
                    );
                    setSelectedLoan(updatedLoan);
                }}
            />

            {alert && (
                <AlertMessage
                    alert={alert}
                    onClose={() => setAlert(null)}
                />
            )}

            {/* Modal centralizado para deletar */}
            {showDeleteModal && loanToDelete && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 p-4">
                    <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-sm sm:max-w-md text-center space-y-4">
                        <p>Tem certeza que deseja deletar o empréstimo de <strong>{loanToDelete.borrower}</strong>?</p>
                        <div className="flex justify-center gap-4 flex-wrap">
                            <Button
                                onClick={handleDeleteLoan}
                                className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                            >
                                Deletar
                            </Button>
                            <Button
                                onClick={() => setShowDeleteModal(false)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-full sm:w-auto"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
