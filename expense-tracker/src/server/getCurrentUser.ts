import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function getCurrentUser( ) {
  const userId = (await cookies()).get('userId')?.value;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}
