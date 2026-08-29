export const CURRENCIES = ['USD', 'EUR', 'UAH', 'PLN'] as const;

export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_META: Record<Currency, { symbol: string; label: string; icon: string }> = {
  USD: { symbol: '$', label: 'Доллар', icon: '💵' },
  EUR: { symbol: '€', label: 'Евро', icon: '💶' },
  UAH: { symbol: '₴', label: 'Гривна', icon: '🇺🇦' },
  PLN: { symbol: 'zł', label: 'Злотый', icon: '🇵🇱' },
};

export const isCurrency = (value: unknown): value is Currency =>
  typeof value === 'string' && (CURRENCIES as readonly string[]).includes(value);

// Курсы храним относительно доллара: rates[X] — сколько единиц X за доллар.
export type Rates = Record<string, number>;

// null означает «посчитать нельзя»: курса нет. Возвращать исходное число
// в этом случае нельзя — гривны сложились бы с долларами как одинаковые
// величины и дали бы уверенно неверный итог.
export function convert(amount: number, from: string, to: string, rates: Rates): number | null {
  if (from === to) return amount;

  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return null;

  // Через доллар: сначала приводим к нему, потом к целевой валюте.
  return (amount / fromRate) * toRate;
}

// Суммы приходят разбитыми по валютам: сложить их в базе нельзя, пока
// не известен курс. Если хоть одну часть пересчитать нечем, итога нет.
export function convertTotals(
  byCurrency: Record<string, number>,
  to: string,
  rates: Rates
): number | null {
  let sum = 0;
  for (const [currency, amount] of Object.entries(byCurrency)) {
    const converted = convert(amount, currency, to, rates);
    if (converted === null) return null;
    sum += converted;
  }
  return sum;
}

export function formatMoney(value: number, currency: Currency) {
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${CURRENCY_META[currency].symbol}${formatted}`;
}
