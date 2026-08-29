'use client';

import { acceptInviteAction, type ActionState } from '@/app/(root)/wallets/actions';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useActionState, useEffect, useRef } from 'react';

const initial: ActionState = { error: null, ok: false };

// Подтверждать нечего: человек вошёл под тем самым адресом, на который
// выписано приглашение. Отправляем форму сами, а кнопка остаётся на
// случай выключенного JavaScript и как запасной путь при ошибке.
export const AutoAcceptInvite: React.FC<{ token: string }> = ({ token }) => {
  const [state, formAction, isPending] = useActionState(acceptInviteAction, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form ref={formRef} action={formAction} className="mt-6">
      <input type="hidden" name="token" value={token} />

      {state.error ? (
        <>
          <p role="alert" className="mb-4 text-sm text-red-600">
            {state.error}
          </p>
          <Button type="submit" disabled={isPending} className="w-full h-11 rounded-full">
            Попробовать снова
          </Button>
        </>
      ) : (
        <Button type="submit" disabled={isPending} className="w-full h-11 rounded-full">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
              Присоединяем…
            </>
          ) : (
            'Присоединиться'
          )}
        </Button>
      )}
    </form>
  );
};
