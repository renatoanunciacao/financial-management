import { prisma } from "@lib/prisma";
import { NextResponse } from "next/server";
// ajuste para o caminho do seu prisma

// Atualizar parcela como paga
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Aqui você pode passar dados no body, caso queira mais infos
    const body = await req.json();
    const { isPaid = true } = body;

    const installment = await prisma.installmentExpense.update({
      where: { id },
      data: { isPaid },
    });

    return NextResponse.json(installment);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao atualizar parcela" },
      { status: 500 }
    );
  }
}
