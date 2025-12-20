import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized: missing token' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);

    const userId = payload.userId as string | undefined;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: invalid token payload' },
        { status: 401 }
      );
    }

    const response = NextResponse.next();
    response.cookies.set('userId', userId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('JWT VERIFY ERROR (EDGE):', error);

    return NextResponse.json(
      { error: 'Unauthorized: invalid or expired token' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ['/api/:path*'],
};

