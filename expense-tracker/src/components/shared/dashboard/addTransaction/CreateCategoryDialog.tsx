'use client';

import { createCategoryAction, type CategoryFormState } from '@/app/(root)/dashboard/actions';
import { CategoryIcon, ICON_NAMES } from '@/components/shared/CategoryIcon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useActionState, useEffect, useState } from 'react';
import type { CategoryOption } from './TransactionAdder';

const initialState: CategoryFormState = { error: null, category: null };

interface Props {
  /** Сторона, с панели которой нажали плюс */
  flow: 'income' | 'expense';
  onCreated: (category: CategoryOption) => void;
  onClose: () => void;
}

/**
 * Своя категория. Сторона (доход или расход) не спрашивается: плюс нажат
 * с конкретной панели, и категория заводится для неё — лишний выбор здесь
 * только замедлял бы.
 *
 * Категория видна только тому, кто её создал: на сервере она пишется с
 * userId, а в выборку другим пользователям не попадает.
 */
export function CreateCategoryDialog({ flow, onCreated, onClose }: Props) {
  const [iconName, setIconName] = useState<string>(ICON_NAMES[0]);
  // Название держим в состоянии: после неудачной отправки форма
  // перерисовывается, и неуправляемое поле теряло бы набранное.
  const [name, setName] = useState('');
  const [state, formAction, isPending] = useActionState(createCategoryAction, initialState);
  const isIncome = flow === 'income';

  useEffect(() => {
    if (!state.category) return;
    onCreated({
      id: state.category.id,
      name: state.category.name,
      iconName: state.category.iconName,
      flow: state.category.flow,
    });
    onClose();
  }, [state.category, onCreated, onClose]);

  return (
    <Dialog open onOpenChange={(isOpen) => (isOpen ? undefined : onClose())}>
      <DialogContent>
        <div>
          <DialogTitle>Новая категория</DialogTitle>
          <DialogDescription className="mt-1">
            {isIncome ? 'Появится среди доходов' : 'Появится среди расходов'}. Её видите только вы.
          </DialogDescription>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="flow" value={flow} />
          <input type="hidden" name="iconName" value={iconName} />

          <Input
            name="name"
            placeholder="Название"
            aria-label="Название категории"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={20}
            autoFocus
            required
          />

          <div>
            <p className="mb-2 text-sm text-gray-500">Иконка</p>
            <div className="grid grid-cols-6 gap-2">
              {ICON_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setIconName(name)}
                  aria-label={`Иконка ${name}`}
                  aria-pressed={iconName === name}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-lg border-2 transition-colors',
                    iconName === name
                      ? isIncome
                        ? 'border-[#8144e9] bg-[#f2ecfd] text-[#8144e9]'
                        : 'border-[#ee7048] bg-[#fdf0ec] text-[#ee7048]'
                      : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'
                  )}>
                  <CategoryIcon name={name} className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {state.error ? (
            <p role="alert" className="text-sm text-red-600">
              {state.error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? 'Создаём…' : 'Создать'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
