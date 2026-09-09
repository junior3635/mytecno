'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';

type ArticleDraft = {
  id: string;
  title: string;
  slug: string;
  category: string;
  categorySlug: string | null;
  content: string;
  seoTitle: string;
  seoDesc: string;
  featuredImage: string;
  isPublished: boolean;
};

const TITLE_MAX = 60;
const DESC_MAX = 155;

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
}

export default function EditArticleForm({ article }: { article: ArticleDraft }) {
  const router = useRouter();
  const [form, setForm] = useState(article);
  const [savedSnapshot, setSavedSnapshot] = useState<ArticleDraft>(article);
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(savedSnapshot), [form, savedSnapshot]);
  const sanitizedHtml = useMemo(
    () => DOMPurify.sanitize(form.content || ''),
    [form.content]
  );
  const words = useMemo(() => countWords(form.content || ''), [form.content]);

  function set<K extends keyof ArticleDraft>(key: K, value: ArticleDraft[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCategories(data?.categories || []))
      .catch(() => {});
  }, []);

  // If the article predates dynamic categories, match its stored name to a slug.
  const matchedByNameSlug =
    !form.categorySlug && form.category
      ? categories.find((c) => c.name.toLowerCase() === form.category.toLowerCase())?.slug ?? ''
      : '';
  const effectiveCategorySlug = form.categorySlug || matchedByNameSlug;

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  function onCategoryChange(slug: string) {
    const cat = categories.find((c) => c.slug === slug);
    set('categorySlug', slug);
    if (cat) set('category', cat.name);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus('idle');

    try {
      const res = await fetch(`/api/articles/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to save');

      setSavedSnapshot({ ...form });
      setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setStatus('saved');
      router.refresh();
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  const serpTitle = (form.seoTitle || form.title || '').trim();
  const serpDesc = (form.seoDesc || '').trim();
  const titleLen = (form.seoTitle || '').length;
  const descLen = (form.seoDesc || '').length;

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 360px', minWidth: 0 }}>
          <label className="admin-label">Title</label>
          <input className="admin-input" value={form.title} onChange={(e) => set('title', e.target.value)} required />
        </div>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <label className="admin-label">Slug</label>
          <input className="admin-input" value={form.slug} onChange={(e) => set('slug', e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <label className="admin-label">Category</label>
          <select
            value={effectiveCategorySlug}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="admin-input"
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <label className="admin-label">Featured image URL or path</label>
          <input
            className="admin-input"
            value={form.featuredImage}
            onChange={(e) => set('featuredImage', e.target.value)}
            placeholder="/uploads/slug.jpg"
          />
        </div>
        <div style={{ flex: '1 1 200px', minWidth: 0, display: 'flex', alignItems: 'flex-end', paddingBottom: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => set('isPublished', e.target.checked)}
              style={{ width: '1.1rem', height: '1.1rem', accentColor: '#00f2fe' }}
            />
            <span style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Published (public)</span>
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 360px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label className="admin-label">SEO title</label>
            <span style={{ fontSize: '0.7rem', color: titleLen > TITLE_MAX ? '#fe0979' : '#52525b' }}>
              {titleLen}/{TITLE_MAX}
            </span>
          </div>
          <input className="admin-input" value={form.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} />
        </div>
        <div style={{ flex: '1 1 360px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label className="admin-label">SEO description</label>
            <span style={{ fontSize: '0.7rem', color: descLen > DESC_MAX ? '#fe0979' : '#52525b' }}>
              {descLen}/{DESC_MAX}
            </span>
          </div>
          <input className="admin-input" value={form.seoDesc} onChange={(e) => set('seoDesc', e.target.value)} />
        </div>
      </div>

      {/* SERP preview — a literal Google result, so length problems are visible instantly. */}
      <div style={{ backgroundColor: '#fff', borderRadius: '0.75rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ fontSize: '0.68rem', color: '#70757a', marginBottom: '0.4rem' }}>Search result preview</div>
        <div style={{ color: '#202124', fontSize: '0.875rem', lineHeight: 1.45 }}>mytecno.example</div>
        <div style={{ color: '#1a0dab', fontSize: '1rem', fontWeight: 700, lineHeight: 1.35, margin: '0.15rem 0' }}>
          {(serpTitle || 'Article title appears here').slice(0, 70)}
        </div>
        <div style={{ color: '#4d5156', fontSize: '0.8rem', lineHeight: 1.5 }}>
          {(serpDesc || 'The meta description appears here, up to about 155 characters of crisp summary text.')
            .slice(0, 160)}
        </div>
      </div>

      {/* Editor + live preview */}
      <div>
        <label className="admin-label">
          Content (HTML) <span style={{ color: '#52525b', fontWeight: 400 }}>· {words} words</span>
        </label>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <textarea
            value={form.content}
            onChange={(e) => set('content', e.target.value)}
            rows={22}
            className="admin-input"
            style={{ flex: '1 1 360px', minWidth: 0, fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6, resize: 'vertical' }}
          />
          <div
            style={{
              flex: '1 1 360px',
              minWidth: 0,
              maxHeight: '560px',
              overflow: 'auto',
              backgroundColor: '#0d0d0d',
              border: '1px solid #1f1f1f',
              borderRadius: '0.75rem',
              padding: '1.25rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#52525b', marginBottom: '0.75rem' }}>Live preview</div>
            {form.featuredImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.featuredImage}
                alt="Featured"
                style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '0.75rem', border: '1px solid #1f1f1f', marginBottom: '1rem' }}
              />
            )}
            {form.content.trim() ? (
              <div className="article-body" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
            ) : (
              <p style={{ fontSize: '0.8rem', color: '#52525b' }}>Empty content. Start writing or paste article HTML.</p>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '0.875rem 2rem',
            background: saving ? '#27272a' : 'linear-gradient(90deg, #00f2fe, #fe0979)',
            border: 'none',
            borderRadius: '0.75rem',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {dirty && (
          <span style={{ color: '#a1a1aa', fontWeight: 600, fontSize: '0.8rem' }}>
            Unsaved changes
          </span>
        )}
        {status === 'saved' && !dirty && (
          <span style={{ color: '#00f2fe', fontWeight: 600, fontSize: '0.875rem' }}>
            Saved{savedAt ? ` at ${savedAt}` : ''}
          </span>
        )}
        {status === 'error' && (
          <span style={{ color: '#fe0979', fontWeight: 600, fontSize: '0.875rem' }}>
            Failed to save. Try again.
          </span>
        )}
      </div>
    </form>
  );
}