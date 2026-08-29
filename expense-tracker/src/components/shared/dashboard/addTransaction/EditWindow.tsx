'use client';

import { updateTransactionAction, type TransactionFormState } from '@/app/(root)/dashboard/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Currency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { BanknoteArrowUp, Lock } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { InputAmount } from './InputAmount';
import { TransactionAdder, type CategoryOption } from './TransactionAdder';

const initialState: TransactionFormState = { error: null, ok: false };

/** Всё, что нужно для правки — то же, что вводили при создании. */
export type TransactionEdit = {
  id: string;
  categoryId: string | null;
  type: 'income' | 'expense';
  amount: number;
  currency: Currency;
  comment: string | null;
};

interface Props {
  transaction: TransactionEdit;
  categories: CategoryOption[];
  onClose: () => void;
}

/**
 * Правка операции. Раскладка та же, что и при добавлении: тип сверху,
 * категории со скроллом посередине, сумма прижата к низу. Отличие одно —
 * тип показан замком: доход и расход это разные записи по смыслу, и
 * превращать одну в другую редактированием нельзя.
 *
 * Компонент монтируется под key={id}, поэтому начальное состояние берётся
 * из props один раз и не рассинхронизируется при выборе другой операции.
 */
export function EditWindow({ transaction, categories, onClose }: Props) {
  const [categoryId, setCategoryId] = useState<string | null>(transaction.categoryId);
  // Сумма вводится целыми, как и при добавлении.
  const [amount, setAmount] = useState(String(Math.round(transaction.amount)));
  const [currency, setCurrency] = useState<Currency>(transaction.currency);

  const [state, formAction, isPending] = useActionState(updateTransactionAction, initialState);

  useEffect(() => {
    if (state.ok) onClose();
  }, [state.ok, onClose]);

  const isIncome = transaction.type === 'income';
  const selectedCategory = categories.find((category) => category.id === categoryId) ?? null;
  const canSubmit = Boolean(categoryId) && Number(amount) > 0;

  return (
    <Sheet open onOpenChange={(isOpen) => (isOpen ? undefined : onClose())}>
      <SheetContent className="w-full sm:max-w-md p-0 gap-0">
        <SheetHeader className="shrink-0 border-b">
          <SheetTitle className="text-xl sm:text-2xl font-bold text-center">
            Изменить операцию
          </SheetTitle>
        </SheetHeader>

        <form action={formAction} className="flex flex-col flex-1 min-h-0">
          <input type="hidden" name="transactionId" value={transaction.id} />
          <input type="hidden" name="categoryId" value={categoryId ?? ''} />
          <input type="hidden" name="amount" value={amount} />
          <input type="hidden" name="currency" value={currency} />

          <div className="shrink-0 px-3 pt-3">
            <div className="flex items-center justify-between gap-2">
              <div
                className={cn(
                  'flex flex-1 flex-col items-center gap-2 px-4 sm:px-10 py-4 rounded-lg bg-[#f2ecfd]',
                  isIncome ? 'border-2 border-[#8144e9]' : 'opacity-40'
                )}>
                <BanknoteArrowUp className="h-8 w-8 text-[#8144e9]" />
                <p>Доход</p>
              </div>
              <div
                className={cn(
                  'flex flex-1 flex-col items-center gap-2 px-4 sm:px-10 py-4 rounded-lg bg-[#fdf0ec]',
                  isIncome ? 'opacity-40' : 'border-2 border-[#ee7048]'
                )}>
                <BanknoteArrowUp className="h-8 w-8 rotate-180 text-[#ee7048]" />
                <p>Расход</p>
              </div>
            </div>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <Lock className="h-3 w-3" />
              Тип операции изменить нельзя
            </p>
          </div>

          <div className="flex flex-col flex-1 min-h-0 px-3">
            <TransactionAdder
              categories={categories}
              transactionType={transaction.type}
              selectedId={categoryId}
              onSelect={setCategoryId}
            />
          </div>

          <div className="shrink-0 border-t bg-background px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <InputAmount
              transactionType={transaction.type}
              value={amount}
              onChange={setAmount}
              selectedCategory={selectedCategory}
              currency={currency}
              onCurrencyChange={setCurrency}
            />
            <Input
              name="comment"
              placeholder="Комментарий (необязательно)"
              defaultValue={transaction.comment ?? ''}
              className="mt-3"
            />

            {state.error ? (
              <p role="alert" className="mt-3 text-sm text-red-600 text-center">
                {state.error}
              </p>
            ) : null}

            <SheetFooter className="p-0 mt-3 flex-row gap-2">
              <Button type="submit" disabled={!canSubmit || isPending} className="flex-1">
                {isPending ? 'Сохраняем…' : 'Сохранить'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Закрыть
              </Button>
            </SheetFooter>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
