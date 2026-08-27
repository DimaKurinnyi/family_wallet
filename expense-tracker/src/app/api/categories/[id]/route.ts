import prisma from '@/lib/prisma';
import { requireUserId } from '@/server/session';
import { updateCategorySchema } from '@/server/validation/createCategory.schema';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const categoryId = id;

    const categories = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });
    if (!categories) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (categories.type === 'system') {
      return NextResponse.json({ error: 'Cannot delete system category' }, { status: 400 });
    }

    if (categories.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (categories._count.transactions > 0) {
      return NextResponse.json({ error: 'Cannot delete category with associated transactions' }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /categories/[id] route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const categoryId = id;
    const body = await request.json();

    // Раньше проверки были ручными, и на запросе с одной лишь иконкой
    // выражение name.length падало на undefined.
    const parsed = updateCategorySchema.safeParse({
      name: typeof body?.name === 'string' ? body.name.trim() : undefined,
      iconId: body?.iconId,
      flow: body?.flow,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { name, iconId, flow } = parsed.data;
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    if (category.type === 'system') {
      return NextResponse.json({ error: 'Cannot update system category' }, { status: 400 });
    }
    if (category.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (name) {
      const duplicate = await prisma.category.findFirst({
        where: { name, userId, NOT: { id: categoryId }, type: 'custom' },
      });
      if (duplicate) {
        return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
      }
    }
    if (iconId) {
      const icon = await prisma.icon.findUnique({
        where: { id: iconId },
      });
      if (!icon || icon.type !== 'custom') {
        return NextResponse.json({ error: 'Invalid icon' }, { status: 404 });
      }
    }
    const update = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(name && { name }),
        ...(iconId && { iconId }),
        ...(flow && { flow }),
      },
    });
    return NextResponse.json(update);
  } catch (error) {
    console.error('Error in PUT /categories/[id] route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
