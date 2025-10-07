'use client';

import dynamic from 'next/dynamic';

// Componente do PDF (não precisa ssr)
const LoansPDFLink = dynamic(() => import('./LoansPDFLink'), { ssr: false });

// Props
interface DownloadProps {
  debts: any[];
  user: { name?: string | null; email?: string | null };
}

// Componente principal de download
export default function DownloadLoansPDF({ debts, user }: DownloadProps) {
  return <LoansPDFLink debts={debts} user={user} />;
}
