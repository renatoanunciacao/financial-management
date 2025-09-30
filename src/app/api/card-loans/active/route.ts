import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

// GET /api/card-loans/active
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Busca todas as dívidas ativas do usuário logado
    const activeDebts = await prisma.debt.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { isPaid: false },
          {
            installments: {
              some: { isPaid: false },
            },
          },
        ],
      },
      include: {
        card: true,
        installments: {
          orderBy: { installmentNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filtra apenas parcelas não pagas
    const debtsWithUnpaidInstallments = activeDebts.map((debt) => ({
      ...debt,
      installments: debt.installments.filter((inst) => !inst.isPaid),
    }));

    return NextResponse.json(debtsWithUnpaidInstallments);
  } catch (error: any) {
    console.error("Erro ao buscar dívidas ativas:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar dívidas ativas" },
      { status: 500 }
    );
  }
}
