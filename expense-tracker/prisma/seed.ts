import { PrismaPg } from '@prisma/adapter-pg';
import { CategoryType, IconType, PrismaClient } from '../src/generated/prisma/client';
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

  const categories = [
    { name: 'Продукты', icon: 'ShoppingCart' },
    { name: 'Кафе', icon: 'Utensils' },
    { name: 'Транспорт', icon: 'Car' },
    { name: 'Такси', icon: 'Car' },
    { name: 'Аренда', icon: 'Home' },
    { name: 'Коммуналка', icon: 'Home' },
    { name: 'Здоровье', icon: 'HeartPulse' },
    { name: 'Аптека', icon: 'HeartPulse' },
    { name: 'Развлечения', icon: 'Gamepad2' },
    { name: 'Подписки', icon: 'Gamepad2' },
    { name: 'Зарплата', icon: 'Wallet' },
    { name: 'Бонус', icon: 'Wallet' },
    { name: 'Подарки', icon: 'ShoppingCart' },
    { name: 'Дом', icon: 'Home' },
    { name: 'Путешествия', icon: 'Car' },
    { name: 'Образование', icon: 'GraduationCap' }, // fallback system icon
    { name: 'Музыка', icon: 'Gamepad2' },
    { name: 'Одежда', icon: 'ShoppingCart' },
    { name: 'Личное', icon: 'Home' },
    { name: 'Другое', icon: 'Home' },
  ];

  for (const category of categories) {
    // Для системных категорий userId = null — сначала проверяем наличие записи, затем создаём при отсутствии
    const existing = await prisma.category.findFirst({
      where: {
        name: category.name,
        userId: null,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: category.name,
          type: CategoryType.system,
          iconId: getIcon(category.icon).id,
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
