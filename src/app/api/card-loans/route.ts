import { createLoan, getLoans } from "@lib/loanService";
import { prisma } from "@lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "pages/api/auth/[...nextauth]";

interface Params {
  params: { id: string };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não logado" },
        { status: 401 }
      );
    }

    const loans = await getLoans(session.user.id);
    return NextResponse.json(loans);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao buscar empréstimos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não logado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const loan = await createLoan(body, session.user.id);

    return NextResponse.json(loan, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao criar empréstimo" },
      { status: 500 }
    );
  }
}
