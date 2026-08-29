// Миграции при сборке. Если строки подключения не видно, шаг не валит
// сборку, а громко предупреждает: заблокированный деплой хуже, чем
// деплой без миграций, которые можно догнать вручную.
import { spawnSync } from 'node:child_process';

const url = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

if (!url) {
  console.warn(
    [
      '',
      '='.repeat(72),
      'МИГРАЦИИ ПРОПУЩЕНЫ: при сборке не видно ни DIRECT_DATABASE_URL, ни DATABASE_URL.',
      '',
      'Схема базы НЕ обновлена. Если в этом деплое есть новые миграции,',
      'приложение упадёт на первом же запросе к изменённым таблицам.',
      '',
      'Чаще всего переменная задана, но недоступна сборке:',
      '  - в Vercel она помечена как Sensitive — такие видны только в рантайме;',
      '  - или не отмечена для окружения, в котором идёт сборка.',
      '',
      'Пока не починено, миграции нужно накатывать вручную:',
      '  DATABASE_URL="..." npx prisma migrate deploy',
      '='.repeat(72),
      '',
    ].join('\n')
  );
  process.exit(0);
}

const result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
