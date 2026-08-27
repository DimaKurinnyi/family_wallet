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
import { BanknoteArrowUp, Plus } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { InputAmount } from './InputAmount';
import { TransactionAdder, type CategoryOption } from './TransactionAdder';

const initialState: TransactionFormState = { error: null, ok: false };

interface Props {
  categories: CategoryOption[];
  walletId: string | null;
}

export function AddWindow({ categories, walletId }: Props) {
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | ''>('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(createTransactionAction, initialState);

  const reset = () => {
    setTransactionType('');
    setCategoryId(null);
    setAmount('');
  };

  // Успешно сохранили — закрываем панель и чистим форму.
  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      reset();
    }
  }, [state.ok]);

  const canSubmit = Boolean(walletId) && Boolean(transactionType) && Boolean(categoryId) && Number(amount) > 0;

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) reset();
        setOpen(isOpen);
      }}>
      <SheetTrigger asChild>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 p-1.5 bg-white rounded-full">
          <Button
            variant="outline"
            className="rounded-full bg-[#e094c8] shadow-md shadow-[#e094c8] !h-14 !w-14 hover:!bg-[#e094c8] hover:scale-110 transition-transform border-0">
            <Plus className="text-white h-10 w-10" />
          </Button>
        </div>
      </SheetTrigger>

      <SheetContent className="px-3 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-center">Новая операция</SheetTitle>
        </SheetHeader>

        <form action={formAction}>
          <input type="hidden" name="walletId" value={walletId ?? ''} />
          <input type="hidden" name="type" value={transactionType} />
          <input type="hidden" name="categoryId" value={categoryId ?? ''} />
          <input type="hidden" name="amount" value={amount} />

          <div className="flex items-center justify-between *:flex *:flex-col *:items-center *:gap-2 *:cursor-pointer *:hover:scale-105 *:transition-transform *:px-10 *:py-4 *:rounded-lg">
            <button
              type="button"
              className={
                transactionType === 'income'
                  ? 'bg-[#f2ecfd] border-2 border-[#8144e9]'
                  : 'bg-[#f2ecfd]'
              }
              onClick={() => {
                setTransactionType('income');
                setCategoryId(null);
              }}>
              <BanknoteArrowUp className="h-8 w-8 text-[#8144e9]" />
              <p>Доход</p>
            </button>
            <button
              type="button"
              className={
                transactionType === 'expense'
                  ? 'bg-[#fdf0ec] border-2 border-[#ee7048]'
                  : 'bg-[#fdf0ec]'
              }
              onClick={() => {
                setTransactionType('expense');
                setCategoryId(null);
              }}>
              <BanknoteArrowUp className="h-8 w-8 rotate-180 text-[#ee7048]" />
              <p>Расход</p>
            </button>
          </div>

          {transactionType ? (
            <div>
              <TransactionAdder
                categories={categories}
                transactionType={transactionType}
                selectedId={categoryId}
                onSelect={setCategoryId}
              />
              <InputAmount transactionType={transactionType} value={amount} onChange={setAmount} />
              <Input name="comment" placeholder="Комментарий (необязательно)" className="mt-4" />
            </div>
          ) : (
            <p className="mt-8 text-center text-gray-500">
              Выберите, доход это или расход.
            </p>
          )}

          {state.error ? (
            <p role="alert" className="mt-4 text-sm text-red-600 text-center">
              {state.error}
            </p>
          ) : null}

          <SheetFooter className="px-0">
            <Button type="submit" disabled={!canSubmit || isPending}>
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
