import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { generateTechArticle, generateArticleMetadata } from '@/lib/ai';
import { buildArticleImagePrompt } from '@/lib/ai/prompts';
import {
  parseArticlePayload,
  buildImageMetaFromImages,
  serializeImageMeta,
  setPendingPlaceholderSrc,
  type StoredImageMeta,
} from '@/lib/article-content';
import { log } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { submitJob } from '@/lib/generation-queue';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

const RATE_LIMIT_PER_HOUR = 50;

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

    const { topic, categorySlug } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Run the whole pipeline through a serial queue so concurrent requests
    // don't overstress the AI provider (improvement #30).
    const article = await submitJob(async () => {
      // 1. Load site settings (aiModel, autoPublish)
      const settings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });
      const aiModel = settings?.aiModel || 'gemini-3.6-flash';

      // Resolve the requested category (falls back to Technology).
      let categoryName = 'Technology';
      let categorySlugResolved: string | null = null;
      if (categorySlug && typeof categorySlug === 'string') {
        const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
        if (cat) {
          categoryName = cat.name;
          categorySlugResolved = cat.slug;
        }
      } else {
        const defaultCat = await prisma.category.findUnique({ where: { slug: 'technology' } });
        if (defaultCat) {
          categoryName = defaultCat.name;
          categorySlugResolved = defaultCat.slug;
        }
      }

      // 2. Generate Article Content + structured image metadata (JSON payload)
      const contentRaw = await generateTechArticle(topic, aiModel) || '';
      const { html: rawContent, images: articleImages } = parseArticlePayload(contentRaw);

      // 3. Generate Metadata
      const metadata = await generateArticleMetadata(topic, rawContent, aiModel);

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

      // 4. Build image metadata — the pipeline runs object images (hero, in-body)
      //    in a SEPARATE step via POST /api/articles/[id]/images, never inside
      //    this article-generation prompt/call. In-body <img> srcs are pointed at
      //    a branded placeholder until their images are generated.
      const inBodyMetas = buildImageMetaFromImages(articleImages);
      const heroMetaData: StoredImageMeta = {
        imageId: 'hero',
        prompt: buildArticleImagePrompt(topic, title),
        section: 'Featured image',
        purpose: 'Featured image of the article',
        alt: title,
        caption: '',
        status: 'pending',
        url: null,
        kind: 'ai',
      };
      const imageMeta: StoredImageMeta[] = [heroMetaData, ...inBodyMetas];
      const content = setPendingPlaceholderSrc(rawContent);

      // 5. Save to Database (publish only if autoPublish is enabled).
      //    featuredImage is generated in the image pipeline, so it starts null.
      const article = await prisma.article.create({
        data: {
          title,
          slug,
          content,
          category: categoryName,
          categorySlug: categorySlugResolved,
          seoTitle: title,
          seoDesc: metadata.description || '',
          featuredImage: null,
          imageMeta: serializeImageMeta(imageMeta),
          isPublished: settings?.autoPublish ?? false,
        },
      });

      await prisma.log.create({
        data: {
          action: 'generate_article',
          message: `Successfully generated article draft: ${title}`,
          success: true,
        },
      });

      log('info', 'generate_article', 'Article generated', { title, slug });

      revalidatePath('/');
      revalidatePath('/sitemap.xml');

      return article;
    });

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
