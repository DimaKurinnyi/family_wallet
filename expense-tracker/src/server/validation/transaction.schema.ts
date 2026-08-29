import { CURRENCIES } from '@/lib/currency';
import { z } from 'zod';

// coerce, потому что через Server Action сумма приходит строкой из FormData,
// а через API — числом из JSON. Схема одна на оба входа.
export const createTransactionSchema = z.object({
  walletId: z.string().min(1, 'Не выбран кошелёк'),
  categoryId: z.string().min(1, 'Выберите категорию'),
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Сумма должна быть больше нуля'),
  currency: z.enum(CURRENCIES),
  comment: z.string().trim().max(200).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
