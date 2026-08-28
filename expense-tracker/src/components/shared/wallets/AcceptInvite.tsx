'use client';

import { acceptInviteAction, type ActionState } from '@/app/(root)/wallets/actions';
import { Button } from '@/components/ui/button';
import { useActionState } from 'react';

const initial: ActionState = { error: null, ok: false };

export const AcceptInvite: React.FC<{ token: string }> = ({ token }) => {
  // Переход после успеха делает сам Server Action — здесь только форма.
  const [state, formAction, isPending] = useActionState(acceptInviteAction, initial);

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="token" value={token} />
      <Button type="submit" disabled={isPending} className="w-full h-11 rounded-full">
        {isPending ? 'Присоединяемся…' : 'Присоединиться'}
      </Button>
      {state.error ? (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
    </form>
  );
};
