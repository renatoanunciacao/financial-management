import { authOptions } from "@lib/auth";
import { generateNotifications } from "@lib/notifications";
import { prisma } from "@lib/prisma";
import { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Usuário não logado" }, { status: 401 })
    }

    await generateNotifications(session.user.id);

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id, isRead: false },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(notifications)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 })
  }
}