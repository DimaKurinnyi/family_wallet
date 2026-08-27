import { PrismaPg } from '@prisma/adapter-pg';
import { CategoryFlow, CategoryType, IconType, PrismaClient } from '../src/generated/prisma/client';
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function seedIcons() {
  const icons = [
    // SYSTEM
    { name: 'ShoppingCart', type: IconType.system },
    { name: 'Utensils', type: IconType.system },
    { name: 'Car', type: IconType.system },
    { name: 'Home', type: IconType.system },
    { name: 'HeartPulse', type: IconType.system },
    { name: 'Gamepad2', type: IconType.system },
    { name: 'Wallet', type: IconType.system },
    { name: 'GraduationCap', type: IconType.system },

    // CUSTOM (для пользовательских категорий)
    { name: 'Star', type: IconType.custom },
    { name: 'Gift', type: IconType.custom },
    { name: 'Plane', type: IconType.custom },
    { name: 'GraduationCap', type: IconType.custom },
    { name: 'Music', type: IconType.custom },
  ];

  for (const icon of icons) {
    await prisma.icon.upsert({
      where: {
        name_type: {
          name: icon.name,
          type: icon.type,
        },
      },
      update: {},
      create: icon,
    });
  }
}

async function seedCategories() {
  const systemIcons = await prisma.icon.findMany({
    where: { type: IconType.system },
  });

  const getIcon = (name: string) => {
    const icon = systemIcons.find((i) => i.name === name);
    if (!icon) throw new Error(`System icon "${name}" not found`);
    return icon;
  };

  const E = CategoryFlow.expense;
  const I = CategoryFlow.income;
  const B = CategoryFlow.both;

  const categories = [
    { name: 'Продукты', icon: 'ShoppingCart', flow: E },
    { name: 'Кафе', icon: 'Utensils', flow: E },
    { name: 'Транспорт', icon: 'Car', flow: E },
    { name: 'Такси', icon: 'Car', flow: E },
    { name: 'Аренда', icon: 'Home', flow: E },
    { name: 'Коммуналка', icon: 'Home', flow: E },
    { name: 'Здоровье', icon: 'HeartPulse', flow: E },
    { name: 'Аптека', icon: 'HeartPulse', flow: E },
    { name: 'Развлечения', icon: 'Gamepad2', flow: E },
    { name: 'Подписки', icon: 'Gamepad2', flow: E },
    { name: 'Зарплата', icon: 'Wallet', flow: I },
    { name: 'Бонус', icon: 'Wallet', flow: I },
    { name: 'Подарки', icon: 'ShoppingCart', flow: B },
    { name: 'Дом', icon: 'Home', flow: E },
    { name: 'Путешествия', icon: 'Car', flow: E },
    { name: 'Образование', icon: 'GraduationCap', flow: E },
    { name: 'Музыка', icon: 'Gamepad2', flow: E },
    { name: 'Одежда', icon: 'ShoppingCart', flow: E },
    { name: 'Личное', icon: 'Home', flow: E },
    { name: 'Другое', icon: 'Home', flow: B },
  ];

  for (const category of categories) {
    // Для системных категорий userId = null — сначала проверяем наличие записи, затем создаём при отсутствии
    const existing = await prisma.category.findFirst({
      where: {
        name: category.name,
        userId: null,
      },
    });

    if (existing) {
      // Повторный прогон чинит расхождения в иконке и стороне операции.
      await prisma.category.update({
        where: { id: existing.id },
        data: { iconId: getIcon(category.icon).id, flow: category.flow },
      });
    } else {
      await prisma.category.create({
        data: {
          name: category.name,
          type: CategoryType.system,
          iconId: getIcon(category.icon).id,
          flow: category.flow,
          userId: null,
        },
      });
    }
  }
}

async function main() {
  await seedIcons();
  await seedCategories();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
