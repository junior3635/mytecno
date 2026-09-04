import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { generateTechArticle, generateArticleMetadata, generateArticleImage, generateImage } from '@/lib/ai';
import { saveImageFromDataUrl } from '@/lib/images';
import { parseArticlePayload, replaceImageSources } from '@/lib/article-content';
import { log } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

const RATE_LIMIT_PER_HOUR = 5;

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limitKey = session.email || 'unknown';
    if (!checkRateLimit(limitKey, RATE_LIMIT_PER_HOUR, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: `Rate limit exceeded. You can generate up to ${RATE_LIMIT_PER_HOUR} articles per hour.` },
        { status: 429 }
      );
    }

    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // 1. Load site settings (aiModel, autoPublish)
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });
    const aiModel = settings?.aiModel || 'gemini-3.6-flash';

    // 2. Generate Article Content + structured image metadata (JSON payload)
    const contentRaw = await generateTechArticle(topic, aiModel) || '';
    const { html: content, images: articleImages } = parseArticlePayload(contentRaw);

    // 3. Generate Metadata
    const metadata = await generateArticleMetadata(topic, content, aiModel);

    const title = metadata.title || 'Untitled';

    // 3. Generate Slug from Title, ensuring it's unique in the database
    async function generateUniqueSlug(title: string): Promise<string> {
      const base = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || 'untitled';

      let candidate = base;
      for (let i = 2; ; i++) {
        const exists = await prisma.article.findUnique({ where: { slug: candidate }, select: { id: true } });
        if (!exists) return candidate;
        candidate = `${base}-${i}`;
      }
    }

    const slug = await generateUniqueSlug(title);

    // 4. Generate every in-article image from its structured image metadata.
    //    Each image has a defined section, purpose, and prompt, so the result is
    //    far more relevant than generating from the topic alone.
    let finalContent = content;

    if (articleImages.length > 0) {
      const urls = await Promise.all(
        articleImages.map(async ({ prompt }, idx) => {
          const dataUrl = await generateImage(prompt);
          const suffix = `${slug}-${idx + 1}`;
          return saveImageFromDataUrl(dataUrl, suffix);
        })
      );
      finalContent = replaceImageSources(finalContent, urls);
      log('info', 'generate_article', 'In-article images generated', { count: urls.length, slug });
    }

    // 5. Generate Featured Image and save it to public/uploads (avoids base64 blobs in SQLite)
    const heroDataUrl = await generateArticleImage(topic, title);
    const featuredImage = saveImageFromDataUrl(heroDataUrl, slug);

    // 6. Save to Database (publish only if autoPublish is enabled)
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content: finalContent,
        category: 'Technology',
        seoTitle: title,
        seoDesc: metadata.description || '',
        featuredImage,
        isPublished: settings?.autoPublish ?? false,
      },
    });

    await prisma.log.create({
      data: {
        action: 'generate_article',
        message: `Successfully generated article with image: ${title}`,
        success: true,
      },
    });

    log('info', 'generate_article', 'Article generated', { title, slug });

    revalidatePath('/');
    revalidatePath('/sitemap.xml');

    return NextResponse.json({ success: true, article });
  } catch (error: unknown) {
    log('error', 'generate_article', 'Article generation failed', {
      error: error instanceof Error ? error.message : String(error),
    });

    const message = error instanceof Error ? error.message : 'Unknown error';

    await prisma.log.create({
      data: {
        action: 'generate_article',
        message: `Failed to generate article: ${message}`,
        success: false,
      },
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
