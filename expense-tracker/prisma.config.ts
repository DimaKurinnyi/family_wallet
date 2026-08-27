import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// datasource нужен только миграциям и introspection — generate обходится без него.
// Раньше здесь стоял env('DATABASE_URL'), который бросает исключение прямо при
// загрузке конфига, и любая команда Prisma падала без переменной окружения.
// Из-за этого на Vercel валился postinstall с prisma generate.
const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});
