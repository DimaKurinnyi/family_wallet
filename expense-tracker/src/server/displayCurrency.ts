import { isCurrency, type Currency } from '@/lib/currency';
import { cookies } from 'next/headers';

export const DISPLAY_CURRENCY_COOKIE = 'displayCurrency';

// Валюта показа живёт в куке, а не в localStorage: пересчёт делается на
// сервере, и он должен знать её с первого байта. Иначе сервер отрисует
// суммы в одной валюте, а клиент после гидратации — в другой.
export async function getDisplayCurrency(): Promise<Currency> {
  const value = (await cookies()).get(DISPLAY_CURRENCY_COOKIE)?.value;
  return isCurrency(value) ? value : 'USD';
}
