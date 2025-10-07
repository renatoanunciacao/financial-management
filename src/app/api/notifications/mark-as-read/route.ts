import { prisma } from "@lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { Session } from "next-auth";
import { authOptions } from "@lib/auth";

export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Usuário não logado" }, { status: 401 });
    }

    // Pegar o body da requisição
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID da notificação não fornecido" }, { status: 400 });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao marcar notificação como lida" }, { status: 500 });
  }
}
