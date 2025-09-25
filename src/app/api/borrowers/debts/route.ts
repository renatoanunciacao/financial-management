// /api/borrowers/debts/route.ts

import { prisma } from "@lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      borrowerId,
      cardId,
      totalAmount,
      installments,
      description,
      startDate,
    } = await req.json();

    if (!borrowerId || !totalAmount || !installments || !startDate) {
      return NextResponse.json(
        { message: "Dados incompletos" },
        { status: 400 }
      );
    }

    const installmentValue = totalAmount / installments;
    const start = new Date(startDate);

    const created = [];

    for (let i = 0; i < installments; i++) {
      const dueDate = new Date(start);
      dueDate.setMonth(start.getMonth() + i);

      const installment = await prisma.installmentExpense.create({
        data: {
          monthlyDataId: "TODO", // você vai pegar pelo usuário/mês corrente
          name: description,
          amount: installmentValue,
          dueDate,
          cardId,
        },
      });

      const debt = await prisma.debt.create({
        data: {
          borrowerId,
          installmentId: installment.id,
          amount: installmentValue,
          dueDate,
          cardId,
        },
      });

      created.push({ installment, debt });
    }

    return NextResponse.json(created);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao criar dívida" },
      { status: 500 }
    );
  }
}
