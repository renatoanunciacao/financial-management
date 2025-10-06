'use client'

import dynamic from 'next/dynamic'
import { LoansReportPDF } from './LoansReportPTD'


// ⚡ importação dinâmica do PDFDownloadLink
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false } // <- DESATIVA a renderização no servidor
)

interface DownloadProps {
  debts: any[]
  user: { name?: string | null; email?: string | null }
}

export default function DownloadLoans({ debts, user }: DownloadProps) {
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
  )
}
