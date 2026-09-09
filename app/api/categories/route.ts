import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articles: true } } },
  });

  return NextResponse.json({ categories });
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'category';
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await req.json();

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
  }

  const trimmed = name.trim();
  let slug = slugify(trimmed);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    let i = 2;
    while (await prisma.category.findUnique({ where: { slug: `${slug}-${i}` } })) i++;
    slug = `${slug}-${i}`;
  }

  const category = await prisma.category.create({ data: { name: trimmed, slug } });

  revalidatePath('/');
  return NextResponse.json({ category }, { status: 201 });
}
