import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateImagesForArticle } from '@/lib/ai/image';

type Params = { params: Promise<{ id: string }> };

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Separate budget from article generation, so image work doesn't consume article rate limits.
  const limitKey = `images:${session.email || 'unknown'}`;
  if (!checkRateLimit(limitKey, 30, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Image generation rate limit exceeded. Try again in a few minutes.' },
      { status: 429 }
    );
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const only = Array.isArray(body?.only) ? body.only.filter((s: unknown) => typeof s === 'string') : undefined;
  const includeHero = typeof body?.includeHero === 'boolean' ? body.includeHero : undefined;

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  try {
    const result = await generateImagesForArticle({
      article: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        content: article.content,
        category: article.category,
        featuredImage: article.featuredImage,
        imageMeta: article.imageMeta,
      },
      only,
      includeHero,
    });

    const imageError = result.errors[0];
    const status = imageError ? 500 : 200;

    revalidatePath('/');
    revalidatePath('/sitemap.xml');
    revalidatePath(`/article/${article.slug}`);

    return NextResponse.json(
      {
        success: imageError ? false : true,
        generated: result.generated,
        errors: result.errors,
        content: result.content,
        featuredImage: result.featuredImage,
        imageIds: result.metas.map((m) => ({ imageId: m.imageId, status: m.status, url: m.url })),
        ...(imageError
          ? { error: `${imageError.imageId}: ${imageError.message}` }
          : {}),
      },
      { status }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}