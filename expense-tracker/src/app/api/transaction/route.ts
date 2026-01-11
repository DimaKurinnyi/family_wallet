import prisma from '@/lib/prisma';
import { getUserId } from '@/server/getUserId';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const userId = (await cookies()).get('userId')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorize' }, { status: 401 });
  }
  try {
    const body = await req.json();

    const { walletId, amount, categoryId, comment, type } = body;

    if (!walletId || !amount || !categoryId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 });
    }
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
  const userId = await getUserId();
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
