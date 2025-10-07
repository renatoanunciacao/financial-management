import { prisma } from "@lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const month = searchParams.get("month"); // ex: "2025-07"

  if (!userId || !month) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  try {
    // Busca o MonthlyData
    const monthlyData = await prisma.monthlyData.findFirst({
      where: {
        userId,
        month: new Date(month),
      },
      include: {
        fixedExpenses: true,
        installmentExpenses: true,
        borrowers: true, // sem incluir debts diretamente
      },
    });

    if (!monthlyData) {
      return NextResponse.json({ error: "Dados mensais não encontrados" }, { status: 404 });
    }

    // Busca as dívidas de cada borrower separadamente
    const borrowersWithDebts = await Promise.all(
      monthlyData.borrowers.map(async (borrower) => {
        const debts = await prisma.debt.findMany({
          where: { borrowerName: borrower.name }, // ajuste caso use ID
        });

        return { ...borrower, debts };
      })
    );

    // Retorna os dados com borrowers + debts
    return NextResponse.json({
      ...monthlyData,
      borrowers: borrowersWithDebts,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar dados mensais" }, { status: 500 });
  }
}
