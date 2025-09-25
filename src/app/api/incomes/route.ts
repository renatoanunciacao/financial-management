import { prisma } from "@lib/prisma";
import { getServerSession } from "next-auth";
import { tryLoadManifestWithRetries } from "next/dist/server/load-components";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "pages/api/auth/[...nextauth]";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userEmail = session.user.email;
    const data = await req.json();

    const { description, value, date } = data;

    // Validação básica dos dados
    if (
      typeof description !== 'string' ||
      typeof date !== 'string' ||
      (typeof value !== 'number' && typeof value !== 'string')
    ) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Converte value para número se vier como string
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    if (isNaN(numericValue)) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 });
    }

    // Buscar o usuário
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Extrair o mês, garantindo formato correto
    if (date.length < 7) {
      return NextResponse.json({ error: 'Data inválida' }, { status: 400 });
    }
    const month = date.slice(0, 7); // 'YYYY-MM'

    // Buscar ou criar monthlyData
    let monthlyData = await prisma.monthlyData.findFirst({
      where: {
        userId: user.id,
        month,
      },
    });

    if (!monthlyData) {
      monthlyData = await prisma.monthlyData.create({
        data: {
          userId: user.id,
          month,
          plannedIncome: 0,
        },
      });
    }

    // Atualizar income acumulado
    const newIncomeValue = monthlyData.plannedIncome + numericValue;

    monthlyData = await prisma.monthlyData.update({
      where: { id: monthlyData.id },
      data: { plannedIncome: newIncomeValue },
    });

    return NextResponse.json({ message: 'Receita adicionada', monthlyData });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        const result = await prisma.transaction.aggregate({
            where: {
                userId: session.user.id,
                type: 'income'
            },
            _sum: {
                amount: true,
            },
        });

        const totalIncomes = result._sum.amount ?? 0;
        return NextResponse.json({ totalIncomes });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}