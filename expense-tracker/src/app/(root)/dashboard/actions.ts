'use server';

import prisma from '@/lib/prisma';
import { ACTIVE_WALLET_COOKIE } from '@/server/activeWallet';
import { requireUserId } from '@/server/session';
import { createTransactionSchema } from '@/server/validation/transaction.schema';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export type TransactionFormState = { error: string | null; ok: boolean };

export async function createTransactionAction(
  _prev: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  try {
    const userId = await requireUserId();

    const parsed = createTransactionSchema.safeParse({
      walletId: formData.get('walletId'),
      categoryId: formData.get('categoryId'),
      type: formData.get('type'),
      amount: formData.get('amount'),
      comment: formData.get('comment') || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Проверьте данные', ok: false };
    }

    const { walletId, categoryId, type, amount, comment } = parsed.data;

    // Кошелёк и категория проверяются на принадлежность пользователю:
    // id приходят из формы, то есть от клиента, и доверять им нельзя.
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
    });
    if (!wallet) {
      return { error: 'Кошелёк не найден', ok: false };
    }

    const category = await prisma.category.findFirst({
      where: { id: categoryId, OR: [{ type: 'system' }, { userId }] },
    });
    if (!category) {
      return { error: 'Категория не найдена', ok: false };
    }

    await prisma.transaction.create({
      data: { walletId, categoryId, type, amount, comment, userId },
    });

    revalidatePath('/dashboard');
    return { error: null, ok: true };
  } catch (error) {
    console.error('Error in createTransactionAction:', error);
    return { error: 'Не удалось сохранить транзакцию', ok: false };
  }
}

export async function selectWalletAction(walletId: string) {
  const userId = await requireUserId();

  // Переключить можно только на свой кошелёк.
  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
  });
  if (!wallet) {
    return;
  }

  (await cookies()).set(ACTIVE_WALLET_COOKIE, walletId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath('/dashboard');
}
