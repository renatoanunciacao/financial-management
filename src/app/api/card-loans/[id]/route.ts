// app/api/card-loans/[id]/route.ts
import { prisma } from "@lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
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
      return NextResponse.json(
        { error: "Empréstimo não encontrado" },
        { status: 404 }
      );
    }

    // Formata o loan para o modal
    const formattedLoan = {
      id: loan.id,
      borrowerName: loan.borrowerName,
      amount: loan.amount,
      dueDate: loan.dueDate.toISOString(),
      card: loan.card ? { id: loan.card.id, name: loan.card.name } : null,
      installments: loan.installments.map((inst) => ({
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
    return NextResponse.json(
      { error: "Erro ao buscar empréstimo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Verifica se o empréstimo existe
    const loan = await prisma.debt.findUnique({
      where: { id },
      include: { installments: true },
    });

    if (!loan) {
      return NextResponse.json(
        { message: "Empréstimo não encontrado" },
        { status: 404 }
      );
    }

    // ⚠️ regra de negócio opcional: só pode deletar se todas as parcelas estiverem pagas
    const hasUnpaid = loan.installments.some((inst: any) => !inst.isPaid);
    if (hasUnpaid) {
      return NextResponse.json(
        { message: "Não é possível deletar empréstimo com parcelas em aberto" },
        { status: 400 }
      );
    }

    // Deleta o empréstimo → as parcelas são apagadas em cascade
    await prisma.debt.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Empréstimo removido com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar empréstimo:", error);
    return NextResponse.json(
      { message: "Erro interno ao remover empréstimo" },
      { status: 500 }
    );
  }
}
