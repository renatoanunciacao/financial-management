'use client';

import DashboardHeader from '@app/components/DashboardHeader';
import IncomeExpenseChart from '@app/components/IncomeExpenseChart';
import QuickActions from '@app/components/QuickActions';
import RecentTransactions from '@app/components/RecentTransactions';
import SummaryCards from '@app/components/SummaryCards';
import { LoadingBubbles } from '@app/components/ui/LoadingBubles';
import Header from '@components/Header';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [summary, setSummary] = useState<{ incomes: number; expenses: number }>({ incomes: 0, expenses: 0 });


  useEffect(() => {
    if (status === "unauthenticated") {
       router.push('/login');
    }
  }, [status, router]);

 if (status === "loading") {
  return <LoadingBubbles />;
}


const handleAddTransaction = () => {
    setReloadTrigger((prev: any) => prev + 1);
  }

  return (
  <div className="min-h-screen flex flex-col bg-gray-100">
  <Header />

  <main className="flex flex-col p-6 space-y-6">
      <DashboardHeader />

     <SummaryCards reloadTrigger={reloadTrigger} onSummaryChange={setSummary}/>

     <QuickActions onAddTransaction={handleAddTransaction} />
     
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gráfico */}
        <div className="bg-white shadow rounded-2xl p-4 min-h-[300px] flex items-center justify-center">
          <IncomeExpenseChart income={summary.incomes} expense={summary.expenses} />
        </div>

        

        {/* Últimas movimentações */}
         <RecentTransactions  />
      </section>
    </main>
</div>

  );
}
