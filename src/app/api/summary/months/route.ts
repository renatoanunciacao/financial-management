// /api/summary/months/route.ts
import { prisma } from "@lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    select: { date: true },
    orderBy: { date: "desc" },
  });

  // Monta uma lista única de { month, year }
  const months = Array.from(
    new Set(
      transactions.map((t) => {
        const d = new Date(t.date);
        return `${d.getFullYear()}-${d.getMonth() + 1}`;
      })
    )
  ).map((str) => {
    const [year, month] = str.split("-");
    return { year: Number(year), month: Number(month) };
  });

  return NextResponse.json(months);
}
