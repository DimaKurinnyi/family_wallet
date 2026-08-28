import { getCurrentUser } from '@/server/session';
import { updateWalletSchema } from '@/server/validation/wallet.schema';
import { deleteWallet, updateWallet, WalletError } from '@/server/wallet.service';
import { NextResponse } from 'next/server';

function toResponse(error: unknown, route: string) {
  if (error instanceof WalletError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(`Error in ${route}:`, error);
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const parsed = updateWalletSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(parsed.error.flatten(), { status: 400 });
    }

    const { id } = await params;
    const wallet = await updateWallet(user.id, id, parsed.data.name);
    return NextResponse.json(wallet);
  } catch (error) {
    return toResponse(error, 'PUT /wallets/[id]');
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    await deleteWallet(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toResponse(error, 'DELETE /wallets/[id]');
  }
}
