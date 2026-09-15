import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { dayKey } from '@/lib/date-key';

const BLOCKED_AGENTS = /bot|crawler|spider|slurp|baiduspider|bingbot|googlebot|duckduckbot|curl|wget|headless|python-requests/i;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userAgent = request.headers.get('user-agent') ?? '';
  if (BLOCKED_AGENTS.test(userAgent)) {
    return NextResponse.json({ counted: false });
  }

  const result = await prisma.article.updateMany({
    where: { slug: id, isPublished: true },
    data: { views: { increment: 1 } },
  });

  if (result.count > 0) {
    await prisma.pageView.upsert({
      where: { date_articleSlug: { date: dayKey(new Date()), articleSlug: id } },
      create: { date: dayKey(new Date()), articleSlug: id, views: 1 },
      update: { views: { increment: 1 } },
    });
    revalidatePath('/');
  }

  return NextResponse.json({ counted: result.count > 0 });
}