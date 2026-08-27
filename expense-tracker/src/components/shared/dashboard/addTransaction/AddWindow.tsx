'use client';

import { createTransactionAction, type TransactionFormState } from '@/app/(root)/dashboard/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { BanknoteArrowUp, Plus } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { InputAmount } from './InputAmount';
import { TransactionAdder, type CategoryOption } from './TransactionAdder';

const initialState: TransactionFormState = { error: null, ok: false };

interface Props {
  categories: CategoryOption[];
  walletId: string | null;
  triggerClassName?: string;
}

export function AddWindow({ categories, walletId, triggerClassName }: Props) {
  // Расход выбран сразу: подавляющее большинство операций — траты,
  // и лишний клик перед вводом суммы не нужен.
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(createTransactionAction, initialState);

  const reset = () => {
    setTransactionType('expense');
    setCategoryId(null);
    setAmount('');
  };

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      reset();
    }
  }, [state.ok]);

  const selectedCategory = categories.find((category) => category.id === categoryId) ?? null;
  const canSubmit = Boolean(walletId) && Boolean(categoryId) && Number(amount) > 0;

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) reset();
        setOpen(isOpen);
      }}>
      <SheetTrigger asChild>
        <div className={cn('p-1.5 bg-white rounded-full', triggerClassName)}>
          <Button
            variant="outline"
            aria-label="Добавить операцию"
            className="rounded-full bg-[#e094c8] shadow-md shadow-[#e094c8] !h-14 !w-14 hover:!bg-[#e094c8] hover:scale-110 transition-transform border-0">
            <Plus className="text-white h-10 w-10" />
          </Button>
        </div>
      </SheetTrigger>

      <SheetContent className="px-3 overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-xl sm:text-2xl font-bold text-center">
            Новая операция
          </SheetTitle>
        </SheetHeader>

        <form action={formAction}>
          <input type="hidden" name="walletId" value={walletId ?? ''} />
          <input type="hidden" name="type" value={transactionType} />
          <input type="hidden" name="categoryId" value={categoryId ?? ''} />
          <input type="hidden" name="amount" value={amount} />

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              className={cn(
                'flex flex-1 flex-col items-center gap-2 px-4 sm:px-10 py-4 rounded-lg cursor-pointer hover:scale-105 transition-transform bg-[#f2ecfd]',
                transactionType === 'income' && 'border-2 border-[#8144e9]'
              )}
              onClick={() => {
                setTransactionType('income');
                setCategoryId(null);
              }}>
              <BanknoteArrowUp className="h-8 w-8 text-[#8144e9]" />
              <p>Доход</p>
            </button>
            <button
              type="button"
              className={cn(
                'flex flex-1 flex-col items-center gap-2 px-4 sm:px-10 py-4 rounded-lg cursor-pointer hover:scale-105 transition-transform bg-[#fdf0ec]',
                transactionType === 'expense' && 'border-2 border-[#ee7048]'
              )}
              onClick={() => {
                setTransactionType('expense');
                setCategoryId(null);
              }}>
              <BanknoteArrowUp className="h-8 w-8 rotate-180 text-[#ee7048]" />
              <p>Расход</p>
            </button>
          </div>

          <TransactionAdder
            categories={categories}
            transactionType={transactionType}
            selectedId={categoryId}
            onSelect={setCategoryId}
          />
          <InputAmount
            transactionType={transactionType}
            value={amount}
            onChange={setAmount}
            selectedCategory={selectedCategory}
          />
          <Input name="comment" placeholder="Комментарий (необязательно)" className="mt-4" />

          {state.error ? (
            <p role="alert" className="mt-4 text-sm text-red-600 text-center">
              {state.error}
            </p>
          ) : null}

          <SheetFooter className="px-0 flex-row gap-2">
            <Button type="submit" disabled={!canSubmit || isPending} className="flex-1">
              {isPending ? 'Сохраняем…' : 'Сохранить'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Закрыть
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
