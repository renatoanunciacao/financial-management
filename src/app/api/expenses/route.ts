import { NextResponse } from "next/server";
import { prisma } from '@lib/prisma';
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "@lib/auth";

export async function GET() {
    try {
        const session = (await getServerSession(authOptions)) as Session | null;

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        const result = await prisma.transaction.aggregate({
            where: {
                userId: session.user.id,
                type: 'expense'
            },
            _sum: {
                amount: true,
            },
        });

        const totalExpenses = result._sum.amount ?? 0;
        return NextResponse.json({ totalExpenses });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}