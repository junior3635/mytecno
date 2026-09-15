'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import CategoryBadge from '@/components/article/category-badge';
import ArticleImage from '@/components/article/image';
import { RecipeMeta, RecipeIngredients, RecipeInstructions } from '@/components/article/recipe';
import { categoryKey, formatDate, readingTime } from '@/lib/format';

export type PreviewArticle = {
  title: string;
  slug?: string;
  seoDesc?: string | null;
  category?: string;
  categorySlug?: string | null;
  featuredImage?: string | null;
  content: string;
  createdAt?: string | Date | null;
  isPublished?: boolean;
  recipeIngredients?: string[] | string | null;
  recipeInstructions?: string[] | string | null;
  recipePrepMin?: number | null;
  recipeCookMin?: number | null;
  recipeServings?: number | null;
  recipeDifficulty?: string | null;
  recipeCalories?: number | null;
};

type DeviceId = 'desktop' | 'tablet' | 'phone';

const DEVICE_OPTIONS: { id: DeviceId; label: string; width: string }[] = [
  { id: 'desktop', label: 'Desktop', width: '100%' },
  { id: 'tablet', label: 'Tablet', width: '780px' },
  { id: 'phone', label: 'Phone', width: '390px' },
];

const AD_MARKER = /<div class="ad-slot-insert"><\/div>/gi;

function toArray(v: string[] | string | null | undefined): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter((s) => typeof s === 'string');
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

function buildToc(html: string): { html: string; toc: { id: string; text: string }[] } {
  const toc: { id: string; text: string }[] = [];
  const out = html.replace(/<h2[^>]*>[\s\S]*?<\/h2>/gi, (heading) => {
    const text = heading.replace(/<[^>]+>/g, '').trim();
    const id = `sec-${toc.length}`;
    toc.push({ id, text });
    return heading.replace(/^<h2/, `<h2 id="${id}"`);
  });
  return { html: out, toc };
}

export default function ArticlePreview({
  article,
  onClose,
}: {
  article: PreviewArticle;
  onClose: () => void;
}) {
  const [device, setDevice] = useState<DeviceId>('desktop');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const categorySlug = article.categorySlug ?? categoryKey(article.category ?? 'Technology');
  const isFood = categorySlug === 'food';
  const ingredients = toArray(article.recipeIngredients);
  const instructions = toArray(article.recipeInstructions);
  const hasRecipe = isFood && (ingredients.length > 0 || instructions.length > 0);
  const readMin = readingTime(article.content || '');

  const { html, toc } = useMemo(() => {
    const safe = DOMPurify.sanitize(article.content || '');
    return buildToc(safe);
  }, [article.content]);

  const prose = useMemo(() => {
    const withAds = html.replace(AD_MARKER, '<div class="ad-placeholder"><span>Advertisement</span></div>');
    return withAds;
  }, [html]);

  const activeWidth = DEVICE_OPTIONS.find((d) => d.id === device)!.width;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        backgroundColor: 'rgba(7,7,7,0.86)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.25rem',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Article preview of ${article.title}`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(1080px, 100%)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100%',
          outline: 'none',
        }}
      >
        {/* Chrome bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            paddingBottom: '1rem',
            color: '#a1a1aa',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Preview</span>
            {!article.isPublished && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.6rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(254,9,121,0.5)',
                  color: '#fe0979',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fe0979' }} />
                Draft
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              role="group"
              aria-label="Preview device"
              style={{
                display: 'flex',
                padding: '0.2rem',
                borderRadius: '9999px',
                border: '1px solid #27272a',
                background: '#0a0a0a',
              }}
            >
              {DEVICE_OPTIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDevice(d.id)}
                  aria-pressed={device === d.id}
                  style={{
                    padding: '0.3rem 0.85rem',
                    borderRadius: '9999px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: device === d.id ? '#1f1f1f' : 'transparent',
                    color: device === d.id ? '#fff' : '#71717a',
                    cursor: 'pointer',
                    transition: 'background-color .18s, color .18s',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              style={{
                width: '2.1rem',
                height: '2.1rem',
                border: '1px solid #27272a',
                borderRadius: '9999px',
                background: 'transparent',
                color: '#a1a1aa',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Device frame */}
        <div
          style={{
            alignSelf: 'center',
            width: activeWidth,
            maxWidth: '100%',
            transition: 'width .35s cubic-bezier(.22,1,.36,1)',
            overflow: 'hidden',
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              background: 'var(--bg-color, var(--paper))',
              border: '1px solid #2b2b2b',
              borderRadius: device === 'phone' ? '1.75rem' : '0.75rem',
              outline: 'none',
            }}
          >
            <div className="article-page" style={{ paddingTop: '2rem' }}>
              <div className="container">
                <article className={toc.length >= 3 ? 'article-wrap article-wrap--toc' : 'article-wrap'}>
                  <nav className="breadcrumb" aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>Home</span>
                    <span className="breadcrumb__sep" aria-hidden="true">/</span>
                    <span>{article.category || categorySlug}</span>
                    <span className="breadcrumb__sep" aria-hidden="true">/</span>
                    <span aria-current="page" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {article.title}
                    </span>
                  </nav>

                  <header className="article-header">
                    <CategoryBadge slug={categorySlug} label={article.category || 'Technology'} />
                    <h1 className="article-header__title">{article.title}</h1>
                    {article.seoDesc && <p className="article-header__dek">{article.seoDesc}</p>}
                    <div className="meta-line">
                      <span>{formatDate(article.createdAt ? new Date(article.createdAt) : new Date())}</span>
                      <span>{readMin} min read</span>
                    </div>
                    <RecipeMeta
                      article={{
                        recipePrepMin: article.recipePrepMin ?? null,
                        recipeCookMin: article.recipeCookMin ?? null,
                        recipeServings: article.recipeServings ?? null,
                        recipeDifficulty: article.recipeDifficulty ?? '',
                        recipeCalories: article.recipeCalories ?? null,
                      }}
                    />
                  </header>

                  {article.featuredImage && (
                    <div className="article-hero">
                      <ArticleImage
                        src={article.featuredImage}
                        alt={article.title}
                        ratio="16 / 9"
                        eager
                        sizes="(min-width: 700px) 720px, 100vw"
                      />
                    </div>
                  )}

                  {hasRecipe && (
                    <div className="recipe-grid">
                      <RecipeIngredients article={{ recipeIngredients: article.recipeIngredients ?? null }} />
                      <RecipeInstructions article={{ recipeInstructions: article.recipeInstructions ?? null }} />
                    </div>
                  )}

                  {toc.length >= 3 ? (
                    <div className="article-layout">
                      <div className="prose" dangerouslySetInnerHTML={{ __html: prose }} />
                      <aside className="toc-rail" aria-label="Table of contents">
                        <p className="toc-rail__label">In this story</p>
                        <ol className="toc-rail__list">
                          {toc.map((item) => (
                            <li key={item.id}>
                              <a href={`#${item.id}`} className="toc-rail__link">
                                {item.text}
                              </a>
                            </li>
                          ))}
                        </ol>
                      </aside>
                    </div>
                  ) : (
                    <div className="prose" dangerouslySetInnerHTML={{ __html: prose }} />
                  )}
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
