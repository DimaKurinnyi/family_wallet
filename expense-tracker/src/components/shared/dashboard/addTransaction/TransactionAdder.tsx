'use client';

import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CreateCategoryDialog } from './CreateCategoryDialog';

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
  /** Своя категория создана — родитель добавляет её в свой список */
  onCreated: (category: CategoryOption) => void;
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
  onAdd: () => void;
}

const Panel: React.FC<PanelProps> = ({ categories, side, selectedId, onSelect, onAdd }) => {
  const isIncome = side === 'income';

  return (
    <div className="w-1/2 flex-none">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            data-selected={selectedId === category.id}
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

        {/* Плюс в конце списка — своя категория. Пунктир, чтобы плитка
            читалась как «здесь пока пусто», а не как ещё одна категория. */}
        <button
          type="button"
          onClick={onAdd}
          className={cn(
            'flex flex-col items-center gap-1.5 p-1.5 sm:p-2 rounded-lg cursor-pointer transition-colors hover:shadow-sm',
            isIncome ? 'hover:bg-[#f2ecfd]' : 'hover:bg-[#fdf0ec]'
          )}>
          <div
            className={cn(
              'p-2 rounded-full border-2 border-dashed',
              isIncome
                ? 'border-[#8144e9]/40 text-[#8144e9]'
                : 'border-[#ee7048]/40 text-[#ee7048]'
            )}>
            <Plus />
          </div>
          <p className="text-xs sm:text-sm text-center leading-tight text-gray-500">Своя</p>
        </button>
      </div>
    </div>
  );
};

export const TransactionAdder: React.FC<Props> = ({
  categories,
  transactionType,
  selectedId,
  onSelect,
  onCreated,
}) => {
  const [creating, setCreating] = useState(false);
  const transformValue = transactionType === 'income' ? 'translateX(0%)' : 'translateX(-50%)';
  const scroller = useRef<HTMLDivElement>(null);

  // При правке категория уже выбрана и может оказаться ниже видимой части.
  // Подкручиваем список к ней один раз при открытии: дальше человек листает
  // сам, и дёргать список под рукой было бы неприятно. Скроллим сам
  // контейнер, а не через scrollIntoView, чтобы не поехала страница позади.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const box = scroller.current;
      const selected = box?.querySelector<HTMLElement>('[data-selected="true"]');
      if (!box || !selected) return;
      const offset = selected.getBoundingClientRect().top - box.getBoundingClientRect().top;
      box.scrollTop += offset - box.clientHeight / 2 + selected.clientHeight / 2;
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    // Занимает всё свободное место между выбором типа и формой суммы.
    // min-h-0 обязателен: без него flex-элемент не даёт себя сжать,
    // и скроллиться начинает вся панель целиком.
    <div className="flex flex-col flex-1 min-h-0 mt-4">
      <h2 className="shrink-0 pb-2">Выберите категорию:</h2>

      {/* overflow-x-hidden — маска для переезда панелей, overflow-y-auto — скролл иконок */}
      <div ref={scroller} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div
          className="flex w-[200%] items-start transition-transform duration-300 ease-in-out"
          style={{ transform: transformValue }}>
          <Panel
            categories={forFlow(categories, 'income')}
            side="income"
            selectedId={selectedId}
            onSelect={onSelect}
            onAdd={() => setCreating(true)}
          />
          <Panel
            categories={forFlow(categories, 'expense')}
            side="expense"
            selectedId={selectedId}
            onSelect={onSelect}
            onAdd={() => setCreating(true)}
          />
        </div>
      </div>

      {/* Монтируется только на время показа: каждое открытие начинается с
          пустого поля, без ошибки от прошлой попытки.
          Сторона берётся из текущей панели: плюс на другой не виден. */}
      {creating ? (
        <CreateCategoryDialog
          flow={transactionType}
          onClose={() => setCreating(false)}
          onCreated={(category) => {
            onCreated(category);
            onSelect(category.id);
          }}
        />
      ) : null}
    </div>
  );
};
