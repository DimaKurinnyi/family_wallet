// Подпись и проверка сессионного токена. Здесь намеренно нет ни prisma,
// ни next/headers: этот модуль импортирует middleware, а он живёт в Edge,
// где ни то ни другое недоступно.
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'session';

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 дней

export type SessionPayload = {
  userId: string;
  email: string;
};

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET');
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

// Возвращает null вместо исключения: истёкший или подделанный токен —
// это обычное «не авторизован», а не сбой.
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const { userId, email } = payload;
    if (typeof userId !== 'string' || typeof email !== 'string') {
      return null;
    }
    return { userId, email };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE,
} as const;
