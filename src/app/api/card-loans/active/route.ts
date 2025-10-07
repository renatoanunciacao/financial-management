import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { getServerSession } from "next-auth/next";

import { Session } from "next-auth"; // importa a tipagem extendida
import { authOptions } from "@lib/auth";


export async function GET() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const activeDebts = await prisma.debt.findMany({
    where: {
      userId: session.user.id,
      OR: [
        { isPaid: false },
        { installments: { some: { isPaid: false } } }
      ],
    },
    include: {
      card: true,
      installments: { orderBy: { installmentNumber: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const debtsWithUnpaidInstallments = activeDebts.map((debt) => ({
    ...debt,
    installments: debt.installments.filter((inst) => !inst.isPaid),
  }));

  return NextResponse.json(debtsWithUnpaidInstallments);
}
