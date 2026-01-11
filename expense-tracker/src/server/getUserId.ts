import { headers } from "next/headers";

export function getUserId(): string {
  const userId = headers().get('x-user-id');
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}
