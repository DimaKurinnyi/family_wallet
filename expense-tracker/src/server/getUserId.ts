import { cookies } from 'next/headers';

export async function getUserId() {
  const userId = (await cookies()).get('userId')?.value;
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}
