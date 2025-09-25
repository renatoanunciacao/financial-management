import { prisma } from "@lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "pages/api/auth/[...nextauth]";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }
    const body = await req.json();

    const { userId, type, amount, description, categoryId, date } = body;

    if (!description || !amount || !type || !date) {
      return NextResponse.json(
        { message: "Dados incompletos" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type,
        amount,
        description,
        date: new Date(date),
        categoryId,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return NextResponse.json(
      { message: "Erro ao criar transação" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao buscar as transações" },
      { status: 500 }
    );
  }
}
