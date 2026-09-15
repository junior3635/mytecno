import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const readSlugs: unknown = body?.readSlugs;
  const clean = Array.isArray(readSlugs)
    ? readSlugs.filter((s): s is string => typeof s === 'string').slice(0, 50)
    : [];

  let preferred: string[] = [];
  if (clean.length > 0) {
    const read = await prisma.article.findMany({
      where: { slug: { in: clean } },
      select: { categorySlug: true },
    });
    preferred = [...new Set(read.map((a) => a.categorySlug).filter((s): s is string => Boolean(s)))];
  }

  const candidates = await prisma.article.findMany({
    where: { isPublished: true, slug: { notIn: clean } },
    orderBy: { createdAt: 'desc' },
    take: 12,
  });

  const inPreferred = candidates.filter(
    (a) => a.categorySlug && preferred.length > 0 && preferred.includes(a.categorySlug)
  );
  const rest = candidates.filter((a) => !inPreferred.includes(a));

  return NextResponse.json({ articles: [...inPreferred, ...rest].slice(0, 6) });
}