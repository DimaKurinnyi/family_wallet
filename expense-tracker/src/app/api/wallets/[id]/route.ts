import { getCurrentUser } from '@/server/getCurrentUser';
import { updateWalletSchema } from '@/server/validation/wallet.schema';
import { deleteWallet, updateWallet } from '@/server/wallet.service';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const parsed = updateWalletSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(parsed.error.flatten(), { status: 400 });
    }

    const wallet = await updateWallet(user.id, params.id, parsed.data.name);
    return NextResponse.json(wallet);
  } catch (error) {
    console.error('Error in PUT /wallets/[id] route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  console.log('🔥 DELETE HANDLER CALLED');
  try {
    const { id } = await context.params;
    console.log('🔥 WALLET ID FROM PARAMS:', id);

    const user = await getCurrentUser();
    console.log('🔥 USER ID:', user.id);

    await deleteWallet(user.id, id);

    console.log('🔥 DELETE FINISHED');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /wallets/[id] route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
