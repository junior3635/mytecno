import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: 'desc' },
    select: { email: true, isActive: true, createdAt: true },
  });

  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [
    'email,status,subscribed_at',
    ...subscribers.map((s) =>
      [esc(s.email), s.isActive ? 'active' : 'unsubscribed', s.createdAt.toISOString()].join(','),
    ),
  ];

  return new NextResponse(rows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}