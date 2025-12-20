import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { LoginInput, loginSchema } from './validation/auth.schema';

export async function loginUser(data: LoginInput) {
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error('Invalid input');
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      accounts: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const account = user.accounts.find((account) => account.provider === 'credentials');

  if (!account || !account.hashedPassword) {
    throw new Error('User not found or password not found');
  }

  const isValid = await bcrypt.compare(password, account.hashedPassword);

  if (!isValid) {
    throw new Error('Invalid password');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT secret');
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: '7d' });

  return { message: 'Login successful', token, user: { id: user.id, email: user.email, name: user.name } };
}
