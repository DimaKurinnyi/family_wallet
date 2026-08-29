import prisma from '@/lib/prisma';
import type { UpdateTransactionInput } from './validation/transaction.schema';

export class TransactionError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'TransactionError';
  }
}

// Править и удалять операцию может владелец кошелька или тот, кто её
// внёс. Участник общего кошелька не трогает чужие записи.
async function requireEditable(userId: string, transactionId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { wallet: true },
  });

  if (!transaction) {
    throw new TransactionError('Операция не найдена', 404);
  }

  const isOwner = transaction.wallet.ownerId === userId;
  const isAuthor = transaction.userId === userId;
  if (!isOwner && !isAuthor) {
    throw new TransactionError('Можно менять только свои операции', 403);
  }

  return transaction;
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  data: UpdateTransactionInput
) {
  await requireEditable(userId, transactionId);

  const category = await prisma.category.findFirst({
    where: { id: data.categoryId, OR: [{ type: 'system' }, { userId }] },
  });
  if (!category) {
    throw new TransactionError('Категория не найдена', 400);
  }

  // Тип операции намеренно не меняется: доход и расход — это разные
  // категории и разный смысл записи. Ошиблись — заведите заново.
  return prisma.transaction.update({
    where: { id: transactionId },
    data: {
      amount: data.amount,
      currency: data.currency,
      categoryId: data.categoryId,
      comment: data.comment ?? null,
    },
  });
}

export async function deleteTransaction(userId: string, transactionId: string) {
  await requireEditable(userId, transactionId);
  await prisma.transaction.delete({ where: { id: transactionId } });
}
