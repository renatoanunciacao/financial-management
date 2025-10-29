'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { LoansReportPDF } from '../organisms/LoansReportPDF';


interface Props {
  debts: any[];
  user: { name?: string | null; email?: string | null };
}

export default function LoansPDFLink({ debts, user }: Props) {
  return (
    <PDFDownloadLink
      document={<LoansReportPDF debts={debts} user={user} />}
      fileName="emprestimos.pdf"
      style={{
        backgroundColor: '#2563EB',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: 6,
        fontWeight: 500,
        textDecoration: 'none',
      }}
    >
      {({ loading }) => (loading ? 'Gerando PDF…' : '📄 Baixar PDF')}
    </PDFDownloadLink>
  );
}
