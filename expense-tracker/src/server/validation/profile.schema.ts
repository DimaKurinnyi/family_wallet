import { z } from 'zod';

export const updateNameSchema = z.object({
  name: z.string().trim().min(2, 'Имя от 2 символов').max(40, 'Имя до 40 символов'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Введите текущий пароль'),
  newPassword: z.string().min(6, 'Новый пароль от 6 символов').max(72, 'Пароль до 72 символов'),
  repeatPassword: z.string(),
});

/**
 * Сверки между полями — отдельным шагом, после разбора самих полей.
 * В .refine() на объекте они срабатывали и тогда, когда поле не прошло свою
 * проверку: при пустом текущем пароле человек видел «Пароли не совпадают»
 * вместо «Введите текущий пароль».
 */
export function checkPasswordPair(data: ChangePasswordInput) {
  if (data.newPassword !== data.repeatPassword) {
    return 'Пароли не совпадают';
  }
  if (data.newPassword === data.currentPassword) {
    return 'Новый пароль совпадает с текущим';
  }
  return null;
}

export type UpdateNameInput = z.infer<typeof updateNameSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
