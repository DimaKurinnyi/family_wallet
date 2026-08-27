import { createSession } from '@/server/session';
import { registerUser } from '@/server/user.service';
import { registerSchema } from '@/server/validation/auth.schema';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const user = await registerUser(parsed.data);
    // Сразу выдаём сессию: заставлять входить второй раз после регистрации незачем.
    await createSession({ userId: user.id, email: user.email });

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
