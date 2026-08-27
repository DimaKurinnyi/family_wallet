'use client';

import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { cn } from '@/lib/utils';

export type CategoryFlow = 'income' | 'expense' | 'both';

export type CategoryOption = {
  id: string;
  name: string;
  iconName: string | null;
  flow: CategoryFlow;
};

interface Props {
  categories: CategoryOption[];
  transactionType: 'income' | 'expense';
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// Категории со стороной both попадают в обе панели: «Подарки» можно и
// получить, и подарить.
const forFlow = (categories: CategoryOption[], side: 'income' | 'expense') =>
  categories.filter((category) => category.flow === side || category.flow === 'both');

interface PanelProps {
  categories: CategoryOption[];
  side: 'income' | 'expense';
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const Panel: React.FC<PanelProps> = ({ categories, side, selectedId, onSelect }) => {
  const isIncome = side === 'income';

  return (
    <div className="w-1/2 flex-none">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
              'flex flex-col items-center gap-1.5 p-1.5 sm:p-2 rounded-lg cursor-pointer transition-colors hover:shadow-sm',
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
            <p className="text-xs sm:text-sm text-center leading-tight">{category.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export const TransactionAdder: React.FC<Props> = ({
  categories,
  transactionType,
  selectedId,
  onSelect,
}) => {
  const transformValue = transactionType === 'income' ? 'translateX(0%)' : 'translateX(-50%)';

  return (
    <div className="mt-6">
      <h2>Выберите категорию:</h2>

      <div className="my-3 overflow-hidden">
        <div
          className="flex w-[200%] transition-transform duration-300 ease-in-out"
          style={{ transform: transformValue }}>
          <Panel
            categories={forFlow(categories, 'income')}
            side="income"
            selectedId={selectedId}
            onSelect={onSelect}
          />
          <Panel
            categories={forFlow(categories, 'expense')}
            side="expense"
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  );
};
