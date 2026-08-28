import prisma from '@/lib/prisma';

// Итоги считаем в базе: тянуть все транзакции ради суммы незачем.
export async function getWalletSummary(walletId: string) {
  const grouped = await prisma.transaction.groupBy({
    by: ['type'],
    where: { walletId },
    _sum: { amount: true },
  });

  const sumOf = (type: 'income' | 'expense') =>
    grouped.find((row) => row.type === type)?._sum.amount ?? 0;

  const income = sumOf('income');
  const expense = sumOf('expense');

  return { income, expense, balance: income - expense };
}

export async function getWalletTransactions(walletId: string, take = 8) {
  return prisma.transaction.findMany({
    where: { walletId },
    include: {
      category: { include: { icon: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take,
  });
}

export async function getCategoriesForUser(userId: string) {
  return prisma.category.findMany({
    where: { OR: [{ type: 'system' }, { type: 'custom', userId }] },
    include: { icon: true },
    orderBy: { name: 'asc' },
  });
}
