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
  const { approve } = await req.json();

  if (typeof approve !== 'boolean') {
    return NextResponse.json({ error: 'approve must be a boolean' }, { status: 400 });
  }

  const comment = await prisma.comment.update({
    where: { id },
    data: { isApproved: approve },
  });

  revalidatePath(`/article/${comment.articleId}`);
  return NextResponse.json({ comment });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.comment.findUnique({ where: { id }, select: { articleId: true } });
  if (!existing) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }

  await prisma.comment.delete({ where: { id } });

  revalidatePath(`/article/${existing.articleId}`);
  return NextResponse.json({ success: true });
}