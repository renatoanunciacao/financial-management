'use client';

import React, { useEffect, useState } from 'react';

import { mutate } from 'swr';
import AlertMessage from '../atoms/Alert';
import AddTransactionModal from '../organisms/AddTransactionModal';

export default function QuickActions({ onAddTransaction }: { onAddTransaction: () => void }) {
  const [modalType, setModalType] = useState<'income' | 'expense' | null>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function addTransaction({ description, value, date, type }: { description: string; value: number; date: string; type: 'income' | 'expense' }) {
    setLoading(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, amount: value, type, date }),
      });
      if (!res.ok) throw new Error(`Erro ao adicionar ${type === 'income' ? 'receita' : 'despesa'}`);
      await res.json();
      mutate('/api/transactions');
      onAddTransaction();
      setAlert({ type: "success", message: `${type === 'income' ? 'Receita' : 'Despesa'} adicionada com sucesso!` });
      setModalType(null);
    } catch (error) {
      setAlert({ type: "error", message: `Erro ao adicionar ${type === 'income' ? 'receita' : 'despesa'}` });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <>
      <AlertMessage alert={alert} onClose={() => setAlert(null)} />
      <div className="flex gap-4">
        <button
          onClick={() => setModalType('income')}
          className="flex-1 bg-green-600 text-white rounded-xl px-4 py-2 font-medium hover:bg-green-700 transition"
          
        >
          + Adicionar Receita
        </button>
        <button
          onClick={() => setModalType('expense')}
          className="flex-1 bg-red-600 text-white rounded-xl px-4 py-2 font-medium hover:bg-red-700 transition"
        >
          - Adicionar Despesa
        </button>
      </div>

      <AddTransactionModal isOpen={modalType !== null} onClose={() => setModalType(null)} type={modalType === 'income' ? 'income' : 'expense'} onSubmit={(data) => addTransaction({ ...data, type: modalType! })}>

      </AddTransactionModal>



    </>
  );
}
