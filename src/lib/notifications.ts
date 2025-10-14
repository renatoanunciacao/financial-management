import { prisma } from "./prisma";

export async function generateNotifications(sessionUserId?: string) {
  if (!sessionUserId) return;

  const userId = sessionUserId;

  // Função para criar notificação, sem duplicar
  async function createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
  }) {
    const exists = await prisma.notification.findFirst({
      where: {
        userId: data.userId,
        title: data.title,
        type: data.type,
        message: data.message,
      },
    });

    if (!exists) {
      return await prisma.notification.create({ data });
    }

    return null;
  }

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const tenDaysFromNow = new Date(today);
  tenDaysFromNow.setDate(today.getDate() + 10);

  // ============================
  // 1. Parcelas próximas do vencimento (agrupadas por dívida)
  // ============================
  const installments = await prisma.installmentExpense.findMany({
    where: {
      isPaid: false,
      dueDate: {
        gte: startOfMonth,
        lte: tenDaysFromNow,
      },
      debt: { userId },
    },
    include: { debt: true },
  });

  const installmentsByDebt: Record<string, typeof installments> = {};
  for (const inst of installments) {
    const debtId = inst.debtId ?? "unknown";
    if (!installmentsByDebt[debtId]) installmentsByDebt[debtId] = [];
    installmentsByDebt[debtId].push(inst);
  }

  for (const debtId in installmentsByDebt) {
    console.log("debtId", debtId)
    const debtInstallments = installmentsByDebt[debtId];
    const debtName = debtInstallments[0].debt?.borrowerName ?? "";
    const count = debtInstallments.length;
   

    const message =
      count === 1
        ? `Uma parcela do empréstimo ${debtName} vence em breve.`
        : `Você tem ${count} parcelas do empréstimo ${debtName} vencendo em breve.`;

    await createNotification({
      userId,
      title: "Parcela próxima do vencimento",
      message,
      type: "installment_due",
    });
  }

  // ============================
  // 2. Dívidas não pagas (única notificação por usuário)
  // ============================
  const unpaid = await prisma.debt.findMany({
    where: {
      userId,
      installments: {
        some: { isPaid: false },
      },
    },
    include: {
      installments: true,
    },
  });

  if (unpaid.length === 0) return;

  const existing = await prisma.notification.findFirst({
    where: { userId, type: "unpaid_debt", isRead: false },
    orderBy: { createdAt: 'desc' }, // pega a mais recente
  });

  if (existing) {
    await prisma.notification.update({
      where: { id: existing.id },
      data: { message: `Você tem ${unpaid.length} dívida(s) ainda não pagas.` },
    });
  } else if (unpaid.length > 0) {
    await createNotification({
      userId,
      title: "Dívidas em aberto",
      message: `Você tem ${unpaid.length} dívida(s) ainda não pagas.`,
      type: "unpaid_debt",
    });
  }
  // ============================
  // 3. Orçamento estourado
  // ============================
  const categories = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true, budgetLimit: true },
  });

  for (const cat of categories) {
    const result = await prisma.transaction.aggregate({
      where: { userId, categoryId: cat.id },
      _sum: { amount: true },
    });

    const totalSpent = result._sum.amount ?? 0;
    const budgetLimit = cat.budgetLimit ?? 500;

    if (totalSpent > budgetLimit) {
      await createNotification({
        userId,
        title: "Orçamento estourado",
        message: `A categoria ${cat.name} já ultrapassou R$ ${budgetLimit.toFixed(
          2
        )}.`,
        type: "budget_over",
      });
    }
  }

  // ============================
  // 4. Busca todas as notificações do usuário e ordena
  // ============================
  const allNotifications = await prisma.notification.findMany({
    where: { userId },
  });

  const priorityMap: Record<string, number> = {
    unpaid_debt: 1,
    installment_due: 2,
    budget_over: 3,
  };

  const ordered = allNotifications.sort((a, b) => {
    const priorityA = priorityMap[a.type] ?? 99;
    const priorityB = priorityMap[b.type] ?? 99;

    if (priorityA !== priorityB) return priorityA - priorityB;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return ordered;
}
