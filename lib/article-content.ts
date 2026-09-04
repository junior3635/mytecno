export type ImageMeta = {
  image_id: string;
  section?: string;
  purpose?: string;
  alt?: string;
  caption?: string;
  prompt: string;
  aspect_ratio?: string;
  style?: string;
};

export type ArticlePayload = {
  html: string;
  images: ImageMeta[];
};

export type ExtractedImage = { id: string; prompt: string };

const IMAGE_PROMPT_DIV_RE = /<div\b[^>]*class="[^"]*\bimage-prompt\b[^"]*"[^>]*>[\s\r\n]*<\/div>/gi;

function extractDataAttribute(block: string, name: string): string {
  const re = new RegExp(`\\b${name}="([^"]*)"`);
  const match = re.exec(block);
  return match ? match[1] : '';
}

export function extractImagePrompts(html: string): ExtractedImage[] {
  const results: ExtractedImage[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(IMAGE_PROMPT_DIV_RE.source, 'gi');

  while ((match = re.exec(html)) !== null) {
    const id = extractDataAttribute(match[0], 'data-image-id');
    const prompt = extractDataAttribute(match[0], 'data-image-prompt');
    if (id && prompt) {
      results.push({ id, prompt });
    }
  }

  return results;
}

export function stripImagePromptBlocks(html: string): string {
  return html.replace(IMAGE_PROMPT_DIV_RE, '');
}

export function replaceImageSources(html: string, urls: string[]): string {
  let index = 0;
  return html.replace(/<img\b[^>]*\bsrc="[^"]*"[^>]*>/gi, (tag) => {
    if (index >= urls.length) return tag;
    const url = urls[index++];
    return tag.replace(/\bsrc="[^"]*"/, `src="${url}"`);
  });
}

function tryParsePayload(text: string): ArticlePayload | null {
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;

  try {
    const parsed = JSON.parse(cleaned.slice(first, last + 1));
    if (typeof parsed?.html !== 'string') return null;

    const images = Array.isArray(parsed.images)
      ? parsed.images
          .filter(
            (img: unknown): img is ImageMeta => !!img && typeof img === 'object' && typeof (img as ImageMeta).prompt === 'string' && (img as ImageMeta).prompt.length > 0
          )
          .map((img: ImageMeta) => ({
            image_id: typeof img.image_id === 'string' && img.image_id ? img.image_id : 'image-0',
            section: typeof img.section === 'string' ? img.section : '',
            purpose: typeof img.purpose === 'string' ? img.purpose : '',
            alt: typeof img.alt === 'string' ? img.alt : '',
            caption: typeof img.caption === 'string' ? img.caption : '',
            prompt: img.prompt,
            aspect_ratio: typeof img.aspect_ratio === 'string' ? img.aspect_ratio : '16:9',
            style: typeof img.style === 'string' ? img.style : 'professional technology editorial',
          }))
      : [];

    return { html: parsed.html, images };
  } catch {
    return null;
  }
}

export function parseArticlePayload(text: string): ArticlePayload {
  const parsed = tryParsePayload(text);
  if (parsed && parsed.images.length > 0) {
    return parsed;
  }

  const legacy = extractImagePrompts(text);
  if (legacy.length > 0) {
    return {
      html: stripImagePromptBlocks(text),
      images: legacy.map((img) => ({
        image_id: img.id,
        prompt: img.prompt,
      })) as ImageMeta[],
    };
  }

  return parsed ?? { html: text, images: [] };
}