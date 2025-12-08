import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Маршруты, которые не требуют авторизации
const publicRoutes = ['/api/auth/login', '/api/auth/register'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Если маршрут публичный → пропускаем
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Проверяем токен
  const token = req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
  }

  try {
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Server misconfiguration: missing JWT_SECRET' }, { status: 500 });
    }

    const decoded = jwt.verify<Record<string, unknown>>(token, process.env.JWT_SECRET);

    // Добавляем userId в заголовки запроса → будет доступно в API
    const requestHeaders = new Headers(req.headers);

    let userId: string | undefined;
    if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
      const raw = (decoded as Record<string, unknown>)['userId'];
      if (typeof raw === 'string' || typeof raw === 'number') {
        userId = String(raw);
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Token payload missing userId' }, { status: 401 });
    }

    requestHeaders.set('x-user-id', userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*'], // middleware работает только на /api
};
