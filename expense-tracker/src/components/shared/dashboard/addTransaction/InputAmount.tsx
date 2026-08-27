'use client';

import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { cn } from '@/lib/utils';
import type { CategoryOption } from './TransactionAdder';

interface Props {
  transactionType: 'income' | 'expense';
  value: string;
  onChange: (digits: string) => void;
  selectedCategory: CategoryOption | null;
}

export const InputAmount: React.FC<Props> = ({
  transactionType,
  value,
  onChange,
  selectedCategory,
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

        <div className="flex items-center">
          <span className="ml-2 text-2xl font-bold text-gray-500">{isIncome ? '+' : '−'}</span>
          <input
            id="amount-display"
            type="text"
            inputMode="numeric"
            value={formatted}
            onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
            className="w-28 sm:w-32 text-2xl px-1 font-bold bg-transparent border-0 focus:outline-none"
            placeholder="0"
            aria-label="Сумма"
          />
        </div>
      </div>
    </div>
  );
};
