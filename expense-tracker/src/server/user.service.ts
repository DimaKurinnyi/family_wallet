import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { RegisterInput } from './validation/auth.schema';

export async function registerUser(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      accounts: {
        create: {
          provider: 'credentials',
          providerAccountId: data.email,
          hashedPassword,
          type: 'password',
        },
      },
      wallets: {
        create: {
          name: 'Default Wallet',
          type: 'personal',
        },
      },
    },
    include: {
      accounts: true,
      wallets: true,
    },
  });
  return user;
}
