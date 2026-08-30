import prisma from '@/lib/prisma';
import { ICON_NAMES } from '@/components/shared/CategoryIcon';
import type { CreateCategoryInput } from './validation/createCategory.schema';

export class CategoryError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'CategoryError';
  }
}

/**
 * Заводит категорию пользователя. Она видна только ему: system-категории
 * общие, а custom всегда привязана к userId и в выборку другим не попадает.
 *
 * Иконку берём по имени, а не по id: имя — это имя иконки lucide, и список
 * допустимых имён тот же, из которого рисуется CategoryIcon. Строку в
 * таблице Icon создаём при первом обращении, чтобы набор иконок в интерфейсе
 * не зависел от того, прогнали ли на этой базе свежий seed.
 */
export async function createCategory(userId: string, data: CreateCategoryInput) {
  const name = data.name.trim();

  if (!ICON_NAMES.includes(data.iconName)) {
    throw new CategoryError('Такой иконки нет', 400);
  }

  // Имена сравниваем без учёта регистра: «Кофе» и «кофе» — одна категория,
  // и вторую заводить незачем.
  const existing = await prisma.category.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      OR: [{ type: 'system' }, { type: 'custom', userId }],
    },
  });
  if (existing) {
    throw new CategoryError('Категория с таким названием уже есть', 409);
  }

  const icon = await prisma.icon.upsert({
    where: { name_type: { name: data.iconName, type: 'custom' } },
    update: {},
    create: { name: data.iconName, type: 'custom' },
  });

  return prisma.category.create({
    data: { name, iconId: icon.id, flow: data.flow, type: 'custom', userId },
    include: { icon: true },
  });
}
