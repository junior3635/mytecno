import { describe, it, expect } from 'vitest';
import { parseArticlePayload, replaceImageSources, extractImagePrompts } from './article-content';

describe('parseArticlePayload', () => {
  it('parses a structured JSON payload with image metadata', () => {
    const raw = JSON.stringify({
      html: '<div class="article-intro"><p>Hello</p></div><figure class="article-image"><img src="[IMAGE_URL_OR_GENERATED_IMAGE]" alt="A chip"><figcaption>Chip</figcaption></figure>',
      images: [
        { image_id: 'image-1', section: 'Intro', purpose: 'Chip', alt: 'A chip', caption: 'Chip', prompt: 'Photoreal chip 16:9', aspect_ratio: '16:9', style: 'editorial' },
      ],
    });

    const parsed = parseArticlePayload(raw);
    expect(parsed.html).toContain('article-intro');
    expect(parsed.images).toHaveLength(1);
    expect(parsed.images[0].prompt).toBe('Photoreal chip 16:9');
  });

  it('strips markdown code fences around JSON', () => {
    const raw = '```json\n' + JSON.stringify({ html: '<p>ok</p>', images: [] }) + '\n```';
    const parsed = parseArticlePayload(raw);
    expect(parsed.html).toBe('<p>ok</p>');
  });

  it('filters out image entries without a prompt', () => {
    const raw = JSON.stringify({
      html: '<p>x</p>',
      images: [
        { prompt: 'real' },
        { prompt: '' },
        { prompt: '  ' },
      ],
    });
    const parsed = parseArticlePayload(raw);
    expect(parsed.images).toHaveLength(1);
    expect(parsed.images[0].prompt).toBe('real');
  });

  it('falls back to legacy image-prompt divs when there is no JSON', () => {
    const html = '<div class="image-prompt" data-image-id="image-1" data-image-prompt="A GPU board"></div><p>Body</p>';
    const parsed = parseArticlePayload(html);
    expect(parsed.images).toHaveLength(1);
    expect(parsed.images[0].prompt).toBe('A GPU board');
    expect(parsed.html).not.toContain('image-prompt');
  });

  it('returns raw html when no images at all', () => {
    const parsed = parseArticlePayload('<p>plain</p>');
    expect(parsed.html).toBe('<p>plain</p>');
    expect(parsed.images).toHaveLength(0);
  });
});

describe('replaceImageSources', () => {
  it('replaces image sources in order', () => {
    const html = '<img src="a"><figure><img src="b"></figure><img src="c">';
    const out = replaceImageSources(html, ['/x.jpg', '/y.jpg']);
    expect(out).toBe('<img src="/x.jpg"><figure><img src="/y.jpg"></figure><img src="c">');
  });

  it('leaves html untouched when no urls provided', () => {
    const html = '<img src="a">';
    expect(replaceImageSources(html, [])).toBe(html);
  });
});

describe('extractImagePrompts', () => {
  it('extracts id and prompt from legacy blocks', () => {
    const html = '<div class="image-prompt" data-image-id="image-1" data-image-prompt="First"></div><div class="image-prompt" data-image-id="image-2" data-image-prompt="Second"></div>';
    const result = extractImagePrompts(html);
    expect(result).toEqual([
      { id: 'image-1', prompt: 'First' },
      { id: 'image-2', prompt: 'Second' },
    ]);
  });
});