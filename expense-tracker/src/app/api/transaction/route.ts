import prisma from '@/lib/prisma';
import { requireUserId } from '@/server/session';
import { createTransactionSchema } from '@/server/validation/transaction.schema';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body = await req.json();

    const parsed = createTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { walletId, amount, currency, categoryId, comment, type } = parsed.data;

    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
    });
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found or access denied' }, { status: 404 });
    }

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ type: 'system' }, { userId }],
      },
    });
    if (!category) {
      return NextResponse.json({ error: 'Category not found or access denied' }, { status: 404 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        walletId,
        categoryId,
        type,
        amount,
        currency,
        comment,
        userId,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error in POST /transaction route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const userId = await requireUserId();
  const { searchParams } = new URL(req.url);
  const walletId = searchParams.get('walletId');

  try {
    const transaction = await prisma.transaction.findMany({
      where: {
        ...(walletId && { walletId }),
        wallet: {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error in GET /transaction route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
