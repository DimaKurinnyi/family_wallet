import z from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(3).max(20),
  iconId: z.string().cuid(),
  // Сторона операции: доход, расход или обе. По умолчанию расход —
  // пользовательские категории почти всегда про траты.
  flow: z.enum(['income', 'expense', 'both']).default('expense'),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(2).max(30).optional(),
    iconId: z.string().cuid().optional(),
    flow: z.enum(['income', 'expense', 'both']).optional(),
  })
  .refine((data) => data.name || data.iconId || data.flow, {
    message: 'Nothing to update',
  });
