// Работа с сессией на стороне сервера: чтение куки, выдача и сброс.
// Единственный источник ответа на вопрос «кто сейчас пользователь».
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, sessionCookieOptions, signSession, verifySession, type SessionPayload } from './jwt';

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifySession(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireUserId(): Promise<string> {
  return (await requireSession()).userId;
}

export async function getCurrentUser() {
  const { userId } = await requireSession();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

// Куку можно ставить только в Server Action или Route Handler —
// при рендере серверного компонента Next это запрещает.
export async function createSession(payload: SessionPayload) {
  const token = await signSession(payload);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}
