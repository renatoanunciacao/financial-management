'use client';

import React from 'react';
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
  const { data: transactions = [], isLoading, mutate } = useSWR<Transaction[]>('/api/transactions', fetcher);

  return (
    <section className="bg-white shadow rounded-2xl p-4">
      <h2 className="text-lg font-semibold mb-4">Últimas movimentações</h2>

      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <div className="max-h-64 overflow-y-auto">
          <ul className="divide-y divide-gray-200">
            {transactions.map((tx) => (
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
