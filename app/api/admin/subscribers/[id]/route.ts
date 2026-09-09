import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.subscriber.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
  }

  await prisma.subscriber.delete({ where: { id } });
  return NextResponse.json({ success: true });
}