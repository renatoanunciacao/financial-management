import { generateNotifications } from "@lib/notifications";
import { prisma } from "@lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "pages/api/auth/[...nextauth]";

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Usuário não logado" }, { status: 401 })
    }

    await generateNotifications(session.user.id);

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ all: notifications })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 })
  }
}