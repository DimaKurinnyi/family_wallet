'use server';

import prisma from '@/lib/prisma';
import { isCurrency } from '@/lib/currency';
import { ACTIVE_WALLET_COOKIE } from '@/server/activeWallet';
import { DISPLAY_CURRENCY_COOKIE } from '@/server/displayCurrency';
import { CategoryError, createCategory } from '@/server/category.service';
import { requireUserId } from '@/server/session';
import { deleteTransaction, TransactionError, updateTransaction } from '@/server/transaction.service';
import { createCategorySchema } from '@/server/validation/createCategory.schema';
import { createTransactionSchema, updateTransactionSchema } from '@/server/validation/transaction.schema';
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
      currency: formData.get('currency'),
      comment: formData.get('comment') || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Проверьте данные', ok: false };
    }

    const { walletId, categoryId, type, amount, currency, comment } = parsed.data;

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
      data: { walletId, categoryId, type, amount, currency, comment, userId },
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
  revalidatePath('/expenses');
}

export async function selectCurrencyAction(currency: string) {
  await requireUserId();

  if (!isCurrency(currency)) {
    return;
  }

  (await cookies()).set(DISPLAY_CURRENCY_COOKIE, currency, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath('/dashboard');
  revalidatePath('/expenses');
  revalidatePath('/wallets');
}

export async function updateTransactionAction(
  _prev: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  try {
    const userId = await requireUserId();

    const parsed = updateTransactionSchema.safeParse({
      categoryId: formData.get('categoryId'),
      amount: formData.get('amount'),
      currency: formData.get('currency'),
      comment: formData.get('comment') || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Проверьте данные', ok: false };
    }

    await updateTransaction(userId, String(formData.get('transactionId') ?? ''), parsed.data);

    revalidatePath('/dashboard');
    return { error: null, ok: true };
  } catch (error) {
    if (error instanceof TransactionError) {
      return { error: error.message, ok: false };
    }
    console.error('Error in updateTransactionAction:', error);
    return { error: 'Не удалось сохранить изменения', ok: false };
  }
}

export async function deleteTransactionAction(
  _prev: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  try {
    const userId = await requireUserId();
    await deleteTransaction(userId, String(formData.get('transactionId') ?? ''));
    revalidatePath('/dashboard');
    return { error: null, ok: true };
  } catch (error) {
    if (error instanceof TransactionError) {
      return { error: error.message, ok: false };
    }
    console.error('Error in deleteTransactionAction:', error);
    return { error: 'Не удалось удалить операцию', ok: false };
  }
}

export type NewCategory = {
  id: string;
  name: string;
  iconName: string | null;
  flow: 'income' | 'expense' | 'both';
};

export type CategoryFormState = {
  error: string | null;
  /** Созданная категория — форма сразу выбирает её в списке */
  category: NewCategory | null;
};

export async function createCategoryAction(
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  try {
    const userId = await requireUserId();

    const parsed = createCategorySchema.safeParse({
      name: formData.get('name'),
      iconName: formData.get('iconName'),
      flow: formData.get('flow') ?? undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Проверьте данные', category: null };
    }

    const category = await createCategory(userId, parsed.data);

    // Категория появляется в списках на всех страницах, где выбирают её.
    revalidatePath('/dashboard');
    revalidatePath('/expenses');
    revalidatePath('/wallets');

    return {
      error: null,
      category: {
        id: category.id,
        name: category.name,
        iconName: category.icon?.name ?? null,
        flow: category.flow,
      },
    };
  } catch (error) {
    if (error instanceof CategoryError) {
      return { error: error.message, category: null };
    }
    console.error('Error in createCategoryAction:', error);
    return { error: 'Не удалось создать категорию', category: null };
  }
}
