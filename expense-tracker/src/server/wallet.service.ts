import prisma from '@/lib/prisma';

export async function getUserWallets(userId: string) {
  return prisma.wallet.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    // По возрастанию: личный кошелёк создаётся при регистрации и остаётся
    // первым в списке, то есть выбором по умолчанию. При сортировке по
    // убыванию активным молча становился бы каждый вновь созданный кошелёк.
    orderBy: {
      createdAt: 'asc',
    },
  });
}

export async function createWallet(userId: string, name: string, type: 'personal' | 'shared') {
  const wallet = await prisma.wallet.create({
    data: {
      name,
      type,
      ownerId: type === 'personal' ? userId : null,
      members: type === 'shared' ? { create: { userId } } : undefined,
    },
  });
  return wallet;
}
export async function updateWallet(userId: string, walletId: string, name: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
  });
  if (!wallet) {
    throw new Error('Wallet not found');
  }
  if (wallet.ownerId !== userId) {
    throw new Error('Forbidden');
  }

  return prisma.wallet.update({
    where: { id: walletId },
    data: { name },
  });
}

// export async function deleteWallet(userId: string, walletId: string) {
//   const wallet = await prisma.wallet.findUnique({
//     where: { id: walletId },
//   });
//   if (!wallet) {
//     throw new Error('Wallet not found');
//   }
//   if (wallet.ownerId !== userId) {
//     throw new Error('Forbidden');
//   }

//   prisma.wallet.delete({
//     where: { id: walletId },
//   });
// }
export async function deleteWallet(userId: string, walletId: string) {
  console.log('🧩 deleteWallet called', { userId, walletId });

  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
  });

  console.log('🧩 wallet from DB:', wallet);

  if (!wallet) throw new Error('Wallet not found');

  if (wallet.ownerId !== userId) {
    throw new Error('Forbidden');
  }

  const deleted = await prisma.wallet.delete({
    where: { id: walletId },
  });

  console.log('🧩 deleted wallet:', deleted);
}