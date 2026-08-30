import prisma from '@/lib/prisma';
import { CategoryError, createCategory } from '@/server/category.service';
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

    const parsed = createCategorySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(parsed.error, { status: 400 });
    }

    const category = await createCategory(userId, parsed.data);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof CategoryError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error in POST /api/categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
