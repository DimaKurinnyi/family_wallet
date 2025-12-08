import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/getCurrentUser";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in GET route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
