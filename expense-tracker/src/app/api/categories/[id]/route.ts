import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = (await cookies()).get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorize' }, { status: 401 });
    }
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
    const userId = (await cookies()).get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorize' }, { status: 401 });
    }
    const { id } = await params;
    const categoryId = id;
    const body = await request.json();
    const name = body?.name?.trim();
    const iconId = body?.iconId;

    if (!name && !iconId) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    if ((name && name.length < 2) || name.length > 30) {
      return NextResponse.json({ error: 'Name must be between 2 and 30 characters' }, { status: 400 });
    }
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
      },
    });
    return NextResponse.json(update);
  } catch (error) {
    console.error('Error in PUT /categories/[id] route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
