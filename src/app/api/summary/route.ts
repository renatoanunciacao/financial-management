// /api/summary/route.ts

import { prisma } from '@lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const month = Number(url.searchParams.get('month'));
  const year = Number(url.searchParams.get('year'));

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const incomes = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { type: 'income', date: { gte: start, lte: end } },
  });

  const expenses = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { type: 'expense', date: { gte: start, lte: end } },
  });

  return NextResponse.json({
    totalIncomes: incomes._sum.amount || 0,
    totalExpenses: expenses._sum.amount || 0,
  });
}
