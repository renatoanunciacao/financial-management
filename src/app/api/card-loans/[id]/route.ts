// src/app/api/card-loans/[id]/route.ts
import { prisma } from "@lib/prisma";
import { NextResponse } from "next/server";

// GET /api/card-loans/:id
export async function GET(
  req: Request,
  context:  { params: Promise<{ id: string }> }

) {
  try {
    const { id } = await context.params;

    const loan = await prisma.debt.findUnique({
      where: { id },
      include: {
        card: true,
        installments: true,
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Empréstimo não encontrado" }, { status: 404 });
    }

    const formattedLoan = {
      id: loan.id,
      borrowerName: loan.borrowerName,
      amount: loan.amount,
      dueDate: loan.dueDate.toISOString(),
      card: loan.card ? { id: loan.card.id, name: loan.card.name } : null,
      installments: loan.installments.map(inst => ({
        id: inst.id,
        name: inst.name,
        amount: inst.amount,
        dueDate: inst.dueDate.toISOString(),
        isPaid: inst.isPaid,
        installmentNumber: inst.installmentNumber,
        totalInstallments: inst.totalInstallments,
      })),
    };

    return NextResponse.json(formattedLoan);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar empréstimo" }, { status: 500 });
  }
}

// DELETE /api/card-loans/:id
export async function DELETE(

  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const loan = await prisma.debt.findUnique({
      where: { id },
      include: { installments: true },
    });

    if (!loan) {
      return NextResponse.json({ message: "Empréstimo não encontrado" }, { status: 404 });
    }

    const hasUnpaid = loan.installments.some(inst => !inst.isPaid);
    if (hasUnpaid) {
      return NextResponse.json(
        { message: "Não é possível deletar empréstimo com parcelas em aberto" },
        { status: 400 }
      );
    }

    await prisma.debt.delete({ where: { id } });

    return NextResponse.json({ message: "Empréstimo removido com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar empréstimo:", error);
    return NextResponse.json(
      { message: "Erro interno ao remover empréstimo" },
      { status: 500 }
    );
  }
}
