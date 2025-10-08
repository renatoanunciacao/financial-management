import { prisma } from "@lib/prisma";
import { subDays } from "date-fns";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const authHeader = request.headers.get("x-cron-secret");
    const CRON_SECRET = process.env.CRON_SECRET;

    if(!authHeader || authHeader !== CRON_SECRET){
        return NextResponse.json(
            {
                success: false, error: 'Acesso não autorizado'
            },
            {
                status: 401
            }
        );
    }

    try {
        const deleted = await prisma.notification.deleteMany({
            where: {
                isRead: true,
                createdAt: {
                    lt: subDays(new Date(), 30)
                },
            },
        });

        return NextResponse.json({
            success: true,
            deletedCount: deleted.count,
            message:`Foram apagadas ${deleted.count} notificações antigas`,
        })
        
    } catch (error) {
        console.error("Erro ao limpar notificações antigas:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao limpar notificações antigas" },
      { status: 500 }
    );

    }
}