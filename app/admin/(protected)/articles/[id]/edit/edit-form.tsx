'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ArticleDraft = {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  seoTitle: string;
  seoDesc: string;
  isPublished: boolean;
};

export default function EditArticleForm({ article }: { article: ArticleDraft }) {
  const router = useRouter();
  const [form, setForm] = useState(article);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  function set<K extends keyof ArticleDraft>(key: K, value: ArticleDraft[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
      setStatus('saved');
      router.refresh();
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#a1a1aa',
    marginBottom: '0.5rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: '#111',
    border: '1px solid #27272a',
    borderRadius: '0.75rem',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Title</label>
          <input style={inputStyle} value={form.title} onChange={(e) => set('title', e.target.value)} required />
        </div>
        <div>
          <label style={labelStyle}>Slug</label>
          <input style={inputStyle} value={form.slug} onChange={(e) => set('slug', e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Category</label>
          <input style={inputStyle} value={form.category} onChange={(e) => set('category', e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.75rem' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>SEO Title</label>
          <input style={inputStyle} value={form.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>SEO Description</label>
          <input style={inputStyle} value={form.seoDesc} onChange={(e) => set('seoDesc', e.target.value)} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Content (HTML)</label>
        <textarea
          value={form.content}
          onChange={(e) => set('content', e.target.value)}
          rows={18}
          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6, resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
        {status === 'saved' && (
          <span style={{ color: '#00f2fe', fontWeight: 600, fontSize: '0.875rem' }}>✓ Changes saved</span>
        )}
        {status === 'error' && (
          <span style={{ color: '#fe0979', fontWeight: 600, fontSize: '0.875rem' }}>✗ Failed to save</span>
        )}
      </div>
    </form>
  );
}