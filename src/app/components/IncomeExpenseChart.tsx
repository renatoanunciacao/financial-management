import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface IncomeExpenseChartProps {
    income: number;
    expense: number;
}

export default function IncomeExpenseChart({ income, expense }: IncomeExpenseChartProps) {

    const data = [
        { name: 'Receitas', valor: income },
        { name: 'Despesas', valor: expense },
    ];

    const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);

    return (
        <div style={{ width: '100%', height: 250 }}>
              <h3 className="text-lg font-semibold mb-4">Resumo Financeiro do Mês</h3>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) =>formatCurrency(value)} />
          <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.name === 'Receitas' ? '#22c55e' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

        </div>
    )

}