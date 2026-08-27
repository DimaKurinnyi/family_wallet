'use client';

import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { cn } from '@/lib/utils';

export type CategoryOption = { id: string; name: string; iconName: string | null };

interface Props {
  categories: CategoryOption[];
  transactionType: 'income' | 'expense';
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const TransactionAdder: React.FC<Props> = ({
  categories,
  transactionType,
  selectedId,
  onSelect,
}) => {
  const isIncome = transactionType === 'income';

  return (
    <div className="mt-6">
      <h2>Выберите категорию:</h2>

      <div className="m-3 grid grid-cols-3 gap-3 max-h-[280px] overflow-y-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
              'flex flex-col items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:shadow-sm',
              isIncome ? 'hover:bg-[#f2ecfd]' : 'hover:bg-[#fdf0ec]',
              selectedId === category.id && (isIncome ? 'bg-[#f2ecfd]' : 'bg-[#fdf0ec]')
            )}>
            <div
              className={cn(
                'p-2 bg-gray-100 rounded-full shadow-sm',
                isIncome ? 'text-[#8144e9]' : 'text-[#ee7048]'
              )}>
              <CategoryIcon name={category.iconName} />
            </div>
            <p className="text-sm text-center">{category.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
