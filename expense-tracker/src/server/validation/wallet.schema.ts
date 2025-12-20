import z from 'zod';

export const createWalletSchema = z.object({
  name: z.string().min(1, 'Wallet name is required'),
  type: z.enum(['personal', 'shared']).default('personal'),
});

export const updateWalletSchema = z.object({
  name: z.string().min(1, 'Wallet name is required'),
});
