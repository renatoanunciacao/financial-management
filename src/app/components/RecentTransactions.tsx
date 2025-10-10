'use client';

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function RecentTransactions() {
  const { data: transactions = [], isLoading } = useSWR<Transaction[]>('/api/transactions', fetcher);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Lista de meses disponíveis a partir das transações
  const months = useMemo(() => {
    const uniqueMonths = Array.from(
      new Set(
        transactions.map(tx => {
          const date = new Date(tx.date);
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 para mês correto
          return `${year}-${month}`;
        })
      )
    );
    // Ordena do mais recente para o mais antigo
    return uniqueMonths.sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  // Filtra as transações pelo mês selecionado
  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'all') return transactions;
    return transactions.filter(tx => new Date(tx.date).toISOString().slice(0, 7) === selectedMonth);
  }, [transactions, selectedMonth]);

  return (
    <section className="bg-white shadow rounded-2xl p-4">
      <h2 className="text-lg font-semibold mb-4">Últimas movimentações</h2>

      {/* Filtro de mês */}

      <div className="mb-6 flex items-center gap-3">
        <label className="font-medium text-gray-700">Filtrar por mês:</label>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="all">Todos</option>
          {months.map(month => {
            const [year, monthNumber] = month.split('-').map(Number); // separa ano e mês
            return (
              <option key={month} value={month}>
                {new Date(year, monthNumber - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </option>
            );
          })}
        </select>

      </div>

      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <div className="max-h-64 overflow-y-auto">
          <ul className="divide-y divide-gray-200">
            {filteredTransactions.map((tx) => (
              <li key={tx.id} className="py-2 flex justify-between items-center">
                <div>
                  <p className="text-gray-800">{tx.description}</p>
                  <p className="text-gray-500 text-sm">{new Date(tx.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <span
                  className={`font-medium ${tx.type === 'income' ? 'text-green-700' : 'text-red-700'}`}
                >
                  {tx.type === 'expense' ? '-' : '+'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
