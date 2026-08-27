import { InvalidCredentialsError, verifyCredentials } from '@/server/auth.service';
import { createSession } from '@/server/session';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await verifyCredentials(body);
    await createSession({ userId: user.id, email: user.email });
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Error in POST /api/auth/login:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
