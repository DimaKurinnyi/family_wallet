import { DashboardContainer, DashboardContent, Header, MonthlyFlow, Transactions } from '@/components/shared';
import type { MonthPoint } from '@/components/shared/dashboard/MonthlyFlow';
import type {
  TransactionGroup,
  TransactionView,
} from '@/components/shared/dashboard/Transactions';
import { convert, convertTotals, isCurrency, type Rates } from '@/lib/currency';
import { resolveActiveWallet } from '@/server/activeWallet';
import { getDisplayCurrency } from '@/server/displayCurrency';
import { getRates } from '@/server/rates.service';
import {
  getCategoriesForUser,
  getMonthlyTotals,
  getWalletSummaries,
  getWalletTransactions,
} from '@/server/dashboard.service';
import { getCurrentUser } from '@/server/session';
import { getUserWallets } from '@/server/wallet.service';

// Дату форматируем здесь, а не в клиентском компоненте: иначе серверный и
// клиентский рендер разойдутся из-за разных часовых поясов.
const timeFormatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
const dayFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
const dayWithYearFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
// Ключ дня в том же часовом поясе, что и подписи: сравнивать ISO-строку от
// toISOString() нельзя — она всегда в UTC и под вечер даёт «завтра».
const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const monthShort = new Intl.DateTimeFormat('ru-RU', { month: 'short', timeZone: 'UTC' });
const monthFull = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export default async function Dashboard() {
  const user = await getCurrentUser();

  const [wallets, categories, currency, ratesResult] = await Promise.all([
    getUserWallets(user.id),
    getCategoriesForUser(user.id),
    getDisplayCurrency(),
    getRates(),
  ]);

  // Курсов нет вовсе — пересчитать нечем. Единичные курсы оставляют суммы
  // как есть, а предупреждение внизу говорит, что своду верить нельзя.
  const rates: Rates = ratesResult?.rates ?? {};

  const activeWallet = await resolveActiveWallet(wallets);

  const [summaries, transactions, monthlyTotals] = await Promise.all([
    getWalletSummaries(wallets.map((wallet) => wallet.id)),
    activeWallet ? getWalletTransactions(activeWallet.id) : [],
    activeWallet ? getMonthlyTotals(activeWallet.id) : [],
  ]);

  const walletSummaries = wallets.map((wallet) => {
    const totals = summaries.get(wallet.id) ?? { income: {}, expense: {} };
    const income = convertTotals(totals.income, currency, rates);
    const expense = convertTotals(totals.expense, currency, rates);
    return {
      id: wallet.id,
      name: wallet.name,
      type: wallet.type,
      income,
      expense,
      balance: income === null || expense === null ? null : income - expense,
    };
  });

  const isShared = activeWallet?.type === 'shared';

  // Править и удалять может владелец кошелька или тот, кто внёс запись —
  // те же правила, что и на сервере. Остальным кнопки просто не показываем.
  const isWalletOwner = activeWallet?.ownerId === user.id;

  const transactionViews: TransactionView[] = transactions.map((transaction) => ({
    id: transaction.id,
    categoryName: transaction.category?.name ?? 'Без категории',
    categoryId: transaction.categoryId,
    iconName: transaction.category?.icon?.name ?? null,
    amount: convert(transaction.amount, transaction.currency, currency, rates),
    // Показываем исходную сумму, если операция введена в другой валюте:
    // иначе пересчёт молча подменяет то, что человек записал.
    original:
      transaction.currency === currency
        ? null
        : { amount: transaction.amount, currency: transaction.currency },
    type: transaction.type,
    rawAmount: transaction.amount,
    rawCurrency: isCurrency(transaction.currency) ? transaction.currency : currency,
    timeLabel: timeFormatter.format(transaction.createdAt),
    comment: transaction.comment,
    authorName: isShared ? transaction.user.name?.trim() || transaction.user.email : null,
    canEdit: isWalletOwner || transaction.userId === user.id,
  }));

  // Группируем по дню. Порядок операций уже по убыванию даты, так что
  // достаточно складывать в последнюю группу, пока день не сменился.
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const todayKey = dayKeyFormatter.format(today);
  const yesterdayKey = dayKeyFormatter.format(yesterday);

  const dayLabel = (date: Date, key: string) => {
    if (key === todayKey) return 'Сегодня';
    if (key === yesterdayKey) return 'Вчера';
    // Год добавляем только у прошлых лет: «29 августа 2025» среди свежих
    // записей читается тяжелее, чем просто «29 августа».
    return date.getFullYear() === today.getFullYear()
      ? dayFormatter.format(date)
      : dayWithYearFormatter.format(date);
  };

  const groups: TransactionGroup[] = [];
  transactions.forEach((transaction, index) => {
    const key = dayKeyFormatter.format(transaction.createdAt);
    const last = groups.at(-1);
    if (last?.key === key) {
      last.items.push(transactionViews[index]);
    } else {
      groups.push({ key, label: dayLabel(transaction.createdAt, key), items: [transactionViews[index]] });
    }
  });

  const monthPoints: MonthPoint[] = monthlyTotals.map((month) => ({
    key: month.key,
    label: monthShort.format(month.date).replace('.', ''),
    fullLabel: monthFull.format(month.date),
    income: convertTotals(month.income, currency, rates) ?? 0,
    expense: convertTotals(month.expense, currency, rates) ?? 0,
  }));

  const categoryOptions = categories.map((category) => ({
    id: category.id,
    name: category.name,
    iconName: category.icon?.name ?? null,
    flow: category.flow,
  }));

  return (
    <DashboardContainer categories={categoryOptions} walletId={activeWallet?.id ?? null}
      currency={currency}>
      <Header
        userName={user.name ?? user.email}
        wallets={wallets.map((wallet) => ({ id: wallet.id, name: wallet.name, type: wallet.type }))}
        activeWalletId={activeWallet?.id ?? ''}
        currency={currency}
      />
      <div className="flex flex-col md:flex-row md:justify-around items-center md:items-start">
        <DashboardContent
          wallets={walletSummaries}
          activeWalletId={activeWallet?.id ?? ''}
          currency={currency}
        />
      </div>
      {ratesResult ? (
        <MonthlyFlow months={monthPoints} currency={currency} className="mt-8 w-full max-w-[600px] mx-auto" />
      ) : (
        <p className="mx-auto mt-8 max-w-[600px] rounded-2xl border border-gray-100 bg-white p-6 text-center text-gray-500">
          График скрыт: без курсов валют суммы за месяц не сложить.
        </p>
      )}

      <Transactions
        className="max-w-[600px] mx-auto"
        title="Операции"
        groups={groups}
        categories={categoryOptions}
        currency={currency}
      />

      {!ratesResult || ratesResult.stale ? (
        <p className="mx-auto mt-6 max-w-[600px] text-center text-sm text-amber-700">
          {ratesResult
            ? `Курсы валют недоступны, показаны сохранённые от ${ratesResult.updatedAt.toLocaleDateString('ru-RU')}.`
            : 'Курсы валют недоступны — суммы в разных валютах показаны без пересчёта.'}
        </p>
      ) : null}
    </DashboardContainer>
  );
}
