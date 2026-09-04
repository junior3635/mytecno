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
  const body = await req.json();

  let slug: string | undefined;
  if (typeof body.slug === 'string') {
    const base = body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/(^-|-$)+/g, '') || 'untitled';
    slug = base;
    const existing = await prisma.article.findFirst({ where: { slug, NOT: { id } }, select: { id: true } });
    if (existing) {
      let i = 2;
      while (await prisma.article.findUnique({ where: { slug: `${base}-${i}` } })) i++;
      slug = `${base}-${i}`;
    }
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...(typeof body.title === 'string' && body.title.trim() && { title: body.title.trim() }),
      ...(slug && { slug }),
      ...(typeof body.content === 'string' && { content: body.content }),
      ...(typeof body.category === 'string' && body.category.trim() && { category: body.category.trim() }),
      ...(typeof body.seoTitle === 'string' && { seoTitle: body.seoTitle }),
      ...(typeof body.seoDesc === 'string' && { seoDesc: body.seoDesc }),
      ...(typeof body.isPublished === 'boolean' && { isPublished: body.isPublished }),
    },
  });

  revalidatePath('/');
  revalidatePath('/sitemap.xml');
  revalidatePath(`/article/${article.slug}`);

  return NextResponse.json({ article });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.article.findUnique({ where: { id }, select: { slug: true } });
  await prisma.article.delete({ where: { id } });

  revalidatePath('/');
  revalidatePath('/sitemap.xml');
  if (existing) revalidatePath(`/article/${existing.slug}`);

  return NextResponse.json({ success: true });
}