import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/server/jwt';

// Роуты, которые обязаны работать без сессии — иначе войти будет невозможно.
const PUBLIC_API_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/auth/logout'];

// Страницы входа и регистрации: гостю показываем, вошедшего уводим на дашборд.
const AUTH_PAGES = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith('/api');

  if (isApi && PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (AUTH_PAGES.includes(pathname)) {
    return session ? NextResponse.redirect(new URL('/dashboard', req.url)) : NextResponse.next();
  }

  if (session) {
    return NextResponse.next();
  }

  if (isApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Запоминаем, куда человек шёл, чтобы вернуть его туда после входа.
  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // /invite намеренно не защищаем: страница сама зовёт гостя
  // зарегистрироваться и возвращает его обратно по ссылке.
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/expenses/:path*',
    '/wallets/:path*',
    '/login',
    '/register',
  ],
};
