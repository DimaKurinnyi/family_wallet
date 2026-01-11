import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const icons = await prisma.icon.findMany({ where: { type: 'custom' }, orderBy: { name: 'asc' } });
    return NextResponse.json(icons);
  } catch (error) {
    console.error('Error in GET /icons route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
