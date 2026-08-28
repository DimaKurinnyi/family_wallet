import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

const INVITE_TTL_DAYS = 7;

// Доступ к кошельку: владелец или участник.
const accessibleBy = (userId: string) => ({
  OR: [{ ownerId: userId }, { members: { some: { userId } } }],
});

export async function getUserWallets(userId: string) {
  return prisma.wallet.findMany({
    where: accessibleBy(userId),
    // По возрастанию: личный кошелёк создаётся при регистрации и остаётся
    // первым в списке, то есть выбором по умолчанию. При сортировке по
    // убыванию активным молча становился бы каждый вновь созданный кошелёк.
    orderBy: { createdAt: 'asc' },
  });
}

export async function createWallet(userId: string, name: string, type: 'personal' | 'shared') {
  // Владельцем становится создатель — и у личного, и у общего. Раньше общий
  // создавался без владельца, и управлять им не мог никто.
  return prisma.wallet.create({ data: { name, type, ownerId: userId } });
}

async function requireOwnedWallet(userId: string, walletId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
  if (!wallet) {
    throw new WalletError('Кошелёк не найден', 404);
  }
  if (wallet.ownerId !== userId) {
    throw new WalletError('Только владелец может это сделать', 403);
  }
  return wallet;
}

export class WalletError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'WalletError';
  }
}

export async function updateWallet(userId: string, walletId: string, name: string) {
  await requireOwnedWallet(userId, walletId);
  return prisma.wallet.update({ where: { id: walletId }, data: { name } });
}

export async function deleteWallet(userId: string, walletId: string) {
  const wallet = await requireOwnedWallet(userId, walletId);

  // Удалять кошелёк с операциями нельзя: они уйдут вместе с историей.
  const transactions = await prisma.transaction.count({ where: { walletId } });
  if (transactions > 0) {
    throw new WalletError('Сначала удалите операции этого кошелька', 400);
  }

  await prisma.wallet.delete({ where: { id: walletId } });
}

// ── участники и приглашения ─────────────────────────────────────────────

export async function getWalletWithPeople(userId: string, walletId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, ...accessibleBy(userId) },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'asc' },
      },
      invites: {
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!wallet) {
    throw new WalletError('Кошелёк не найден', 404);
  }
  return wallet;
}

export async function inviteToWallet(userId: string, walletId: string, email: string) {
  const wallet = await requireOwnedWallet(userId, walletId);

  if (wallet.type !== 'shared') {
    throw new WalletError('Приглашать можно только в общий кошелёк', 400);
  }

  const normalized = email.trim().toLowerCase();

  const owner = await prisma.user.findUnique({ where: { id: wallet.ownerId } });
  if (owner?.email.toLowerCase() === normalized) {
    throw new WalletError('Вы уже владелец этого кошелька', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email: normalized } });
  if (existingUser) {
    const alreadyMember = await prisma.walletMember.findUnique({
      where: { walletId_userId: { walletId, userId: existingUser.id } },
    });
    if (alreadyMember) {
      throw new WalletError('Этот человек уже участник', 400);
    }
  }

  // Повторное приглашение на ту же почту отзывает прежнее, чтобы не
  // копить несколько живых ссылок на один адрес.
  await prisma.walletInvite.updateMany({
    where: { walletId, email: normalized, status: 'pending' },
    data: { status: 'revoked' },
  });

  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  return prisma.walletInvite.create({
    data: {
      walletId,
      email: normalized,
      token: randomBytes(24).toString('base64url'),
      invitedById: userId,
      expiresAt,
    },
  });
}

export async function revokeInvite(userId: string, inviteId: string) {
  const invite = await prisma.walletInvite.findUnique({ where: { id: inviteId } });
  if (!invite) {
    throw new WalletError('Приглашение не найдено', 404);
  }
  await requireOwnedWallet(userId, invite.walletId);
  await prisma.walletInvite.update({ where: { id: inviteId }, data: { status: 'revoked' } });
}

export async function acceptInvite(user: { id: string; email: string }, token: string) {
  const invite = await prisma.walletInvite.findUnique({
    where: { token },
    include: { wallet: true },
  });

  if (!invite || invite.status !== 'pending') {
    throw new WalletError('Приглашение недействительно', 404);
  }
  if (invite.expiresAt < new Date()) {
    throw new WalletError('Срок приглашения истёк', 400);
  }
  // Ссылку можно переслать кому угодно, поэтому сверяем почту.
  if (invite.email !== user.email.toLowerCase()) {
    throw new WalletError('Приглашение выписано на другую почту', 403);
  }
  if (invite.wallet.ownerId === user.id) {
    throw new WalletError('Вы владелец этого кошелька', 400);
  }

  await prisma.$transaction([
    prisma.walletMember.upsert({
      where: { walletId_userId: { walletId: invite.walletId, userId: user.id } },
      update: {},
      create: { walletId: invite.walletId, userId: user.id },
    }),
    prisma.walletInvite.update({
      where: { id: invite.id },
      data: { status: 'accepted', acceptedAt: new Date() },
    }),
  ]);

  return invite.wallet;
}

export async function removeMember(userId: string, walletId: string, memberUserId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
  if (!wallet) {
    throw new WalletError('Кошелёк не найден', 404);
  }

  // Владелец может исключить любого, участник — только выйти сам.
  const isOwner = wallet.ownerId === userId;
  if (!isOwner && memberUserId !== userId) {
    throw new WalletError('Только владелец может исключать участников', 403);
  }

  await prisma.walletMember.deleteMany({ where: { walletId, userId: memberUserId } });
}
