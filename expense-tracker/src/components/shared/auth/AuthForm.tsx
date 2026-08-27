'use client';

import { loginAction, registerAction, type AuthFormState } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useActionState } from 'react';

const initialState: AuthFormState = { error: null };

const copy = {
  login: {
    title: 'С возвращением',
    subtitle: 'Войдите, чтобы продолжить вести расходы',
    submit: 'Войти',
    pending: 'Входим…',
    footer: 'Ещё нет аккаунта?',
    footerLink: 'Зарегистрироваться',
    footerHref: '/register',
  },
  register: {
    title: 'Создать аккаунт',
    subtitle: 'Общий кошелёк для семьи начинается здесь',
    submit: 'Зарегистрироваться',
    pending: 'Создаём…',
    footer: 'Уже есть аккаунт?',
    footerLink: 'Войти',
    footerHref: '/login',
  },
} as const;

interface Props {
  mode: 'login' | 'register';
  next?: string;
}

export const AuthForm: React.FC<Props> = ({ mode, next }) => {
  const [state, formAction, isPending] = useActionState(
    mode === 'login' ? loginAction : registerAction,
    initialState
  );
  const text = copy[mode];

  return (
    <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl p-8 sm:p-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-800">{text.title}</h1>
      <p className="mt-2 text-sm text-gray-500">{text.subtitle}</p>

      <form action={formAction} className="mt-8 flex flex-col gap-5">
        {next ? <input type="hidden" name="next" value={next} /> : null}

        {mode === 'register' ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Имя</Label>
            <Input id="name" name="name" autoComplete="name" placeholder="Как к вам обращаться" />
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Почта</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder="Минимум 6 символов"
          />
        </div>

        {state.error ? (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending} className="mt-2 h-11 rounded-full text-base">
          {isPending ? text.pending : text.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {text.footer}{' '}
        <Link href={text.footerHref} className="font-semibold text-gray-800 hover:underline">
          {text.footerLink}
        </Link>
      </p>
    </div>
  );
};
