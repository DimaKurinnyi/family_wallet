import { registerSchema } from '@/server/auth.schema';
import { registerUser } from '@/server/user.service';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const user = await registerUser(parsed.data);
    return NextResponse.json({ message: 'User created', user }, { status: 201 });
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
