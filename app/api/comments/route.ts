import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

const MAX_BODY = 1000;
const MAX_NAME = 60;

// Public: list approved comments for an article (?articleId=...)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get('articleId');

  if (!articleId) {
    return NextResponse.json({ error: 'articleId is required' }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { articleId, isApproved: true },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      body: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ comments });
}

// Public: submit a comment (goes to moderation queue)
export async function POST(req: Request) {
  const { articleId, name, email, body } = await req.json();

  if (!articleId || typeof articleId !== 'string') {
    return NextResponse.json({ error: 'articleId is required' }, { status: 400 });
  }
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
  }
  if (typeof body === 'string' && body.trim().length > MAX_BODY) {
    return NextResponse.json({ error: `Comment must be under ${MAX_BODY} characters` }, { status: 400 });
  }
  if (email && typeof email === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, isPublished: true },
  });
  if (!article || !article.isPublished) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: {
      articleId,
      name: name.trim().slice(0, MAX_NAME),
      email: email ? email.trim() : null,
      body: body.trim().slice(0, MAX_BODY),
      isApproved: false,
    },
  });

  return NextResponse.json({
    comment: { id: comment.id, name: comment.name, createdAt: comment.createdAt, isApproved: false },
    message: 'Thanks! Your comment is awaiting moderation.',
  }, { status: 201 });
}