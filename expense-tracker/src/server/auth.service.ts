import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { LoginInput, loginSchema } from './validation/auth.schema';

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Неверная почта или пароль');
    this.name = 'InvalidCredentialsError';
  }
}

// Проверяет пару почта-пароль и возвращает пользователя.
// Токен здесь намеренно не выдаётся: сессию ставит вызывающий код,
// у которого есть доступ к кукам.
export async function verifyCredentials(data: LoginInput) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    throw new InvalidCredentialsError();
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  const account = user?.accounts.find((account) => account.provider === 'credentials');

  // Один и тот же ответ на «нет такого пользователя» и «неверный пароль»:
  // иначе форма входа превращается в способ узнать, кто зарегистрирован.
  if (!user || !account?.hashedPassword) {
    throw new InvalidCredentialsError();
  }

  const isValid = await bcrypt.compare(password, account.hashedPassword);
  if (!isValid) {
    throw new InvalidCredentialsError();
  }

  return { id: user.id, email: user.email, name: user.name };
}
