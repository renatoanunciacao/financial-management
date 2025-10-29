'use client';

import { useState } from "react";
import { Button } from "../atoms/Button";
import AlertMessage from "../atoms/Alert";

interface Installment {
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    isPaid: boolean;
    installmentNumber: number;
    totalInstallments: number;
}

export interface LoanDetailModalProps {
    open: boolean;
    onClose: () => void;
    loan: {
        id: string;
        borrowerName: string;
        amount: number;
        dueDate: string;
        card: { id: string; name: string };
        installments: Installment[];
    } | null;
    onUpdateLoan?: (updatedLoan: LoanDetailModalProps['loan']) => void;
}

export function LoanDetailModal({ open, onClose, loan, onUpdateLoan }: LoanDetailModalProps) {
    if (!open || !loan) return null;

    const [currentLoan, setCurrentLoan] = useState(loan);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const totalPaid = currentLoan.installments
        .filter(inst => inst.isPaid)
        .reduce((acc, curr) => acc + curr.amount, 0);
    const totalPending = currentLoan.amount - totalPaid;

    async function handleMarkAsPaid(installmentId: string) {
        try {
            const res = await fetch(`/api/installments/${installmentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPaid: true }),
            });

            if (!res.ok) throw new Error("Erro ao atualizar parcela");

            const updated = await res.json();

            const updatedLoan = {
                ...currentLoan,
                installments: currentLoan.installments.map(inst =>
                    inst.id === updated.id ? { ...inst, isPaid: true } : inst
                ),
            };

            setCurrentLoan(updatedLoan);
            onUpdateLoan?.(updatedLoan);

            setAlert({ type: "success", message: `${updated.name} paga com sucesso! ✅` });
            setTimeout(() => setAlert(null), 3000);

        } catch (err) {
            console.error(err);
            setAlert({ type: "error", message: "Erro ao pagar a parcela ❌" });
            setTimeout(() => setAlert(null), 3000);
        }
    }

    // Dentro do seu componente LoanDetailModal, logo após handleMarkAsPaid
    async function handlePayAll() {
        try {
            // Filtra apenas parcelas em aberto
            const unpaidInstallments = currentLoan.installments.filter(inst => !inst.isPaid);

            if (unpaidInstallments.length === 0) {
                setAlert({ type: "success", message: "Todas as parcelas já estão pagas! ✅" });
                setTimeout(() => setAlert(null), 3000);
                return;
            }

            // Faz patch para cada parcela
            const promises = unpaidInstallments.map(inst =>
                fetch(`/api/installments/${inst.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isPaid: true }),
                }).then(res => {
                    if (!res.ok) throw new Error(`Erro ao atualizar parcela ${inst.name}`);
                    return res.json();
                })
            );

            const updatedInstallments = await Promise.all(promises);

            // Atualiza o estado
            const updatedLoan = {
                ...currentLoan,
                installments: currentLoan.installments.map(inst =>
                    updatedInstallments.find(u => u.id === inst.id) ? { ...inst, isPaid: true } : inst
                ),
            };

            setCurrentLoan(updatedLoan);
            onUpdateLoan?.(updatedLoan);

            setAlert({ type: "success", message: "Todas as parcelas foram pagas com sucesso! ✅" });
            setTimeout(() => setAlert(null), 3000);
        } catch (err) {
            console.error(err);
            setAlert({ type: "error", message: "Erro ao pagar todas as parcelas ❌" });
            setTimeout(() => setAlert(null), 3000);
        }
    }


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
                        Empréstimo - {loan.borrowerName}
                    </h2>
                    <div className="flex gap-2">
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-xl shadow flex-shrink-0 text-sm sm:text-base"
                            onClick={handlePayAll}
                        >
                            Pagar Todas
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-xl shadow flex-shrink-0 text-sm sm:text-base"
                            onClick={onClose}
                        >
                            Fechar
                        </Button>
                    </div>
                </div>

                {/* Conteúdo rolável */}
                <div className="p-4 sm:p-6 space-y-4 flex-1">
                    {/* Resumo */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 flex flex-col justify-between border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-300">
                            <p className="text-gray-400 uppercase text-xs sm:text-sm tracking-wider">Valor Total</p>
                            <p className="text-gray-800 font-bold text-base sm:text-lg mt-1 sm:mt-2">R$ {loan.amount.toFixed(2)}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 flex flex-col justify-between border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-300">
                            <p className="text-gray-400 uppercase text-xs sm:text-sm tracking-wider">Total Pago</p>
                            <p className="text-green-600 font-bold text-base sm:text-lg mt-1 sm:mt-2">R$ {totalPaid.toFixed(2)}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 flex flex-col justify-between border-l-4 border-red-500 hover:shadow-lg transition-shadow duration-300">
                            <p className="text-gray-400 uppercase text-xs sm:text-sm tracking-wider">Total Pendente</p>
                            <p className="text-red-600 font-bold text-base sm:text-lg mt-1 sm:mt-2">R$ {totalPending.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left table-auto border-collapse rounded-lg overflow-hidden min-w-[500px]">
                            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white uppercase text-sm tracking-wider">
                                <tr>
                                    <th className="px-3 sm:px-4 py-2 rounded-tl-lg">#</th>
                                    <th className="px-3 sm:px-4 py-2">Nome</th>
                                    <th className="px-3 sm:px-4 py-2">Valor</th>
                                    <th className="px-3 sm:px-4 py-2">Vencimento</th>
                                    <th className="px-3 sm:px-4 py-2">Status</th>
                                    <th className="px-3 sm:px-4 py-2 rounded-r-lg">Realizar Pagamento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentLoan.installments.map((inst, idx) => (
                                    <tr key={inst.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                                        <td className="px-3 sm:px-4 py-2 border-b border-gray-200">{inst.installmentNumber}</td>
                                        <td className="px-3 sm:px-4 py-2 border-b border-gray-200">{inst.name}</td>
                                        <td className="px-3 sm:px-4 py-2 border-b border-gray-200">R$ {inst.amount.toFixed(2)}</td>
                                        <td className="px-3 sm:px-4 py-2 border-b border-gray-200">{new Date(inst.dueDate).toLocaleDateString()}</td>
                                        <td className={`px-3 sm:px-4 py-2 border-b border-gray-200 font-semibold ${inst.isPaid ? 'text-green-700' : 'text-red-700'}`}>
                                            {inst.isPaid ? 'Pago' : 'Em aberto'}
                                        </td>
                                        <td className="px-3 sm:px-4 py-2 border-b border-gray-200 text-center">
                                            {inst.isPaid ? (
                                                <span className="text-green-600 font-bold">✔</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleMarkAsPaid(inst.id)}
                                                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
                                                >
                                                    Marcar como Pago
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {currentLoan.installments.map(inst => (
                            <div
                                key={inst.id}
                                className="bg-white shadow rounded-xl p-4 space-y-2 border-l-4 hover:shadow-lg transition-shadow duration-300"
                                style={{ borderColor: inst.isPaid ? '#16a34a' : '#dc2626' }}
                            >
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">#</span>
                                    <span>{inst.installmentNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Nome</span>
                                    <span>{inst.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Valor</span>
                                    <span>R$ {inst.amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Vencimento</span>
                                    <span>{new Date(inst.dueDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Status</span>
                                    <span className={inst.isPaid ? "text-green-700 font-bold" : "text-red-700 font-bold"}>
                                        {inst.isPaid ? "Pago" : "Em aberto"}
                                    </span>
                                </div>
                                {!inst.isPaid && (
                                    <div className="text-center">
                                        <button
                                            onClick={() => handleMarkAsPaid(inst.id)}
                                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
                                        >
                                            Marcar como Pago
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {alert && (
                    <AlertMessage
                        alert={alert}
                        onClose={() => setAlert(null)}
                    />
                )}
            </div>
        </div>
    );
}
