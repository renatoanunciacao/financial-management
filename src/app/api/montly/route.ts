import { prisma } from "@lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const month = searchParams.get("month"); // ex: "2025-07"

  if (!userId || !month) {
    return NextResponse.json(
      { error: "Parâmetros inválidos" },
      { status: 400 }
    );
  }

  const monthlyData = await prisma.monthlyData.findFirst({
    where: {
      userId,
      month: new Date(month),
    },
    include: {
      fixedExpenses: true,
      installmentExpenses: true,
      borrowers: {
        include: { debts: true },
      },
    },
  });

  return NextResponse.json(monthlyData);
}
