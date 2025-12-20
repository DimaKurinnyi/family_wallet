import { getCurrentUser } from '@/server/getCurrentUser';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in GET route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
