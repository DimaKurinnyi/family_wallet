import prisma from '@/lib/prisma';
import { getUserId } from '@/server/getUserId';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const transactionId = id;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        wallet: true,
      },
    });
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    const isOwner = transaction.wallet.ownerId === userId;
    const isAuthor = transaction.userId === userId;

    if (!isOwner && !isAuthor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /transaction/[id] route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const transactionId = id;
    const body = await request.json();

    const { amount, categoryId, comment, type } = body;

    if (!amount && !categoryId && !type && !comment) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        wallet: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const isOwner = transaction.wallet.ownerId === userId;
    const isAuthor = transaction.userId === userId;

    if (!isOwner && !isAuthor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          OR: [{ type: 'system' }, { userId }],
        },
      });

      if (!category) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
      }
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        ...(amount !== undefined && { amount }),
        ...(categoryId && { categoryId }),
        ...(comment !== undefined && { comment }),
        ...(type && { type }),
      },
    });

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Error in PUT /transaction/[id] route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
