import prisma from '@/lib/prisma';
import { CURRENCIES, type Rates } from '@/lib/currency';

const BASE = 'USD';
const FRESH_FOR_MS = 12 * 60 * 60 * 1000;

// Бесплатный источник без ключа. Отдаёт курсы к доллару, включая гривну и
// злотый — их нет в источниках на данных ЕЦБ.
const SOURCE = 'https://open.er-api.com/v6/latest/USD';

export type RatesResult = {
  rates: Rates;
  updatedAt: Date;
  /** true, если внешний источник недоступен и показываются сохранённые курсы */
  stale: boolean;
};

async function readStored(): Promise<{ rates: Rates; updatedAt: Date } | null> {
  const rows = await prisma.exchangeRate.findMany({ where: { base: BASE } });
  if (rows.length === 0) return null;

  const rates: Rates = { [BASE]: 1 };
  let updatedAt = new Date(0);
  for (const row of rows) {
    rates[row.currency] = row.rate;
    if (row.updatedAt > updatedAt) updatedAt = row.updatedAt;
  }
  return { rates, updatedAt };
}

async function fetchFresh(): Promise<Rates | null> {
  try {
    const response = await fetch(SOURCE, { cache: 'no-store' });
    if (!response.ok) {
      console.error('Источник курсов ответил:', response.status);
      return null;
    }

    const payload = (await response.json()) as { result?: string; rates?: Record<string, unknown> };
    if (payload.result !== 'success' || !payload.rates) {
      console.error('Неожиданный ответ источника курсов:', payload.result);
      return null;
    }

    // Берём только те валюты, которые поддерживает приложение, и только
    // положительные числа: мусор из ответа лучше не сохранять.
    const rates: Rates = { [BASE]: 1 };
    for (const currency of CURRENCIES) {
      const value = payload.rates[currency];
      if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        rates[currency] = value;
      }
    }

    return Object.keys(rates).length > 1 ? rates : null;
  } catch (error) {
    console.error('Не удалось получить курсы:', error);
    return null;
  }
}

export async function getRates(): Promise<RatesResult | null> {
  const stored = await readStored();

  if (stored && Date.now() - stored.updatedAt.getTime() < FRESH_FOR_MS) {
    return { ...stored, stale: false };
  }

  const fresh = await fetchFresh();

  if (fresh) {
    await prisma.$transaction(
      Object.entries(fresh).map(([currency, rate]) =>
        prisma.exchangeRate.upsert({
          where: { base_currency: { base: BASE, currency } },
          update: { rate },
          create: { base: BASE, currency, rate },
        })
      )
    );
    return { rates: fresh, updatedAt: new Date(), stale: false };
  }

  // Источник недоступен — отдаём сохранённые, даже устаревшие, и помечаем
  // их таковыми. Придумывать курсы нельзя: это молча соврёт о суммах.
  return stored ? { ...stored, stale: true } : null;
}
