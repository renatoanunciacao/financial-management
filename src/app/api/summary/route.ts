// /app/api/summary/route.ts
import { NextResponse } from "next/server";

import { getServerSession } from "next-auth/next";
import { prisma } from "@lib/prisma";
import { Session } from "next-auth";
import { authOptions } from "@lib/auth";

export async function GET() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  // Pega mês/ano atuais pela data de acesso
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Soma despesas
  const totalExpenses = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      userId: session.user.id,
      type: "expense",
      date: { gte: firstDay, lte: lastDay },
    },
  });

  // Soma receitas
  const totalIncomes = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      userId: session.user.id,
      type: "income",
      date: { gte: firstDay, lte: lastDay },
    },
  });

  return NextResponse.json({
    totalExpenses: totalExpenses._sum.amount || 0,
    totalIncomes: totalIncomes._sum.amount || 0,
    balance: (totalIncomes._sum.amount || 0) - (totalExpenses._sum.amount || 0),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
}
