'use client';

import CardLoansTable from '@app/components/CardLoansTable';
import Header from '@app/components/Header';
import React from 'react';


export default function LoansPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Header />
            <div className="p-6">
                {/* Tabela de empréstimos */}
                <CardLoansTable />
            </div>

        </div>

    );
}
