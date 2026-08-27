'use server';

import { InvalidCredentialsError, verifyCredentials } from '@/server/auth.service';
import { createSession } from '@/server/session';
import { registerUser } from '@/server/user.service';
import { registerSchema } from '@/server/validation/auth.schema';
import { redirect } from 'next/navigation';

export type AuthFormState = { error: string | null };

// Пускаем только внутренние пути: '//example.com' браузер трактует как
// внешний адрес, и параметр next превратился бы в открытый редирект.
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const next = safeNext(formData.get('next'));

  try {
    const user = await verifyCredentials({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    });
    await createSession({ userId: user.id, email: user.email });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return { error: error.message };
    }
    console.error('Error in loginAction:', error);
    return { error: 'Не удалось войти. Попробуйте ещё раз.' };
  }

  // redirect работает через исключение, поэтому он снаружи try.
  redirect(next);
}

export async function registerAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const next = safeNext(formData.get('next'));

  const parsed = registerSchema.safeParse({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    name: String(formData.get('name') ?? '') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Проверьте введённые данные' };
  }

  try {
    const user = await registerUser(parsed.data);
    await createSession({ userId: user.id, email: user.email });
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      return { error: 'Пользователь с такой почтой уже зарегистрирован' };
    }
    console.error('Error in registerAction:', error);
    return { error: 'Не удалось создать аккаунт. Попробуйте ещё раз.' };
  }

  redirect(next);
}
