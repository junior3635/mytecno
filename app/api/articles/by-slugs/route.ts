import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const slugs: unknown = body?.slugs;

  if (!Array.isArray(slugs)) {
    return NextResponse.json({ error: 'slugs array is required' }, { status: 400 });
  }

  const clean = slugs.filter((s): s is string => typeof s === 'string').slice(0, 100);

  const articles = await prisma.article.findMany({
    where: { isPublished: true, slug: { in: clean } },
  });

  const bySlug = Object.fromEntries(articles.map((a) => [a.slug, a]));
  const ordered = clean
    .map((s) => bySlug[s])
    .filter((a): a is NonNullable<typeof bySlug[string]> => Boolean(a));

  return NextResponse.json({ articles: ordered });
}