import prisma from '@/lib/prisma';

// Итоги считаем в базе, но разложенными по валютам: сложить гривны с
// долларами SQL не может, пока не известен курс. Свод делается уже в коде.
export async function getWalletSummaries(walletIds: string[]) {
  const grouped = await prisma.transaction.groupBy({
    by: ['walletId', 'type', 'currency'],
    where: { walletId: { in: walletIds } },
    _sum: { amount: true },
  });

  type ByCurrency = Record<string, number>;
  const byWallet = new Map<string, { income: ByCurrency; expense: ByCurrency }>();
  for (const id of walletIds) {
    byWallet.set(id, { income: {}, expense: {} });
  }

  for (const row of grouped) {
    const entry = byWallet.get(row.walletId);
    if (!entry) continue;
    entry[row.type][row.currency] = (entry[row.type][row.currency] ?? 0) + (row._sum.amount ?? 0);
  }

  return byWallet;
}

// Берём заметно больше восьми: список теперь разбит по дням и скроллится
// в своей высоте, так что длинная история не растягивает страницу.
export async function getWalletTransactions(walletId: string, take = 60) {
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

// Доходы и расходы по месяцам за последние monthsCount месяцев, включая
// текущий. Группировка по месяцу — на стороне базы: date_trunc умеет это,
// а prisma groupBy по вычисляемому полю не умеет. Валюта в разрезе тоже:
// пересчёт делается при показе.
//
// Месяц считается по времени сервера базы (на Neon это UTC). Для трекера
// расходов расхождение на несколько часов в конце месяца некритично.
export async function getMonthlyTotals(walletId: string, monthsCount = 6) {
  const rows = await prisma.$queryRaw<{ month: Date; type: string; currency: string; total: number }[]>`
    SELECT date_trunc('month', "createdAt") AS month,
           type::text AS type,
           currency,
           SUM(amount)::float8 AS total
    FROM "Transaction"
    WHERE "walletId" = ${walletId}
      AND "createdAt" >= date_trunc('month', now()) - make_interval(months => ${monthsCount - 1})
    GROUP BY 1, 2, 3
    ORDER BY 1
  `;

  type ByCurrency = Record<string, number>;
  const totals = new Map<string, { income: ByCurrency; expense: ByCurrency }>();
  for (const row of rows) {
    const key = new Date(row.month).toISOString().slice(0, 7);
    const entry = totals.get(key) ?? { income: {}, expense: {} };
    if (row.type === 'income' || row.type === 'expense') {
      entry[row.type][row.currency] = (entry[row.type][row.currency] ?? 0) + row.total;
    }
    totals.set(key, entry);
  }

  // Пустые месяцы тоже нужны: без них ось времени рвётся и соседние
  // столбцы оказываются рядом, будто между ними ничего не было.
  const result: { key: string; date: Date; income: ByCurrency; expense: ByCurrency }[] = [];
  const now = new Date();
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsCount - 1), 1));

  for (let i = 0; i < monthsCount; i += 1) {
    const key = cursor.toISOString().slice(0, 7);
    const entry = totals.get(key) ?? { income: {}, expense: {} };
    result.push({ key, date: new Date(cursor), ...entry });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return result;
}

export async function getCategoriesForUser(userId: string) {
  return prisma.category.findMany({
    where: { OR: [{ type: 'system' }, { type: 'custom', userId }] },
    include: { icon: true },
    orderBy: { name: 'asc' },
  });
}

// Расходы за период в разрезе категорий. Валюта в разрезе тоже: сложить
// гривны с долларами можно только зная курс, а он известен при показе.
export async function getExpenseByCategory(walletId: string, from: Date, to: Date) {
  const grouped = await prisma.transaction.groupBy({
    by: ['categoryId', 'currency'],
    where: { walletId, type: 'expense', createdAt: { gte: from, lt: to } },
    _sum: { amount: true },
  });

  const categoryIds = grouped
    .map((row) => row.categoryId)
    .filter((id): id is string => id !== null);

  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    include: { icon: true },
  });
  const byId = new Map(categories.map((category) => [category.id, category]));

  type ByCurrency = Record<string, number>;
  const totals = new Map<string, { name: string; iconName: string | null; byCurrency: ByCurrency }>();

  for (const row of grouped) {
    // Операции без категории всё равно попадают в свод: молча пропасть из
    // суммы расходов они не должны.
    const key = row.categoryId ?? 'none';
    const category = row.categoryId ? byId.get(row.categoryId) : undefined;
    const entry = totals.get(key) ?? {
      name: category?.name ?? 'Без категории',
      iconName: category?.icon?.name ?? null,
      byCurrency: {},
    };
    entry.byCurrency[row.currency] = (entry.byCurrency[row.currency] ?? 0) + (row._sum.amount ?? 0);
    totals.set(key, entry);
  }

  return [...totals.entries()].map(([id, entry]) => ({ id, ...entry }));
}
