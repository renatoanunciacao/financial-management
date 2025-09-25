'use client';

import React, { useState, useEffect } from 'react';
import Alert from './Alert';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  onSubmit: (data: { description: string; value: number; date: string }) => Promise<void>;
}

export default function AddTransactionModal({ isOpen, onClose, type, onSubmit }: AddTransactionModalProps) {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!description || !value || !date) {
      setAlert({ type: "error", message: "Preencha todos os campos." });
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        description,
        value: parseFloat(value),
        date,
      });

      setAlert({ type: "success", message: 'Transação cadastrada!' });

      setDescription('');
      setValue('');
      setDate('');

      onClose();

    } catch (err) {
      setAlert({ type: "error", message: "Erro ao cadastrar transação" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 bg-black/20"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">
          {type === 'income' ? 'Adicionar Receita' : 'Adicionar Despesa'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-gray-700 mb-1">Descrição</label>
            <input
              id="description"
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={description}
              onChange={e => {
                setDescription(e.target.value);
                if (alert) setAlert(null);
              }}
              placeholder="Descrição"
            />
          </div>

          <div>
            <label htmlFor="value" className="block text-gray-700 mb-1">Valor (R$)</label>
            <input
              id="value"
              type="number"
              step="0.01"
              min="0"
              className="w-full border rounded-lg px-3 py-2"
              value={value}
              onChange={e => {
                setValue(e.target.value);
                if (alert) setAlert(null);
              }}
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-gray-700 mb-1">Data</label>
            <input
              id="date"
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={date}
              onChange={e => {
                setDate(e.target.value);
                if (alert) setAlert(null);
              }}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white hover:bg-green-700 ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600'
                }`}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>

        {alert && (
          <Alert
            alert={alert}
            onClose={() => setAlert(null)}
          />
        )}
      </div>
    </div>
  );
}
