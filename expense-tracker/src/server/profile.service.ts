import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { ChangePasswordInput, UpdateNameInput } from './validation/profile.schema';

export class ProfileError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ProfileError';
  }
}

// Почта не меняется намеренно: на неё завязан вход и по ней приходят
// приглашения в кошельки. Смена почты — это отдельная история с
// подтверждением нового адреса, а без него можно потерять доступ к учётке.
export async function updateName(userId: string, data: UpdateNameInput) {
  return prisma.user.update({ where: { id: userId }, data: { name: data.name } });
}

export async function changePassword(userId: string, data: ChangePasswordInput) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'credentials' },
  });

  if (!account?.hashedPassword) {
    throw new ProfileError('У этой учётной записи нет пароля', 400);
  }

  // Текущий пароль спрашиваем всегда: иначе любой, кто дорвался до открытой
  // вкладки, меняет пароль и запирает владельца снаружи.
  const isValid = await bcrypt.compare(data.currentPassword, account.hashedPassword);
  if (!isValid) {
    throw new ProfileError('Текущий пароль неверный', 400);
  }

  await prisma.account.update({
    where: { id: account.id },
    data: { hashedPassword: await bcrypt.hash(data.newPassword, 10) },
  });
}

// Картинку уменьшает браузер перед отправкой, здесь только проверки:
// сервер не обязан верить тому, что прислал клиент.
const MAX_AVATAR_BYTES = 300 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

export async function setAvatar(userId: string, dataUrl: string) {
  const match = /^data:([a-z/+-]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) {
    throw new ProfileError('Не удалось прочитать изображение', 400);
  }

  const [, mime, base64] = match;
  if (!ALLOWED_MIME.includes(mime)) {
    throw new ProfileError('Подойдёт JPEG, PNG или WebP', 400);
  }

  const data = Buffer.from(base64, 'base64');
  if (data.byteLength === 0) {
    throw new ProfileError('Не удалось прочитать изображение', 400);
  }
  if (data.byteLength > MAX_AVATAR_BYTES) {
    throw new ProfileError('Изображение слишком большое', 400);
  }

  const updatedAt = new Date();
  // Метка на пользователе и картинка — одной транзакцией: иначе адрес
  // картинки мог бы обновиться раньше самой картинки.
  await prisma.$transaction([
    prisma.avatar.upsert({
      where: { userId },
      create: { userId, data, mime },
      update: { data, mime },
    }),
    prisma.user.update({ where: { id: userId }, data: { avatarUpdatedAt: updatedAt } }),
  ]);

  return updatedAt;
}

export async function removeAvatar(userId: string) {
  await prisma.$transaction([
    prisma.avatar.deleteMany({ where: { userId } }),
    prisma.user.update({ where: { id: userId }, data: { avatarUpdatedAt: null } }),
  ]);
}

export async function getAvatar(userId: string) {
  return prisma.avatar.findUnique({ where: { userId } });
}
