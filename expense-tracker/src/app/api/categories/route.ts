import prisma from '@/lib/prisma';
import { requireUserId } from '@/server/session';
import { createCategorySchema } from '@/server/validation/createCategory.schema';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const userId = await requireUserId();

    const categories = await prisma.category.findMany({
      where: {
        OR: [{ type: 'system' }, { type: 'custom', userId }],
      },
      include: { icon: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (e) {
    console.error('Error in GET /api/categories:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body = await req.json();

    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(parsed.error, { status: 400 });
    }

    const { name, iconId, flow } = parsed.data;

    const icon = await prisma.icon.findUnique({ where: { id: iconId } });
    if (!icon || icon.type !== 'custom') {
      return new NextResponse('Icon not found', { status: 400 });
    }

    const existing = await prisma.category.findFirst({
      where: { name, userId },
    });

    if (existing) {
      return new NextResponse('Category already exists', { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        userId,
        iconId,
        flow,
        type: 'custom',
      },
      include: { icon: true },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
