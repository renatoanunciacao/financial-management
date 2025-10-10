'use client';

import React, { useEffect, useState } from 'react';

interface SummaryCardsProps {
  reloadTrigger: number;
  onSummaryChange: (summary: { incomes: number; expenses: number }) => void;
  onLoadingChange?: (loading: boolean) => void;
}

interface MonthOption {
  year: number;
  month: number;
}

export default function SummaryCards({ reloadTrigger, onSummaryChange, onLoadingChange }: SummaryCardsProps) {
  const [monthsAvailable, setMonthsAvailable] = useState<MonthOption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);

  async function fetchMonths() {
    const res = await fetch("/api/summary/months");
    if (res.ok) {
      const data: MonthOption[] = await res.json();
      setMonthsAvailable(data);
      if (data.length > 0) {
        setSelectedMonth(data[0].month);
        setSelectedYear(data[0].year);
      }
    }
  }

  async function fetchSummary() {
    try {
      onLoadingChange?.(true);
      const res = await fetch(`/api/summary?month=${selectedMonth}&year=${selectedYear}`);
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
    fetchMonths();
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [reloadTrigger, selectedMonth, selectedYear]);

  const totalBalance = totalIncome - totalExpense;

  return (
    <section className="flex flex-col gap-4">
      {/* Filtro de Mês/Ano */}
      <div className="flex gap-2 items-center justify-end">
        <label className="font-medium text-gray-700">Filtrar por mês:</label>
        <select
          value={`${selectedYear}-${selectedMonth}`}
          onChange={(e) => {
            const [year, month] = e.target.value.split("-").map(Number);
            setSelectedYear(year);
            setSelectedMonth(month);
          }}
          className="border rounded-lg p-2"
        >
          {monthsAvailable.map(({ month, year }) => (
            <option key={`${year}-${month}`} value={`${year}-${month}`}>
              {new Date(year, month - 1).toLocaleString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </option>
          ))}
        </select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>
    </section>
  );
}
