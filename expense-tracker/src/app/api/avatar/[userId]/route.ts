import { getAvatar } from '@/server/profile.service';
import { requireUserId } from '@/server/session';
import { NextResponse } from 'next/server';

// Картинка отдаётся отдельным адресом, а не data-URL внутри страницы:
// иначе каждый ответ сервера таскал бы её с собой, а так браузер забирает
// её один раз и держит в кеше.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Аватары видны только вошедшим: в общем кошельке участники видят друг
    // друга, а посторонним показывать лица незачем.
    await requireUserId();

    const { userId } = await params;
    const avatar = await getAvatar(userId);
    if (!avatar) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(new Uint8Array(avatar.data), {
      headers: {
        'Content-Type': avatar.mime,
        // Адрес меняется вместе с меткой времени, поэтому кешировать можно
        // надолго: новая картинка приедет по новому адресу.
        'Cache-Control': 'private, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse(null, { status: 401 });
  }
}
