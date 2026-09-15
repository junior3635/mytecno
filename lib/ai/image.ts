import prisma from '@/lib/db';
import { PROVIDERS } from '@/lib/ai/providers';
import type { ProviderId } from '@/lib/ai/types';
import { imageModelFor, imageStyleTail } from '@/lib/ai/models';
import { generateImageWith, hasProviderApiKey } from '@/lib/ai';
import { saveImageFromDataUrl } from '@/lib/images';
import { log } from '@/lib/logger';
import {
  PENDING_IMAGE_SRC,
  parseImageMeta,
  serializeImageMeta,
  replaceImageSources,
  setPendingPlaceholderSrc,
  type StoredImageMeta,
} from '@/lib/article-content';

// ---------------------------------------------------------------------------
// Curated stock library (Unsplash direct CDN URLs – intentionally stable)
// ---------------------------------------------------------------------------

const STOCK_BY_CATEGORY: Record<string, string[]> = {
  technology: [
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    'https://images.unsplash.com/photo-1518770660439-4636190af475',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1',
  ],
  food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
  ],
  news: [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e',
  ],
  trends: [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
  ],
  guides: [
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    'https://images.unsplash.com/photo-1553484771-371a605b060b',
  ],
  reviews: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f',
  ],
  default: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3',
  ],
};

function hashStr(s: string): number {
  let h = 0;
  for (const c of s) h = ((h * 31 + c.charCodeAt(0)) >>> 0) % 2147483647;
  return h;
}

function stockPhotoUrl(category: string, seed: string): string {
  const key = category?.trim().toLowerCase() || 'default';
  const list = STOCK_BY_CATEGORY[key] ?? STOCK_BY_CATEGORY.default;
  return list[hashStr(seed) % list.length];
}

async function fetchStockImageDataUrl(category: string, seed: string): Promise<string> {
  const base = stockPhotoUrl(category, seed);
  const url = `${base}?auto=format&fit=crop&w=1200&q=80`;
  const res = await fetch(url, { headers: { 'User-Agent': 'MyTechNews/1.0' } });
  if (!res.ok) throw new Error(`Stock image fetch failed (${res.status})`);
  const mime = res.headers.get('content-type') ?? 'image/jpeg';
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:${mime};base64,${buf.toString('base64')}`;
}

// ---------------------------------------------------------------------------
// Branded placeholder (when no image source is available)
// ---------------------------------------------------------------------------

function placeholderDataUrl(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#000000"/>
        <stop offset="50%" stop-color="#0a0a1a"/>
        <stop offset="100%" stop-color="#001a1a"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#g)"/>
    <circle cx="1100" cy="80" r="200" fill="#00f2fe" opacity="0.05"/>
    <circle cx="100" cy="550" r="150" fill="#fe0979" opacity="0.05"/>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ---------------------------------------------------------------------------
// Image pipeline configuration (reads SiteSettings.image* columns)
// ---------------------------------------------------------------------------

export type ImagePipelineConfig = {
  provider: string;
  model: string | null;
  style: string;
  fallback: 'placeholder' | 'stock';
};

export async function getImageConfig(): Promise<ImagePipelineConfig> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });
  return {
    provider: settings?.imageProvider || 'auto',
    model: settings?.imageModel || null,
    style: settings?.imageStyle || 'editorial',
    fallback: settings?.imageFallback === 'stock' ? 'stock' : 'placeholder',
  };
}

// ---------------------------------------------------------------------------
// Prompt builder (dedicated, separate from article-generation prompt)
// ---------------------------------------------------------------------------

export function buildImagePrompt(
  meta: {
    prompt?: string;
    purpose?: string;
    section?: string;
    alt?: string;
    caption?: string;
    aspectRatio?: string;
  },
  styleKey: string | null | undefined
): string {
  const styleTail = imageStyleTail(styleKey);
  const parts = [
    'Create an editorial image for a technology news article.',
    meta.purpose ? `Purpose: ${meta.purpose}` : '',
    meta.section ? `Where it appears: ${meta.section}` : '',
    meta.caption ? `Caption to accompany: ${meta.caption}` : '',
    meta.alt ? `Subject visible in image: ${meta.alt}` : '',
    `Style: ${styleTail}`,
    `Aspect ratio: ${meta.aspectRatio || '16:9'} (landscape, widescreen).`,
    'No readable text, no watermarks, no logos, no brand elements.',
  ]
    .filter(Boolean)
    .join('\n');

  if (meta.prompt) {
    return `${parts}\n\nOriginal image brief from article draft:\n${meta.prompt}`;
  }
  return parts;
}

// ---------------------------------------------------------------------------
// Provider resolution for the image pipeline
// ---------------------------------------------------------------------------

const IMAGE_PROVIDER_ORDER: ProviderId[] = ['gemini', 'openai'];

async function pickImageProvider(
  requested: string,
  settingsProvider?: string | null
): Promise<{ provider: ProviderId; model: string } | null> {
  if (requested === 'none') return null;

  if (requested === 'gemini' || requested === 'openai') {
    const id = requested;
    const p = PROVIDERS[id];
    const model = imageModelFor(id);
    if (!model) return null;
    if (await hasProviderApiKey(p)) return { provider: id, model };
    return null;
  }

  // auto / unrecognized: try the text provider's native image model, then peers.
  const order: ProviderId[] = [settingsProvider as ProviderId, ...IMAGE_PROVIDER_ORDER].filter(
    (id): id is ProviderId => id in PROVIDERS && IMAGE_PROVIDER_ORDER.includes(id as ProviderId)
  );
  const seen = new Set<string>();

  for (const id of order) {
    if (seen.has(id)) continue;
    seen.add(id);
    const p = PROVIDERS[id];
    const model = imageModelFor(id);
    if (!model || !p.generateImage) continue;
    if (await hasProviderApiKey(p)) return { provider: id, model };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Concurrency-safe map
// ---------------------------------------------------------------------------

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let i = 0;

  async function runNext(): Promise<void> {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, runNext);
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Single image generation
// ---------------------------------------------------------------------------

type GenerateOneResult = { url: string | null; kind: StoredImageMeta['kind'] };

async function generateOne(
  config: ImagePipelineConfig,
  meta: StoredImageMeta,
  category: string,
  seedBase: string,
  textProvider: string | null
): Promise<GenerateOneResult> {
  // 1. Try the requested AI provider.
  if (config.provider !== 'stock') {
    const resolved = await pickImageProvider(config.provider, textProvider);
    if (resolved) {
      try {
        const prompt = buildImagePrompt(meta, config.style);
        const dataUrl = await generateImageWith(prompt, {
          providerId: resolved.provider,
          model: config.model ?? resolved.model,
        });
        const safeName = `${seedBase.replace(/[^a-z0-9-]+/gi, '-').replace(/(^-|-$)+/g, '') || 'img'}`;
        const savedUrl = saveImageFromDataUrl(dataUrl, safeName);
        return { url: savedUrl, kind: 'ai' };
      } catch (error) {
        log('warn', 'image_pipeline', 'AI image generation failed, falling back', {
          provider: resolved.provider,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  // 2. Stock fallback.
  if (config.fallback === 'stock' || config.provider === 'stock') {
    try {
      const dataUrl = await fetchStockImageDataUrl(category, seedBase);
      const safeName = `${seedBase.replace(/[^a-z0-9-]+/gi, '-').replace(/(^-|-$)+/g, '') || 'img'}`;
      const savedUrl = saveImageFromDataUrl(dataUrl, safeName);
      return { url: savedUrl, kind: 'stock' };
    } catch (error) {
      log('warn', 'image_pipeline', 'Stock image fetch failed, using placeholder', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // 3. Branded placeholder.
  const dataUrl = placeholderDataUrl();
  const safeName = `placeholder-${seedBase.replace(/[^a-z0-9-]+/gi, '-').replace(/(^-|-$)+/g, '')}`;
  const savedUrl = saveImageFromDataUrl(dataUrl, safeName);
  return { url: savedUrl, kind: 'placeholder' };
}

// ---------------------------------------------------------------------------
// Public: generate / regenerate images for a saved article
// ---------------------------------------------------------------------------

export type GenerateImagesResult = {
  metas: StoredImageMeta[];
  content: string;
  featuredImage: string | null;
  generated: number;
  errors: { imageId: string; message: string }[];
};

export async function generateImagesForArticle(options: {
  article: {
    id: string;
    slug: string;
    title: string;
    content: string;
    category: string;
    featuredImage: string | null;
    imageMeta: string | null;
  };
  only?: string[];
  includeHero?: boolean;
}): Promise<GenerateImagesResult> {
  const { article, only, includeHero } = options;
  const config = await getImageConfig();
  const metas = parseImageMeta(article.imageMeta);

  // Build a hero meta when missing (legacy articles, first run).
  if (!metas.some((m) => m.imageId === 'hero')) {
    metas.unshift({
      imageId: 'hero',
      prompt: '',
      section: 'Featured image',
      purpose: 'Featured image of the article',
      alt: article.title ?? '',
      caption: '',
      status: article.featuredImage ? 'done' : 'pending',
      url: article.featuredImage,
      kind: 'ai',
    });
  }

  // For legacy articles without per-image prompts, fill minimal context.
  metas.forEach((m, i) => {
    if (m.imageId !== 'hero' && !m.prompt) {
      m.prompt = `Photo relevant to the section "${m.section || `Section ${i}`}"`;
    }
  });

  const selectedIds = new Set(only ?? []);
  const hasSelection = selectedIds.size > 0;
  const includeHeroSelected = hasSelection
    ? selectedIds.has('hero')
    : includeHero !== false;
  const textProvider = await prisma.siteSettings
    .findUnique({ where: { id: 'global' } })
    .then((s) => s?.aiProvider ?? null);

  const result: GenerateImagesResult = {
    metas,
    content: article.content,
    featuredImage: article.featuredImage,
    generated: 0,
    errors: [],
  };

  const inBodyMetas = metas.filter((m) => m.imageId !== 'hero');
  const heroMeta = metas.find((m) => m.imageId === 'hero');

  const needInBody = hasSelection
    ? inBodyMetas.filter((m) => selectedIds.has(m.imageId))
    : inBodyMetas.filter((m) => m.status !== 'done');
  const needHero =
    heroMeta &&
    includeHeroSelected &&
    (hasSelection ? selectedIds.has('hero') : heroMeta.status !== 'done');

  // Generate in-body images with controlled concurrency.
  if (needInBody.length > 0) {
    const urlByIndex = await mapLimit(
      needInBody,
      2,
      async (m) => {
        const idx = inBodyMetas.indexOf(m);
        const gen = await generateOne(
          config,
          m,
          article.category,
          `${article.slug}-img-${idx + 1}`,
          textProvider
        );
        const updated: StoredImageMeta = { ...m, url: gen.url, kind: gen.kind, status: 'done' };
        return updated;
      }
    );

    for (const updated of urlByIndex) {
      const idx = metas.findIndex((m) => m.imageId === updated.imageId);
      metas[idx] = updated;
    }
    result.generated += needInBody.length;
  }

  // Generate hero image.
  if (needHero && heroMeta) {
    try {
      const updated = await generateOne(
        config,
        heroMeta,
        article.category,
        `${article.slug}-hero`,
        textProvider
      );
      heroMeta.url = updated.url;
      heroMeta.kind = updated.kind;
      heroMeta.status = 'done';
      result.featuredImage = updated.url ?? result.featuredImage;
      result.generated += 1;
    } catch (error) {
      heroMeta.status = 'error';
      result.errors.push({
        imageId: 'hero',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Apply URLs to content.
  const orderedUrls = inBodyMetas.map((m) => m.url ?? PENDING_IMAGE_SRC);
  result.content = replaceImageSources(setPendingPlaceholderSrc(article.content), orderedUrls);
  result.metas = metas;

  // Persist to database.
  await prisma.article.update({
    where: { id: article.id },
    data: {
      content: result.content,
      imageMeta: serializeImageMeta(metas),
      featuredImage: result.featuredImage,
    },
  });

  log('info', 'image_pipeline', 'Images generated', {
    slug: article.slug,
    generated: result.generated,
    errors: result.errors.length,
    style: config.style,
    provider: config.provider,
  });

  return result;
}
