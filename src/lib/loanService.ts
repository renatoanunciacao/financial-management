import { prisma } from "@lib/prisma";

interface LoanFormData {
  borrowerName: string;
  totalValue: number;
  installments: number;
  purchaseDate: string;
  card: string;
}

export async function createLoan(form: LoanFormData, userId: string) {
  const purchaseDate = new Date(form.purchaseDate);
  const monthStart = new Date(
    purchaseDate.getFullYear(),
    purchaseDate.getMonth(),
    1
  );

  // busca ou cria o cartão
  const card = await prisma.card.upsert({
    where: { userId_name: { userId, name: form.card } },
    update: {},
    create: {
      userId,
      name: form.card,
    },
  });

  // busca ou cria o MonthlyData para o mês/usuário
  let monthlyData = await prisma.monthlyData.findFirst({
    where: { userId, month: monthStart },
  });

  if (!monthlyData) {
    monthlyData = await prisma.monthlyData.create({
      data: {
        userId,
        month: monthStart,
        plannedIncome: 0,
      },
    });
  }

  // cria o empréstimo (Debt) + parcelas (Installments)
  const loan = await prisma.debt.create({
    data: {
      borrowerName: form.borrowerName,
      amount: form.totalValue,
      dueDate: purchaseDate,
      cardId: card.id,
      userId, // FK para o usuário logado
      installments: {
        create: Array.from({ length: form.installments }, (_, i) => {
          const installmentDueDate = new Date(purchaseDate);
          installmentDueDate.setMonth(purchaseDate.getMonth() + i);

          return {
            name: `Parcela ${i + 1}`,
            amount: form.totalValue / form.installments,
            installmentNumber: i + 1,
            totalInstallments: form.installments,
            isPaid: false,
            dueDate: installmentDueDate,
            cardId: card.id,
            monthlyDataId: monthlyData!.id,
          };
        }),
      },
    },
    include: {
      installments: true,
      card: true,
    },
  });

  return loan;
}

export async function getLoans(userId: string) {
  const debts = await prisma.debt.findMany({
    where: { userId },
    include: {
      card: true,
      installments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return debts.map((debt) => ({
    id: debt.id,
    borrowerName: debt.borrowerName,
    amount: debt.amount,
    dueDate: debt.dueDate,
    isPaid: debt.isPaid,
    card: debt.card ? { id: debt.card.id, name: debt.card.name } : null,
    installments: debt.installments.map((inst) => ({
      id: inst.id,
      name: inst.name,
      amount: inst.amount,
      dueDate: inst.dueDate,
      isPaid: inst.isPaid,
      installmentNumber: inst.installmentNumber,
      totalInstallments: inst.totalInstallments,
    })),
  }));
}
