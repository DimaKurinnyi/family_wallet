import { requireUserId } from '@/server/session';
import { deleteTransaction, TransactionError, updateTransaction } from '@/server/transaction.service';
import { updateTransactionSchema } from '@/server/validation/transaction.schema';
import { NextResponse } from 'next/server';

function toResponse(error: unknown, route: string) {
  if (error instanceof TransactionError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(`Error in ${route}:`, error);
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await deleteTransaction(userId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return toResponse(error, 'DELETE /transaction/[id]');
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await request.json();

    const parsed = updateTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await updateTransaction(userId, id, parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    return toResponse(error, 'PUT /transaction/[id]');
  }
}
