'use client';

import { useState } from "react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import Alert from "./Alert"; // seu componente Alert

interface NewLoanModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: LoanFormData) => Promise<void>;
}

interface LoanFormData {
    borrowerName: string;
    totalValue: number;
    installments: number;
    purchaseDate: string;
    card: string;
}

export function NewLoanModal({ open, onClose, onSave }: NewLoanModalProps) {
    const [form, setForm] = useState<LoanFormData>({
        borrowerName: "",
        totalValue: 0,
        installments: 1,
        purchaseDate: "",
        card: "",
    });

    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (field: keyof LoanFormData, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (alert) setAlert(null); // limpa alert ao alterar qualquer campo
    };

    const handleSubmit = async () => {
        if (!form.borrowerName || !form.totalValue || !form.installments || !form.purchaseDate || !form.card) {
            setAlert({ type: "error", message: "Preencha todos os campos." });
            return;
        }

        setLoading(true);
        try {
            await onSave(form);
            setAlert({ type: "success", message: "Empréstimo cadastrado!" });
            setForm({ borrowerName: "", totalValue: 0, installments: 1, purchaseDate: "", card: "" });
            onClose();
        } catch (err) {
            setAlert({ type: "error", message: "Erro ao cadastrar empréstimo." });
        } finally {
            setLoading(false);
        }
    };

    const installmentValue = form.installments > 0 ? (form.totalValue / form.installments).toFixed(2) : "0.00";

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 flex justify-center items-center z-50 bg-black/20"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-semibold mb-4">Novo Empréstimo via Cartão</h2>

                <div className="space-y-4">
                    <div>
                        <label>Nome de quem deve</label>
                        <Input value={form.borrowerName} onChange={(e) => handleChange("borrowerName", e.target.value)} placeholder="Ex: João da Silva" />
                    </div>

                    <div>
                        <label>Valor total da compra</label>
                        <Input type="number" value={form.totalValue} onChange={(e) => handleChange("totalValue", parseFloat(e.target.value))} placeholder="R$ 0,00" />
                    </div>

                    <div>
                        <label>Quantidade de parcelas</label>
                        <Input type="number" value={form.installments} onChange={(e) => handleChange("installments", parseInt(e.target.value))} min={1} />
                        <p className="text-sm text-gray-500 mt-1">Valor de cada parcela: <strong>R$ {installmentValue}</strong></p>
                    </div>

                    <div>
                        <label>Data da compra</label>
                        <Input type="date" value={form.purchaseDate} onChange={(e) => handleChange("purchaseDate", e.target.value)} />
                    </div>

                    <div>
                        <label>Cartão utilizado</label>
                        <Input value={form.card} onChange={(e) => handleChange("card", e.target.value)} placeholder="Ex: Nubank, Itaú..." />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
                </div>

                {alert && <Alert alert={alert} onClose={() => setAlert(null)} />}
            </div>
        </div>
    );
}
