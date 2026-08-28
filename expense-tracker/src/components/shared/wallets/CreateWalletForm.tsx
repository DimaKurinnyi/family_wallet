'use client';

import { createWalletAction, type ActionState } from '@/app/(root)/wallets/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useActionState, useEffect, useRef, useState } from 'react';

const initial: ActionState = { error: null, ok: false };

export const CreateWalletForm = () => {
  const [state, formAction, isPending] = useActionState(createWalletAction, initial);
  const [type, setType] = useState<'personal' | 'shared'>('shared');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Новый кошелёк</h3>
      <input type="hidden" name="type" value={type} />

      <div className="mt-4 flex gap-2">
        {(['personal', 'shared'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setType(option)}
            className={cn(
              'flex-1 rounded-lg border px-3 py-2 text-sm transition-colors',
              type === option ? 'border-[#8144e9] bg-[#f2ecfd]' : 'hover:bg-gray-50'
            )}>
            {option === 'personal' ? 'Личный' : 'Общий'}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Input name="name" required placeholder="Название" aria-label="Название" className="flex-1 min-w-[180px]" />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Создаём…' : 'Создать'}
        </Button>
      </div>

      <p className="mt-2 text-sm text-gray-500">
        В общий кошелёк можно приглашать родных — операции и баланс будут общими.
      </p>

      {state.error ? (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
    </form>
  );
};
