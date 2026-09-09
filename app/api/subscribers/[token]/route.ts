import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

type Params = { params: Promise<{ token: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const { token } = await params;

  const subscriber = await prisma.subscriber.findUnique({ where: { token } });
  if (!subscriber) {
    return NextResponse.json({ error: 'Invalid unsubscribe link' }, { status: 404 });
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}