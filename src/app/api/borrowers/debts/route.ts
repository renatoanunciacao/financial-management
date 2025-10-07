// /api/borrowers/debts/route.ts
import { prisma } from "@lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { borrowerName, borrowerCellphone, cardId, totalAmount, installments, description, startDate, userId } =
      await req.json();

    if (!borrowerName || !totalAmount || !installments || !startDate || !userId || !cardId) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 });
    }

    const start = new Date(startDate);
    const installmentValue = totalAmount / installments;

    const createdDebts = [];

    for (let i = 0; i < installments; i++) {
      // Calcula a data de vencimento de cada parcela
      const dueDate = new Date(start);
      dueDate.setMonth(start.getMonth() + i);

      // Primeiro dia do mês para o MonthlyData
      const monthDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), 1);

      // Busca ou cria o MonthlyData do usuário
      let monthlyData = await prisma.monthlyData.findFirst({
        where: { month: monthDate, userId },
      });

     if (!monthlyData) {
  monthlyData = await prisma.monthlyData.create({
    data: {
      month: monthDate,
      plannedIncome: 0, // ou outro valor default
      user: { connect: { id: userId } }, // conectando ao usuário
    },
  });
}

      // Cria a parcela
      const installment = await prisma.installmentExpense.create({
        data: {
          monthlyDataId: monthlyData.id,
          name: description,
          amount: installmentValue,
          dueDate,
          cardId,
          installmentNumber: i + 1,
          totalInstallments: installments,
        },
      });

      // Cria a dívida vinculada à parcela
      const debt = await prisma.debt.create({
        data: {
          borrowerName,
          borrowerCellphone,
          amount: installmentValue,
          dueDate,
          cardId,
          userId,
          installments: {
            connect: { id: installment.id },
          },
        },
      });

      createdDebts.push({ installment, debt });
    }

    return NextResponse.json(createdDebts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erro ao criar dívida" }, { status: 500 });
  }
}
