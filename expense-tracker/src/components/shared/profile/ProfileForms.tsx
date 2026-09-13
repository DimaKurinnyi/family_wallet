'use client';

import {
  changePasswordAction,
  updateNameAction,
  type ProfileFormState,
} from '@/app/(root)/profile/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useActionState, useEffect, useState } from 'react';

const initialState: ProfileFormState = { error: null, ok: false };

const Status: React.FC<{ state: ProfileFormState; done: string }> = ({ state, done }) =>
  state.error ? (
    <p role="alert" className="text-sm text-red-600">
      {state.error}
    </p>
  ) : state.ok ? (
    <p className="text-sm text-green-600">{done}</p>
  ) : null;

export const NameForm: React.FC<{ name: string }> = ({ name }) => {
  const [state, formAction, isPending] = useActionState(updateNameAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-sm text-gray-500" htmlFor="profile-name">
        Имя
      </label>
      <div className="flex gap-2">
        <Input id="profile-name" name="name" defaultValue={name} maxLength={40} required />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Сохраняем…' : 'Сохранить'}
        </Button>
      </div>
      <Status state={state} done="Имя сохранено" />
    </form>
  );
};

const EMPTY = { currentPassword: '', newPassword: '', repeatPassword: '' };

export const PasswordForm: React.FC = () => {
  // Поля управляемые: React очищает форму после каждой отправки, и из-за
  // опечатки в одном поле пришлось бы набирать заново все три.
  const [fields, setFields] = useState(EMPTY);
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  // А вот после успеха чистим сами: держать пароли в форме незачем.
  useEffect(() => {
    if (state.ok) setFields(EMPTY);
  }, [state.ok]);

  const bind = (field: keyof typeof EMPTY) => ({
    name: field,
    value: fields[field],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      setFields((current) => ({ ...current, [field]: event.target.value })),
  });

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Input
        {...bind('currentPassword')}
        type="password"
        placeholder="Текущий пароль"
        aria-label="Текущий пароль"
        autoComplete="current-password"
        required
      />
      <Input
        {...bind('newPassword')}
        type="password"
        placeholder="Новый пароль"
        aria-label="Новый пароль"
        autoComplete="new-password"
        required
      />
      <Input
        {...bind('repeatPassword')}
        type="password"
        placeholder="Новый пароль ещё раз"
        aria-label="Новый пароль ещё раз"
        autoComplete="new-password"
        required
      />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Меняем…' : 'Сменить пароль'}
        </Button>
        <Status state={state} done="Пароль изменён" />
      </div>
    </form>
  );
};
