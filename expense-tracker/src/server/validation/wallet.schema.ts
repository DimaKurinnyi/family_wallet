import z from 'zod';

export const createWalletSchema = z.object({
  name: z.string().trim().min(1, 'Введите название кошелька').max(40),
  type: z.enum(['personal', 'shared']).default('personal'),
});

export const updateWalletSchema = z.object({
  name: z.string().trim().min(1, 'Введите название кошелька').max(40),
});

export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email('Неверный адрес почты'),
});
