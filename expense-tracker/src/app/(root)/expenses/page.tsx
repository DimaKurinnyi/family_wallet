import { DashboardContainer, Header } from '@/components/shared';
import type { FlowPoint } from '@/components/shared/charts/FlowBars';
import { FlowBars } from '@/components/shared/charts/FlowBars';
import { IncomeCurve } from '@/components/shared/charts/IncomeCurve';
import { CategoryDonut, type CategorySlice } from '@/components/shared/expenses/CategoryDonut';
import { MonthTabs, type MonthTab } from '@/components/shared/expenses/MonthTabs';
import { convertTotals, type Rates } from '@/lib/currency';
import { CURRENCY_META } from '@/lib/currency';
import { resolveActiveWallet } from '@/server/activeWallet';
import {
  getCategoriesForUser,
  getExpenseByCategory,
  getWeeklyTotals,
} from '@/server/dashboard.service';
import { getDisplayCurrency } from '@/server/displayCurrency';
import { getRates } from '@/server/rates.service';
import { getCurrentUser } from '@/server/session';
import { getUserWallets } from '@/server/wallet.service';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Расходы — Expense Tracker' };

// Сколько месяцев показывать в ленте. Год — столько, сколько имеет смысл
// сравнивать: дальше это уже не «посмотреть, куда ушли деньги».
const MONTHS = 12;
// Больше шести цветных долей глаз не разбирает, поэтому хвост сворачиваем.
const MAX_SLICES = 6;

const monthShort = new Intl.DateTimeFormat('ru-RU', { month: 'short', timeZone: 'UTC' });
const monthFullFormatter = new Intl.DateTimeFormat('ru-RU', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
// «август 2026 г.» — «г.» в подписи месяца лишнее.
const monthFull = (date: Date) => monthFullFormatter.format(date).replace(' г.', '');

const monthKey = (date: Date) => date.toISOString().slice(0, 7);
// «14 августа» — из него берётся только название месяца в нужном падеже.
const dayMonthFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});
const dayMonth = {
  format: (date: Date) => dayMonthFormatter.format(date).replace(/^\d+\s/, ''),
};

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const user = await getCurrentUser();
  const { m } = await searchParams;

  const [wallets, categories, currency, ratesResult] = await Promise.all([
    getUserWallets(user.id),
    getCategoriesForUser(user.id),
    getDisplayCurrency(),
    getRates(),
  ]);

  const rates: Rates = ratesResult?.rates ?? {};
  const activeWallet = await resolveActiveWallet(wallets);

  // Лента месяцев строится от текущего назад. Месяцы считаем в UTC — так же,
  // как их группирует база: иначе на границе месяца лента и суммы разошлись бы.
  const now = new Date();
  const current = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const months: MonthTab[] = [];
  for (let back = MONTHS - 1; back >= 0; back -= 1) {
    const date = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - back, 1));
    const title = monthFull(date);
    months.push({
      key: monthKey(date),
      label:
        back === 0
          ? 'Этот месяц'
          : date.getUTCFullYear() === current.getUTCFullYear()
            ? monthShort.format(date).replace('.', '')
            : title,
      title,
    });
  }

  // Месяц из адреса, но только из ленты: произвольная строка в ?m= не должна
  // уводить страницу в непонятное состояние.
  const activeKey = months.some((month) => month.key === m) ? m! : monthKey(current);
  const [year, month] = activeKey.split('-').map(Number);
  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 1));

  const [rows, weeks] = activeWallet
    ? await Promise.all([
        getExpenseByCategory(activeWallet.id, from, to),
        getWeeklyTotals(activeWallet.id, from, to),
      ])
    : [[], []];

  // Курса нет — складывать разные валюты нельзя. Такие категории отбрасываем
  // не молча: ниже об этом сказано прямо.
  const converted = rows
    .map((row) => ({ ...row, amount: convertTotals(row.byCurrency, currency, rates) }))
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));

  const missingRates = converted.some((row) => row.amount === null);
  const usable = converted.filter((row): row is typeof row & { amount: number } => row.amount !== null);
  const total = usable.reduce((sum, row) => sum + row.amount, 0);

  const head = usable.slice(0, MAX_SLICES - 1);
  const tail = usable.slice(MAX_SLICES - 1);
  // Хвост сворачиваем только если в нём больше одной категории: иначе
  // «Остальные (1)» — это та же категория, но без имени.
  // Имя нарочно не «Другое»: так называется настоящая системная категория,
  // и две одинаковые строки в легенде сбивали с толку.
  const grouped: (typeof usable[number] & { muted?: boolean })[] =
    tail.length > 1
      ? [
          ...head,
          {
            id: 'other',
            name: `Остальные (${tail.length})`,
            iconName: null,
            byCurrency: {},
            amount: tail.reduce((sum, row) => sum + row.amount, 0),
            muted: true,
          },
        ]
      : usable;

  const slices: CategorySlice[] = grouped.map((row) => ({
    id: row.id,
    name: row.name,
    amount: row.amount,
    share: total > 0 ? (row.amount / total) * 100 : 0,
    muted: row.muted,
  }));

  // Недели подписываем числами месяца: «1–7», «8–14». Дата начала недели
  // как таковая читателю не нужна, ему нужен кусок месяца.
  const weekPoints: FlowPoint[] = weeks.map((week) => {
    const days = `${week.start.getUTCDate()}–${week.end.getUTCDate()}`;
    return {
      key: week.key,
      label: days,
      fullLabel: `${days} ${dayMonth.format(week.end)}`,
      income: convertTotals(week.income, currency, rates) ?? 0,
      expense: convertTotals(week.expense, currency, rates) ?? 0,
    };
  });

  const incomeTotal = weekPoints.reduce((sum, week) => sum + week.income, 0);

  const activeMonth = months.find((monthTab) => monthTab.key === activeKey);
  const symbol = CURRENCY_META[currency].symbol;

  return (
    <DashboardContainer
      categories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        iconName: category.icon?.name ?? null,
        flow: category.flow,
      }))}
      walletId={activeWallet?.id ?? null}
      currency={currency}>
      <Header
        userName={user.name ?? user.email}
        wallets={wallets.map((wallet) => ({ id: wallet.id, name: wallet.name, type: wallet.type }))}
        activeWalletId={activeWallet?.id ?? ''}
        currency={currency}
      />

      <div className="mx-auto mt-6 flex w-full max-w-[720px] flex-col gap-6">
        <MonthTabs months={months} activeKey={activeKey} />

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-lg font-semibold text-gray-800">Расходы</h2>
            <p className="text-sm text-gray-400">{activeMonth?.title}</p>
          </div>

          <p className="mt-2 text-3xl font-bold tabular-nums sm:text-4xl">
            {symbol}
            {new Intl.NumberFormat('ru-RU', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(total)}
          </p>

          {slices.length === 0 ? (
            <p className="mt-6 text-gray-400">
              В этом месяце расходов не было. Выберите другой месяц в ленте сверху.
            </p>
          ) : (
            <div className="mt-6">
              <CategoryDonut slices={slices} total={total} currency={currency} />
            </div>
          )}

          {missingRates ? (
            <p className="mt-6 text-sm text-amber-700">
              Часть операций в других валютах не попала в свод: курса для пересчёта нет.
            </p>
          ) : null}
        </section>

        <FlowBars
          className="shadow-sm"
          points={weekPoints}
          currency={currency}
          title="Денежный поток"
          hint="Выберите неделю"
          emptyText="В этом месяце операций не было — здесь появятся столбцы по неделям."
        />

        <IncomeCurve
          points={weekPoints}
          currency={currency}
          title="Доход"
          total={incomeTotal}
          period={activeMonth?.title}
          hint="Выберите неделю"
          emptyText="В этом месяце доходов не было."
          className="shadow-sm"
        />
      </div>
    </DashboardContainer>
  );
}
