'use client';

import React, { useEffect, useState } from 'react';

interface SummaryCardsProps {
  reloadTrigger: number;
  onSummaryChange: (summary: { incomes: number; expenses: number }) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export default function SummaryCards({ reloadTrigger, onSummaryChange, onLoadingChange }: SummaryCardsProps) {
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);


   async function fetchSummary() {
    try {
      onLoadingChange?.(true);
      const res = await fetch('/api/summary');
      if (!res.ok) throw new Error('Erro ao buscar resumo');

      const data = await res.json();

      setTotalExpense(data.totalExpenses || 0);
      setTotalIncome(data.totalIncomes || 0);
      onSummaryChange({ incomes: data.totalIncomes, expenses: data.totalExpenses });
    } catch (error) {
      console.error(error);
    } finally {
      onLoadingChange?.(false);
    }
  }



  useEffect(() => {
    fetchSummary();
  }, [reloadTrigger, onSummaryChange]);

  const totalBalance = totalIncome - totalExpense;

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-green-100 border border-green-300 shadow rounded-2xl p-4 flex flex-col">
        <span className="text-sm text-green-700 font-semibold">Receitas</span>
        <span className="text-2xl font-bold text-green-800 mt-2">
          R$ {totalIncome.toFixed(2)}
        </span>
      </div>

      <div className="bg-red-100 border border-red-300 shadow rounded-2xl p-4 flex flex-col">
        <span className="text-sm text-red-700 font-semibold">Despesas</span>
        <span className="text-2xl font-bold text-red-800 mt-2">
          R$ {totalExpense.toFixed(2)}
        </span>
      </div>

      <div className="bg-blue-100 border border-blue-300 shadow rounded-2xl p-4 flex flex-col">
        <span className="text-sm text-blue-700 font-semibold">Saldo</span>
        <span className="text-2xl font-bold text-blue-800 mt-2">
          R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </section>
  );
}
