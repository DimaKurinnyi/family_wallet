import z from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Название от 2 символов').max(20, 'Название до 20 символов'),
  // Имя иконки lucide, а не id строки в таблице: набор иконок задаётся
  // интерфейсом, а строка в Icon заводится при первом обращении.
  iconName: z.string().min(1, 'Выберите иконку'),
  // Сторона операции: доход, расход или обе. По умолчанию расход —
  // пользовательские категории почти всегда про траты.
  flow: z.enum(['income', 'expense', 'both']).default('expense'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z
  .object({
    name: z.string().min(2).max(30).optional(),
    iconId: z.string().cuid().optional(),
    flow: z.enum(['income', 'expense', 'both']).optional(),
  })
  .refine((data) => data.name || data.iconId || data.flow, {
    message: 'Nothing to update',
  });
