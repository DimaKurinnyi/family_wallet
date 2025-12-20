import { getCurrentUser } from '@/server/getCurrentUser';
import { createWalletSchema } from '@/server/validation/wallet.schema';
import { createWallet, getUserWallets } from '@/server/wallet.service';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    const wallets = await getUserWallets(user.id);
    return NextResponse.json(wallets);
  } catch (error) {
    console.error('Error in GET /wallets route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json();
    const parsed = createWalletSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(parsed.error.flatten(), { status: 400 });
    }
    const wallet = await createWallet(user.id, parsed.data.name, parsed.data.type);
    return NextResponse.json(wallet, { status: 201 });
  } catch (error) {
    console.error('Error in POST /wallets route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
