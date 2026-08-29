import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Миграциям нужна прямая строка подключения, а не пул. Пулер Neon работает
// в режиме транзакций и не отдаёт сессионные блокировки, на которых держится
// prisma migrate. Приложение при этом ходит через пул: src/lib/prisma.ts
// читает DATABASE_URL сам и этой настройки не касается.
//
// В Prisma 7 у datasource нет поля directUrl, поэтому выбираем строку здесь.
const migrationUrl = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

// datasource нужен только миграциям и introspection — generate обходится без
// него. Раньше здесь стоял env('DATABASE_URL'), который бросает исключение
// прямо при загрузке конфига, и любая команда Prisma падала без переменной.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  ...(migrationUrl ? { datasource: { url: migrationUrl } } : {}),
});
