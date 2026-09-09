import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { name } = await req.json();

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  const trimmed = name.trim();
  const slug = trimmed !== existing.name
    ? trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || existing.slug
    : existing.slug;

  const category = await prisma.category.update({
    where: { id },
    data: { name: trimmed, ...(slug !== existing.slug ? { slug } : {}) },
  });

  if (slug !== existing.slug) {
    // Keep articles pointing at the old slug in sync with the rename.
    await prisma.article.updateMany({
      where: { categorySlug: existing.slug },
      data: { categorySlug: slug, category: category.name },
    });
  }

  revalidatePath('/');
  revalidatePath('/sitemap.xml');
  return NextResponse.json({ category });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.category.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  // Detach articles, falling back to the default category.
  await prisma.article.updateMany({
    where: { categorySlug: existing.slug },
    data: { categorySlug: null, category: 'Technology' },
  });

  await prisma.category.delete({ where: { id } });

  revalidatePath('/');
  revalidatePath('/sitemap.xml');
  return NextResponse.json({ success: true });
}