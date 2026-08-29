'use client';

import { CategoryIcon } from '@/components/shared/CategoryIcon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CURRENCIES, CURRENCY_META, type Currency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import type { CategoryOption } from './TransactionAdder';

interface Props {
  transactionType: 'income' | 'expense';
  value: string;
  onChange: (digits: string) => void;
  selectedCategory: CategoryOption | null;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

export const InputAmount: React.FC<Props> = ({
  transactionType,
  value,
  onChange,
  selectedCategory,
  currency,
  onCurrencyChange,
}) => {
  const formatted = value ? new Intl.NumberFormat('ru-RU').format(Number(value)) : '';
  const isIncome = transactionType === 'income';

  return (
    <div className={cn('p-3 rounded-2xl', isIncome ? 'bg-[#f2ecfd]' : 'bg-[#fdf0ec]')}>
      <h2 className="text-lg sm:text-xl font-bold">Сумма:</h2>

      <div className="flex items-center justify-between mt-4">
        {/* Пока категория не выбрана — пунктирный силуэт, дальше её иконка. */}
        {selectedCategory ? (
          <div
            className={cn(
              'w-10 h-10 rounded-full ml-3.5 flex items-center justify-center bg-white shadow-sm',
              isIncome ? 'text-[#8144e9]' : 'text-[#ee7048]'
            )}
            title={selectedCategory.name}>
            <CategoryIcon name={selectedCategory.iconName} className="w-5 h-5" />
          </div>
        ) : (
          <div
            className="w-10 h-10 rounded-full border-2 border-dashed border-black ml-3.5"
            aria-hidden="true"
          />
        )}

        <div className="flex items-center gap-1">
          <span className="text-2xl font-bold text-gray-500">{isIncome ? '+' : '−'}</span>
          <Select value={currency} onValueChange={(value) => onCurrencyChange(value as Currency)}>
            <SelectTrigger
              aria-label="Валюта операции"
              className="h-8 w-auto gap-1 border-0 bg-transparent px-1 text-lg font-bold text-gray-500 shadow-none">
              <SelectValue>{CURRENCY_META[currency].symbol}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((code) => (
                <SelectItem key={code} value={code}>
                  {CURRENCY_META[code].symbol} {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            id="amount-display"
            type="text"
            inputMode="numeric"
            value={formatted}
            onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
            className="w-24 sm:w-28 text-2xl px-1 font-bold bg-transparent border-0 focus:outline-none"
            placeholder="0"
            aria-label="Сумма"
          />
        </div>
      </div>
    </div>
  );
};
