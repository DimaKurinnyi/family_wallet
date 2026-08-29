'use client';

import { selectCurrencyAction } from '@/app/(root)/dashboard/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { CURRENCIES, CURRENCY_META, type Currency } from '@/lib/currency';
import { useRouter } from 'next/navigation';
import { useWalletSwitch } from './WalletSwitchContext';

// Валюта показа приходит с сервера: пересчёт делается там же, поэтому
// хранить её в localStorage нельзя — сервер бы о ней не знал.
export default function CurrencySwitcher({ currency }: { currency: Currency }) {
  const router = useRouter();
  const { isSwitching, startSwitch } = useWalletSwitch();

  const handleChange = (next: string) => {
    startSwitch(async () => {
      await selectCurrencyAction(next);
      router.refresh();
    });
  };

  return (
    <Select value={currency} onValueChange={handleChange} disabled={isSwitching}>
      {/* Содержимое триггера задаём сами, без SelectValue: он отрисовывает
          выбранный пункт целиком, вместе с его иконкой, и рядом с нашей
          получалось две одинаковых. Заодно в кнопке остаётся только код,
          а полное название видно в списке. */}
      <SelectTrigger
        aria-label="Валюта показа"
        className="h-10 w-auto gap-2 rounded-full border-gray-200 bg-white px-3 shadow-sm">
        <span aria-hidden="true">{CURRENCY_META[currency].icon}</span>
        <span className="font-medium">{currency}</span>
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((code) => (
          <SelectItem key={code} value={code}>
            <span className="flex items-center gap-2">
              <span aria-hidden="true">{CURRENCY_META[code].icon}</span>
              {code} · {CURRENCY_META[code].label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
